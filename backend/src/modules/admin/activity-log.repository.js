import { getExecutor } from '../../config/database.js';

// 하루 1번 도는 만료 작업 전이라도 5년이 지난 로그는 목록에서 뺀다 (API 명세 10.8, DB 설계서 4.19)
// TODO: 5년 지난 로그를 expired로 바꾸는 하루 1번 작업은 주기 작업 구조를 정한 뒤 추가한다 (#63)
const RETENTION_YEARS = 5;

const buildWhereClause = (filter) => {
  const conditions = [
    "l.status = 'active'",
    `l.created_at >= UTC_TIMESTAMP(3) - INTERVAL ${RETENTION_YEARS} YEAR`,
  ];
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
