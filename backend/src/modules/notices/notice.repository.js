import { getExecutor } from '../../config/database.js';

// 고정 공지가 먼저, 그다음 최신순 (API 명세 9장, DB 설계서 4.17 idx_notices_status_pinned_created)
const ORDER_BY = 'n.is_pinned DESC, n.created_at DESC, n.id DESC';

const selectColumns = (withBody) => `n.id, n.title,${withBody ? ' n.body,' : ''}
       n.is_pinned, n.created_at, n.updated_at,
       u.id AS author_id,
       u.nickname AS author_nickname,
       u.profile_image_url AS author_profile_image_url,
       u.status AS author_status`;

// 삭제된 공지는 사용자 화면과 관리자 목록 모두에서 뺀다 (API 명세 10.7 DELETE)
export const findActiveNotices = async ({ limit, offset, withBody }) => {
  const [rows] = await getExecutor().query(
    `SELECT ${selectColumns(withBody)}
     FROM notices n
     JOIN users u ON u.id = n.author_id
     WHERE n.status = 'active'
     ORDER BY ${ORDER_BY}
     LIMIT ? OFFSET ?`,
    [limit, offset],
  );

  return rows;
};

export const countActiveNotices = async () => {
  const [rows] = await getExecutor().query(
    "SELECT COUNT(*) AS total_count FROM notices WHERE status = 'active'",
  );

  return rows[0].total_count;
};

export const findActiveNoticeById = async (noticeId) => {
  const [rows] = await getExecutor().query(
    `SELECT ${selectColumns(true)}
     FROM notices n
     JOIN users u ON u.id = n.author_id
     WHERE n.id = ? AND n.status = 'active'`,
    [noticeId],
  );

  return rows[0] ?? null;
};

// 다른 관리자의 수정·삭제와 겹치지 않도록 공지 행을 잠그고 읽는다
export const findActiveNoticeByIdForUpdate = async (noticeId) => {
  const [rows] = await getExecutor().query(
    "SELECT id, title, body, is_pinned FROM notices WHERE id = ? AND status = 'active' FOR UPDATE",
    [noticeId],
  );

  return rows[0] ?? null;
};

export const createNotice = async ({ authorId, title, body, isPinned }) => {
  const [result] = await getExecutor().query(
    'INSERT INTO notices (author_id, title, body, is_pinned) VALUES (?, ?, ?, ?)',
    [authorId, title, body, isPinned],
  );

  return result.insertId;
};

export const updateNotice = async (noticeId, { title, body, isPinned }) => {
  await getExecutor().query('UPDATE notices SET title = ?, body = ?, is_pinned = ? WHERE id = ?', [
    title,
    body,
    isPinned,
    noticeId,
  ]);
};

export const deleteNotice = async (noticeId) => {
  await getExecutor().query(
    "UPDATE notices SET status = 'deleted', deleted_at = CURRENT_TIMESTAMP(3) WHERE id = ?",
    [noticeId],
  );
};
