import { getExecutor } from '../../config/database.js';

// 같은 대상을 동시에 신고해도 숫자를 놓치지 않도록 잠금 읽기로 최신 신고까지 센다 (DB 설계서 4.25)
export const countUrgentReporters = async ({ targetType, targetId, reasons }) => {
  const [rows] = await getExecutor().query(
    `SELECT COUNT(DISTINCT reporter_id) AS reporter_count
     FROM reports
     WHERE target_type = ? AND target_id = ? AND status = 'pending' AND reason IN (?)
     FOR SHARE`,
    [targetType, targetId, reasons],
  );

  return rows[0].reporter_count;
};

export const createTempHide = async ({ targetType, targetId }) => {
  await getExecutor().query(
    'INSERT INTO report_temp_hides (target_type, target_id) VALUES (?, ?)',
    [targetType, targetId],
  );
};

// 대상 하나에 active 는 최대 1행이다
export const findActiveTempHideForUpdate = async ({ targetType, targetId }) => {
  const [rows] = await getExecutor().query(
    `SELECT id FROM report_temp_hides
     WHERE target_type = ? AND target_id = ? AND status = 'active'
     FOR UPDATE`,
    [targetType, targetId],
  );

  return rows[0] ?? null;
};

export const endTempHide = async (id, { status, endedBy }) => {
  await getExecutor().query(
    `UPDATE report_temp_hides SET status = ?, ended_by = ?, ended_at = CURRENT_TIMESTAMP(3)
     WHERE id = ?`,
    [status, endedBy, id],
  );
};

// 관리자 신고 목록의 isTempHidden (API 명세 10.6)
export const findActiveTempHideTargets = async (targets) => {
  if (targets.length === 0) {
    return [];
  }

  const [rows] = await getExecutor().query(
    `SELECT target_type, target_id FROM report_temp_hides
     WHERE status = 'active' AND (target_type, target_id) IN (?)`,
    [targets.map(({ type, id }) => [type, id])],
  );

  return rows;
};
