import { pool } from '../../config/database.js';

/* 사용자 화면에는 status = 'active' 인 댓글만 보인다 (숨김·삭제 제외, API_SPEC 1.7) */

const COMMENT_COLUMNS = `
  c.id, c.body, c.author_id, c.created_at,
  u.nickname          AS author_nickname,
  u.profile_image_url AS author_profile_image_url,
  u.status            AS author_status`;

export const findCommentsByPostId = async (postId, { limit, offset }) => {
  const [rows] = await pool.query(
    `SELECT ${COMMENT_COLUMNS}
       FROM comments c
       JOIN users u ON u.id = c.author_id
      WHERE c.post_id = ? AND c.status = 'active'
      ORDER BY c.created_at ASC, c.id ASC
      LIMIT ? OFFSET ?`,
    [postId, limit, offset],
  );

  return rows;
};

export const countCommentsByPostId = async (postId) => {
  const [[row]] = await pool.query(
    "SELECT COUNT(*) AS total FROM comments WHERE post_id = ? AND status = 'active'",
    [postId],
  );

  return Number(row.total);
};

export const findActiveCommentById = async (commentId) => {
  const [rows] = await pool.query(
    `SELECT ${COMMENT_COLUMNS}
       FROM comments c
       JOIN users u ON u.id = c.author_id
      WHERE c.id = ? AND c.status = 'active'`,
    [commentId],
  );

  return rows[0] ?? null;
};

/** 삭제 전에 행을 잠그고 읽는다 */
export const findActiveCommentByIdForUpdate = async (connection, commentId) => {
  const [rows] = await connection.query(
    "SELECT id, author_id FROM comments WHERE id = ? AND status = 'active' FOR UPDATE",
    [commentId],
  );

  return rows[0] ?? null;
};

export const createComment = async (connection, { postId, authorId, body }) => {
  const [result] = await connection.query(
    'INSERT INTO comments (post_id, author_id, body) VALUES (?, ?, ?)',
    [postId, authorId, body],
  );

  return result.insertId;
};

export const deleteComment = async (connection, commentId) => {
  await connection.query(
    "UPDATE comments SET status = 'deleted', deleted_at = NOW(3) WHERE id = ?",
    [commentId],
  );
};

/** 게시글 삭제 시 하위 댓글도 삭제 상태로. 이미 숨김인 댓글도 함께 삭제한다 */
export const deleteCommentsByPostId = async (connection, postId) => {
  await connection.query(
    `UPDATE comments SET status = 'deleted', deleted_at = NOW(3)
      WHERE post_id = ? AND status <> 'deleted'`,
    [postId],
  );
};
