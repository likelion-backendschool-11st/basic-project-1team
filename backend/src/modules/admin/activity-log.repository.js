import { getExecutor } from '../../config/database.js';

// 5년이 지난 로그는 하루 1번 도는 만료 작업이 expired로 바꾼다. 작업이 돌기 전 사이에도 목록에서 빠지도록
// 조회 조건에도 같은 기준을 둔다 (API 명세 10.8, DB 설계서 4.19)
const RETENTION_YEARS = 5;
const VISIBLE_LOG_CONDITIONS = [
  "l.status = 'active'",
  `l.created_at >= UTC_TIMESTAMP(3) - INTERVAL ${RETENTION_YEARS} YEAR`,
];

const buildWhereClause = (filter) => {
  const conditions = [...VISIBLE_LOG_CONDITIONS];
  const params = [];

  if (filter.adminId !== undefined) {
    conditions.push('l.admin_id = ?');
    params.push(filter.adminId);
  }

  if (filter.actions !== undefined) {
    conditions.push('l.action IN (?)');
    params.push(filter.actions);
  }

  if (filter.startAt !== undefined) {
    conditions.push('l.created_at >= ?');
    params.push(filter.startAt);
  }

  if (filter.endAt !== undefined) {
    conditions.push('l.created_at < ?');
    params.push(filter.endAt);
  }

  return { sql: `WHERE ${conditions.join(' AND ')}`, params };
};

export const findActivityLogs = async ({ filter, limit, offset }) => {
  const where = buildWhereClause(filter);

  const [rows] = await getExecutor().query(
    `SELECT
       l.id,
       l.action,
       l.target_type,
       l.target_id,
       l.target_label,
       l.detail,
       l.created_at,
       u.id AS admin_id,
       u.nickname AS admin_nickname,
       u.profile_image_url AS admin_profile_image_url,
       u.status AS admin_status
     FROM activity_logs l
     JOIN users u ON u.id = l.admin_id
     ${where.sql}
     ORDER BY l.created_at DESC, l.id DESC
     LIMIT ? OFFSET ?`,
    [...where.params, limit, offset],
  );

  return rows;
};

export const countActivityLogs = async (filter) => {
  const where = buildWhereClause(filter);

  const [rows] = await getExecutor().query(
    `SELECT COUNT(*) AS total_count FROM activity_logs l ${where.sql}`,
    where.params,
  );

  return rows[0].total_count;
};

// 보이는(만료 전) 로그에 한 번이라도 남은 처리자. ADMIN 먼저, 그다음 최근 로그 순 (API 명세 10.8)
// idx_activity_logs_admin_created(admin_id, created_at)로 처리자별로 모은다
export const findActivityLogAdmins = async () => {
  const [rows] = await getExecutor().query(
    `SELECT u.id, u.nickname, u.role, u.status, MAX(l.created_at) AS last_logged_at
     FROM activity_logs l
     JOIN users u ON u.id = l.admin_id
     WHERE ${VISIBLE_LOG_CONDITIONS.join(' AND ')}
     GROUP BY u.id, u.nickname, u.role, u.status
     ORDER BY u.role = 'ADMIN' DESC, last_logged_at DESC, u.id ASC`,
  );

  return rows;
};

export const createActivityLog = async ({
  adminId,
  action,
  targetType,
  targetId,
  targetLabel,
  detail,
}) => {
  const [result] = await getExecutor().query(
    `INSERT INTO activity_logs (admin_id, action, target_type, target_id, target_label, detail)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [adminId, action, targetType, targetId, targetLabel, detail],
  );

  return result.insertId;
};

// 작성 후 5년이 지난 로그를 expired로 바꾸고 바꾼 행 수를 돌려준다. 행은 지우지 않는다 (API 명세 1.7)
// idx_activity_logs_status_created(status, created_at)로 대상을 찾는다
export const expireActivityLogs = async () => {
  const [result] = await getExecutor().query(
    `UPDATE activity_logs
     SET status = 'expired', expired_at = UTC_TIMESTAMP(3)
     WHERE status = 'active' AND created_at < UTC_TIMESTAMP(3) - INTERVAL ${RETENTION_YEARS} YEAR`,
  );

  return result.affectedRows;
};
