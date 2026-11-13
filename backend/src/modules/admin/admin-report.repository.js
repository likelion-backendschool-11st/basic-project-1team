import { getExecutor } from '../../config/database.js';

// 접수 취소(canceled)한 신고는 관리자 화면에 보여 주지 않는다 (API 명세 10.6)
const PROCESS_STATUSES = ['pending', 'resolved', 'rejected'];

const userColumns = (alias, prefix) => `${alias}.id AS ${prefix}_id,
       ${alias}.nickname AS ${prefix}_nickname,
       ${alias}.profile_image_url AS ${prefix}_profile_image_url,
       ${alias}.status AS ${prefix}_status`;

const buildWhereClause = (filter, { withStatus }) => {
  const conditions = [];
  const params = [];

  if (withStatus) {
    conditions.push('r.status = ?');
    params.push(filter.status);
  } else {
    conditions.push('r.status IN (?)');
    params.push(PROCESS_STATUSES);
  }

  if (filter.targetType !== undefined) {
    conditions.push('r.target_type = ?');
    params.push(filter.targetType);
  }

  if (filter.reason !== undefined) {
    conditions.push('r.reason = ?');
    params.push(filter.reason);
  }

  if (filter.targetAuthorId !== undefined) {
    conditions.push('r.target_author_id = ?');
    params.push(filter.targetAuthorId);
  }

  return { sql: `WHERE ${conditions.join(' AND ')}`, params };
};

const SELECT_REPORT = `SELECT
       r.id,
       r.target_type,
       r.target_id,
       r.reason,
       r.detail,
       r.status,
       r.created_at,
       r.processed_at,
       ${userColumns('rp', 'reporter')},
       ${userColumns('ta', 'target_author')}
     FROM reports r
     JOIN users rp ON rp.id = r.reporter_id
     JOIN users ta ON ta.id = r.target_author_id`;

export const findReports = async ({ filter, limit, offset }) => {
  const where = buildWhereClause(filter, { withStatus: true });

  const [rows] = await getExecutor().query(
    `${SELECT_REPORT}
     ${where.sql}
     ORDER BY r.created_at DESC, r.id DESC
     LIMIT ? OFFSET ?`,
    [...where.params, limit, offset],
  );

  return rows;
};

export const countReports = async (filter) => {
  const where = buildWhereClause(filter, { withStatus: true });

  const [rows] = await getExecutor().query(
    `SELECT COUNT(*) AS total_count FROM reports r ${where.sql}`,
    where.params,
  );

  return rows[0].total_count;
};

// 탭 배지: 상태 말고 다른 필터는 적용한 상태별 건수 (API 명세 10.6)
export const countReportsByStatus = async (filter) => {
  const where = buildWhereClause(filter, { withStatus: false });

  const [rows] = await getExecutor().query(
    `SELECT r.status, COUNT(*) AS count FROM reports r ${where.sql} GROUP BY r.status`,
    where.params,
  );

  return rows;
};

export const findReportById = async (reportId) => {
  const [rows] = await getExecutor().query(
    `${SELECT_REPORT}
     WHERE r.id = ? AND r.status IN (?)`,
    [reportId, PROCESS_STATUSES],
  );

  return rows[0] ?? null;
};

// duplicateCount: 같은 대상의 처리 대기(pending) 신고 수 (DB 설계서 4.16 idx_reports_target_status)
export const countPendingReportsByTargets = async (targets) => {
  if (targets.length === 0) {
    return [];
  }

  const [rows] = await getExecutor().query(
    `SELECT target_type, target_id, COUNT(*) AS pending_count
     FROM reports
     WHERE status = 'pending' AND (target_type, target_id) IN (?)
     GROUP BY target_type, target_id`,
    [targets.map(({ type, id }) => [type, id])],
  );

  return rows;
};

// 신고 증빙: 연결이 살아 있고 파일이 남아 있는 것만, 올린 순서대로 (DB 설계서 4.13)
export const findEvidencesByReportIds = async (reportIds) => {
  if (reportIds.length === 0) {
    return [];
  }

  const [rows] = await getExecutor().query(
    `SELECT al.target_id AS report_id, a.id, a.original_name, a.url, a.size, a.kind
     FROM attachment_links al
     JOIN attachments a ON a.id = al.attachment_id
     WHERE al.target_type = 'report' AND al.target_id IN (?)
       AND al.deleted_at IS NULL AND a.status = 'active'
     ORDER BY al.target_id, al.sort_order, al.id`,
    [reportIds],
  );

  return rows;
};

// 두 관리자가 같은 신고를 동시에 처리하지 않도록 신고 행을 잠근다
export const findReportByIdForUpdate = async (reportId) => {
  const [rows] = await getExecutor().query(
    `SELECT id, status, target_type, target_id, target_author_id, reason
     FROM reports
     WHERE id = ? AND status IN (?)
     FOR UPDATE`,
    [reportId, PROCESS_STATUSES],
  );

  return rows[0] ?? null;
};

// 같은 대상의 처리 대기 신고를 함께 처리·반려한다. 바꾼 신고 수를 돌려준다 (API 명세 10.6)
export const updatePendingReportsByTarget = async ({
  targetType,
  targetId,
  status,
  hideTarget,
  processedBy,
}) => {
  const [result] = await getExecutor().query(
    `UPDATE reports
     SET status = ?, hide_target = ?, processed_by = ?, processed_at = CURRENT_TIMESTAMP(3)
     WHERE target_type = ? AND target_id = ? AND status = 'pending'`,
    [status, hideTarget, processedBy, targetType, targetId],
  );

  return result.affectedRows;
};
