import { pool } from '../../config/database.js';
import { escapeLike } from '../../common/utils/request.js';

/*
 * 트랜잭션 안에서 부를 수 있도록 쓰기 함수는 첫 인자로 connection 을 받는다.
 * 사용자 화면에는 status = 'active' 인 게시글만 보인다 (숨김·삭제 제외, API_SPEC 1.7).
 */

const POST_SUMMARY_COLUMNS = `
  p.id, p.title, p.view_count, p.author_id, p.created_at, p.edited_at,
  u.nickname          AS author_nickname,
  u.profile_image_url AS author_profile_image_url,
  u.status            AS author_status,
  (SELECT COUNT(*) FROM comments c WHERE c.post_id = p.id AND c.status = 'active') AS comment_count`;

const SORT_ORDER = {
  latest: 'p.created_at DESC, p.id DESC',
  oldest: 'p.created_at ASC, p.id ASC',
};

const buildPostFilter = ({ keyword, authorId }) => {
  const conditions = ["p.status = 'active'"];
  const params = [];

  if (keyword !== null) {
    conditions.push('p.title LIKE ?');
    params.push(`%${escapeLike(keyword)}%`);
  }

  if (authorId !== null) {
    conditions.push('p.author_id = ?');
    params.push(authorId);
  }

  return { where: conditions.join(' AND '), params };
};

export const findPosts = async ({ keyword, authorId, sort, limit, offset }) => {
  const { where, params } = buildPostFilter({ keyword, authorId });
  const [rows] = await pool.query(
    `SELECT ${POST_SUMMARY_COLUMNS}
       FROM posts p
       JOIN users u ON u.id = p.author_id
      WHERE ${where}
      ORDER BY ${SORT_ORDER[sort]}
      LIMIT ? OFFSET ?`,
    [...params, limit, offset],
  );

  return rows;
};

export const countPosts = async ({ keyword, authorId }) => {
  const { where, params } = buildPostFilter({ keyword, authorId });
  const [[row]] = await pool.query(`SELECT COUNT(*) AS total FROM posts p WHERE ${where}`, params);

  return Number(row.total);
};

export const findActivePostById = async (postId, db = pool) => {
  const [rows] = await db.query(
    `SELECT ${POST_SUMMARY_COLUMNS}, p.body
       FROM posts p
       JOIN users u ON u.id = p.author_id
      WHERE p.id = ? AND p.status = 'active'`,
    [postId],
  );

  return rows[0] ?? null;
};

/** 수정·삭제 전에 행을 잠그고 읽는다 (동시에 수정·삭제하는 요청 방지) */
export const findActivePostByIdForUpdate = async (connection, postId) => {
  const [rows] = await connection.query(
    "SELECT id, author_id FROM posts WHERE id = ? AND status = 'active' FOR UPDATE",
    [postId],
  );

  return rows[0] ?? null;
};

export const createPost = async (connection, { authorId, title, body }) => {
  const [result] = await connection.query(
    'INSERT INTO posts (author_id, title, body) VALUES (?, ?, ?)',
    [authorId, title, body],
  );

  return result.insertId;
};

/** 보낸 필드만 바꾸고 수정 시각(edited_at)을 기록한다 */
export const updatePost = async (connection, postId, { title, body }) => {
  const sets = ['edited_at = NOW(3)'];
  const params = [];

  if (title !== undefined) {
    sets.push('title = ?');
    params.push(title);
  }

  if (body !== undefined) {
    sets.push('body = ?');
    params.push(body);
  }

  await connection.query(`UPDATE posts SET ${sets.join(', ')} WHERE id = ?`, [...params, postId]);
};

export const deletePost = async (connection, postId) => {
  await connection.query("UPDATE posts SET status = 'deleted', deleted_at = NOW(3) WHERE id = ?", [
    postId,
  ]);
};

/**
 * 조회 기록을 남기고, 조회수를 올려야 하면 true.
 * 같은 조회자가 24시간 안에 다시 보면 last_viewed_at 을 바꾸지 않으므로 affectedRows 가 0 이다.
 * (1 = 처음 조회해서 새 행, 2 = 24시간이 지나 갱신)
 */
export const recordPostView = async (connection, postId, viewerKey) => {
  const [result] = await connection.query(
    `INSERT INTO view_histories (target_type, target_id, viewer_key, last_viewed_at)
     VALUES ('post', ?, ?, NOW(3)) AS new_view
     ON DUPLICATE KEY UPDATE
       last_viewed_at = IF(view_histories.last_viewed_at <= NOW(3) - INTERVAL 24 HOUR,
                           new_view.last_viewed_at,
                           view_histories.last_viewed_at)`,
    [postId, viewerKey],
  );

  return result.affectedRows > 0;
};

export const increasePostViewCount = async (connection, postId) => {
  await connection.query('UPDATE posts SET view_count = view_count + 1 WHERE id = ?', [postId]);
};
