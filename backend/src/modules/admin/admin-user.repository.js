import { escapeLikePattern } from '../../common/utils/sql.js';
import { getExecutor } from '../../config/database.js';

// 걸려 있는 제재: 관리자가 해제하지 않았고 기간이 남은 것 (DB 설계서 4.3, users 모듈과 같은 기준)
const ACTIVE_SANCTION =
  's.released_at IS NULL AND (s.ends_at IS NULL OR s.ends_at > CURRENT_TIMESTAMP(3))';

const hasActiveSanction = (types) => `EXISTS (
  SELECT 1 FROM user_sanctions s
  WHERE s.user_id = u.id AND s.type IN (${types.map((type) => `'${type}'`).join(', ')})
    AND ${ACTIVE_SANCTION}
)`;

const HAS_SUSPEND = hasActiveSanction(['suspend']);
const HAS_RESTRICTION = hasActiveSanction(['write_ban', 'comment_ban']);

// status는 저장하지 않고 제재로 계산한다 (API 명세 10.2, DB 설계서 4.1)
const STATUS_CONDITIONS = {
  withdrawn: "u.status = 'withdrawn'",
  suspended: `u.status = 'active' AND ${HAS_SUSPEND}`,
  restricted: `u.status = 'active' AND NOT ${HAS_SUSPEND} AND ${HAS_RESTRICTION}`,
  active: `u.status = 'active' AND NOT ${HAS_SUSPEND} AND NOT ${HAS_RESTRICTION}`,
  // status를 보내지 않으면 탈퇴 회원을 뺀다
  all: "u.status = 'active'",
};

const ORDER_BY = {
  newest: 'u.created_at DESC, u.id DESC',
  oldest: 'u.created_at ASC, u.id ASC',
};

const buildWhereClause = (filter) => {
  const conditions = [STATUS_CONDITIONS[filter.status ?? 'all']];
  const params = [];

  if (filter.keyword !== undefined) {
    const pattern = `%${escapeLikePattern(filter.keyword)}%`;
    conditions.push('(u.username LIKE ? OR u.nickname LIKE ?)');
    params.push(pattern, pattern);
  }

  if (filter.role !== undefined) {
    conditions.push('u.role = ?');
    params.push(filter.role);
  }

  return { sql: `WHERE ${conditions.join(' AND ')}`, params };
};

export const findUsers = async ({ filter, sort, limit, offset }) => {
  const where = buildWhereClause(filter);

  const [rows] = await getExecutor().query(
    `SELECT u.id, u.username, u.nickname, u.role, u.status, u.withdrawn_at, u.created_at
     FROM users u
     ${where.sql}
     ORDER BY ${ORDER_BY[sort]}
     LIMIT ? OFFSET ?`,
    [...where.params, limit, offset],
  );

  return rows;
};

export const countUsers = async (filter) => {
  const where = buildWhereClause(filter);

  const [rows] = await getExecutor().query(
    `SELECT COUNT(*) AS total_count FROM users u ${where.sql}`,
    where.params,
  );

  return rows[0].total_count;
};

export const findUserById = async (userId) => {
  const [rows] = await getExecutor().query(
    `SELECT id, username, nickname, name, email, role, status, withdrawn_at, created_at
     FROM users
     WHERE id = ?`,
    [userId],
  );

  return rows[0] ?? null;
};

// 같은 회원에게 동시에 제재 요청이 와도 중복으로 걸리지 않도록 회원 행을 잠근다 (DB 설계서 4.3)
export const findUserByIdForUpdate = async (userId) => {
  const [rows] = await getExecutor().query(
    'SELECT id, role, status FROM users WHERE id = ? FOR UPDATE',
    [userId],
  );

  return rows[0] ?? null;
};

export const findActiveSanctionsByUserIds = async (userIds) => {
  if (userIds.length === 0) {
    return [];
  }

  const [rows] = await getExecutor().query(
    `SELECT s.user_id, s.type, s.ends_at
     FROM user_sanctions s
     WHERE s.user_id IN (?) AND ${ACTIVE_SANCTION}
     ORDER BY s.user_id, s.id`,
    [userIds],
  );

  return rows;
};

export const findActivePermissionsByUserIds = async (userIds) => {
  if (userIds.length === 0) {
    return [];
  }

  const [rows] = await getExecutor().query(
    `SELECT user_id, permission
     FROM user_permissions
     WHERE user_id IN (?) AND status = 'active'
     ORDER BY user_id, permission`,
    [userIds],
  );

  return rows;
};

// 질문·답변은 숨김을 포함하고 삭제만 빼며, 받은 신고는 신고자가 취소한 것만 뺀다 (API 명세 10.2)
export const countUserActivity = async (userId) => {
  const [rows] = await getExecutor().query(
    `SELECT
       (SELECT COUNT(*) FROM questions WHERE author_id = ? AND status <> 'deleted') AS question_count,
       (SELECT COUNT(*) FROM answers WHERE author_id = ? AND status <> 'deleted') AS answer_count,
       (SELECT COUNT(*) FROM reports WHERE target_author_id = ? AND status <> 'canceled')
         AS reports_received_count`,
    [userId, userId, userId],
  );

  return rows[0];
};

export const findSanctionsByUserId = async (userId) => {
  const [rows] = await getExecutor().query(
    `SELECT
       s.id,
       s.type,
       s.days,
       s.reason,
       s.starts_at,
       s.released_at,
       s.release_reason,
       a.id AS applied_by_id,
       a.nickname AS applied_by_nickname,
       a.profile_image_url AS applied_by_profile_image_url,
       a.status AS applied_by_status,
       r.id AS released_by_id,
       r.nickname AS released_by_nickname,
       r.profile_image_url AS released_by_profile_image_url,
       r.status AS released_by_status
     FROM user_sanctions s
     JOIN users a ON a.id = s.applied_by
     LEFT JOIN users r ON r.id = s.released_by
     WHERE s.user_id = ?`,
    [userId],
  );

  return rows;
};

export const hasActiveSanctionByUserIdAndType = async (userId, type) => {
  const [rows] = await getExecutor().query(
    `SELECT 1 FROM user_sanctions s WHERE s.user_id = ? AND s.type = ? AND ${ACTIVE_SANCTION} LIMIT 1`,
    [userId, type],
  );

  return rows.length > 0;
};

export const createSanction = async ({ userId, type, days, reason, appliedBy }) => {
  const [result] = await getExecutor().query(
    `INSERT INTO user_sanctions (user_id, type, days, reason, starts_at, ends_at, applied_by)
     VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP(3),
       IF(? IS NULL, NULL, CURRENT_TIMESTAMP(3) + INTERVAL ? DAY), ?)`,
    [userId, type, days, reason, days, days, appliedBy],
  );

  return result.insertId;
};

// 걸려 있는 같은 종류 제재를 해제하고, 해제한 행 수를 돌려준다
export const releaseActiveSanctions = async ({ userId, type, reason, releasedBy }) => {
  const [result] = await getExecutor().query(
    `UPDATE user_sanctions s
     SET s.released_at = CURRENT_TIMESTAMP(3), s.released_by = ?, s.release_reason = ?
     WHERE s.user_id = ? AND s.type = ? AND ${ACTIVE_SANCTION}`,
    [releasedBy, reason, userId, type],
  );

  return result.affectedRows;
};
