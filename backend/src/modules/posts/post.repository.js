import { escapeLikePattern } from '../../common/utils/sql.js';
import { getExecutor } from '../../config/database.js';

// 사용자 화면에는 status = 'active' 인 게시글만 보인다 (숨김·삭제 제외, API 명세 1.7)

const POST_COLUMNS = `
  p.id,
  p.title,
  p.view_count,
  p.edited_at,
  p.created_at,
  u.id AS author_id,
  u.nickname AS author_nickname,
  u.profile_image_url AS author_profile_image_url,
  u.status AS author_status,
  (SELECT COUNT(*) FROM comments c WHERE c.post_id = p.id AND c.status = 'active')
    AS comment_count`;

const ORDER_BY = {
  latest: 'p.created_at DESC, p.id DESC',
  oldest: 'p.created_at ASC, p.id ASC',
};

const buildWhereClause = (filter) => {
  const conditions = ["p.status = 'active'"];
  const params = [];

  if (filter.keyword !== undefined) {
    conditions.push('p.title LIKE ?');
    params.push(`%${escapeLikePattern(filter.keyword)}%`);
  }

  if (filter.authorId !== undefined) {
    conditions.push('p.author_id = ?');
    params.push(filter.authorId);
  }

  return { where: conditions.join(' AND '), params };
};

export const findPosts = async ({ filter, sort, limit, offset }) => {
  const { where, params } = buildWhereClause(filter);
  const [rows] = await getExecutor().query(
    `SELECT ${POST_COLUMNS}
     FROM posts p
     JOIN users u ON u.id = p.author_id
     WHERE ${where}
     ORDER BY ${ORDER_BY[sort]}
     LIMIT ? OFFSET ?`,
    [...params, limit, offset],
  );

  return rows;
};

export const countPosts = async (filter) => {
  const { where, params } = buildWhereClause(filter);
  const [rows] = await getExecutor().query(
    `SELECT COUNT(*) AS total_count FROM posts p WHERE ${where}`,
    params,
  );

  return rows[0].total_count;
};

export const findPostById = async (postId) => {
  const [rows] = await getExecutor().query(
    `SELECT ${POST_COLUMNS}, p.body
     FROM posts p
     JOIN users u ON u.id = p.author_id
     WHERE p.id = ? AND p.status = 'active'`,
    [postId],
  );

  return rows[0] ?? null;
};

export const findPostByIdForUpdate = async (postId) => {
  const [rows] = await getExecutor().query(
    'SELECT id, author_id, status FROM posts WHERE id = ? FOR UPDATE',
    [postId],
  );

  return rows[0] ?? null;
};

// 댓글 등록 중에 게시글이 삭제되지 않도록 공유 잠금을 건다. 게시글 삭제는 FOR UPDATE로 기다린다
export const findPostByIdForShare = async (postId) => {
  const [rows] = await getExecutor().query(
    'SELECT id, author_id, status FROM posts WHERE id = ? FOR SHARE',
    [postId],
  );

  return rows[0] ?? null;
};

export const createPost = async ({ authorId, title, body }) => {
  const [result] = await getExecutor().query(
    'INSERT INTO posts (author_id, title, body) VALUES (?, ?, ?)',
    [authorId, title, body],
  );

  return result.insertId;
};

export const updatePost = async (postId, { title, body, editedAt }) => {
  const columns = { title, body, edited_at: editedAt };
  const entries = Object.entries(columns).filter(([, value]) => value !== undefined);

  await getExecutor().query(
    `UPDATE posts SET ${entries.map(([column]) => `${column} = ?`).join(', ')} WHERE id = ?`,
    [...entries.map(([, value]) => value), postId],
  );
};

export const deletePost = async (postId) => {
  await getExecutor().query(
    "UPDATE posts SET status = 'deleted', deleted_at = NOW(3) WHERE id = ?",
    [postId],
  );
};

export const updatePostViewCount = async (postId) => {
  await getExecutor().query('UPDATE posts SET view_count = view_count + 1 WHERE id = ?', [postId]);
};
