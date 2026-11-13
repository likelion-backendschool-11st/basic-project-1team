import { getExecutor } from '../../config/database.js';

// 신고 대상은 여러 테이블을 가리키는 다형 참조라 대상별로 직접 조회한다 (DB 설계서 1장 다형 참조).
// 숨김·삭제된 대상과, 숨김·삭제된 질문의 답변·게시글의 댓글은 신고할 수 없다
const TARGET_AUTHOR_QUERIES = {
  question: "SELECT author_id FROM questions WHERE id = ? AND status = 'active'",
  answer: `SELECT a.author_id
           FROM answers a
           JOIN questions q ON q.id = a.question_id
           WHERE a.id = ? AND a.status = 'active' AND q.status = 'active'`,
  post: "SELECT author_id FROM posts WHERE id = ? AND status = 'active'",
  comment: `SELECT c.author_id
            FROM comments c
            JOIN posts p ON p.id = c.post_id
            WHERE c.id = ? AND c.status = 'active' AND p.status = 'active'`,
};

export const findReportTargetAuthorId = async (targetType, targetId) => {
  const [rows] = await getExecutor().query(TARGET_AUTHOR_QUERIES[targetType], [targetId]);

  return rows[0]?.author_id ?? null;
};

// 같은 신고가 동시에 와도(버튼 두 번 누름 등) 1건만 들어가도록 신고자 회원 행을 잠근다 (DB 설계서 4.16)
export const findReporterByIdForUpdate = async (reporterId) => {
  const [rows] = await getExecutor().query('SELECT id FROM users WHERE id = ? FOR UPDATE', [
    reporterId,
  ]);

  return rows[0] ?? null;
};

export const hasPendingReport = async ({ reporterId, targetType, targetId }) => {
  const [rows] = await getExecutor().query(
    `SELECT EXISTS (
       SELECT 1 FROM reports
       WHERE reporter_id = ? AND target_type = ? AND target_id = ? AND status = 'pending'
     ) AS has_pending`,
    [reporterId, targetType, targetId],
  );

  return rows[0].has_pending === 1;
};

export const createReport = async ({
  reporterId,
  targetType,
  targetId,
  targetAuthorId,
  reason,
  detail,
}) => {
  const [result] = await getExecutor().query(
    `INSERT INTO reports (reporter_id, target_type, target_id, target_author_id, reason, detail)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [reporterId, targetType, targetId, targetAuthorId, reason, detail],
  );

  return result.insertId;
};

// queue_position: 처리 대기(pending) 신고를 접수 순서로 세웠을 때 몇 번째인지
const REPORT_COLUMNS = `
  r.id,
  r.target_type,
  r.target_id,
  r.reason,
  r.status,
  r.created_at,
  (SELECT COUNT(*) FROM reports earlier
   WHERE earlier.status = 'pending'
     AND (earlier.created_at < r.created_at
          OR (earlier.created_at = r.created_at AND earlier.id <= r.id))) AS queue_position`;

export const findReportById = async (reportId) => {
  const [rows] = await getExecutor().query(
    `SELECT ${REPORT_COLUMNS} FROM reports r WHERE r.id = ?`,
    [reportId],
  );

  return rows[0] ?? null;
};

// 내 신고 내역. 취소한 신고는 삭제 상태라 뺀다 (API_SPEC 1.7).
// idx_reports_reporter_created 로 회원의 신고만 읽는다 (DB 설계서 4.16)
const MY_REPORTS_FROM = `
  FROM reports r
  WHERE r.reporter_id = ? AND r.status <> 'canceled'`;

export const findReportsByReporterId = async (reporterId, { limit, offset }) => {
  const [rows] = await getExecutor().query(
    `SELECT ${REPORT_COLUMNS}
     ${MY_REPORTS_FROM}
     ORDER BY r.created_at DESC, r.id DESC
     LIMIT ? OFFSET ?`,
    [reporterId, limit, offset],
  );

  return rows;
};

export const countReportsByReporterId = async (reporterId) => {
  const [rows] = await getExecutor().query(`SELECT COUNT(*) AS report_count ${MY_REPORTS_FROM}`, [
    reporterId,
  ]);

  return rows[0].report_count;
};

// 접수 취소 전에 신고 행을 잠근다. 취소할 수 있는 시간 안인지는 DB 시각으로 판단한다
export const findReportByIdForUpdate = async (reportId, cancelWindowSeconds) => {
  const [rows] = await getExecutor().query(
    `SELECT
       id,
       reporter_id,
       status,
       created_at >= NOW(3) - INTERVAL ? SECOND AS is_within_cancel_window
     FROM reports
     WHERE id = ?
     FOR UPDATE`,
    [cancelWindowSeconds, reportId],
  );

  return rows[0] ?? null;
};

// 행을 지우지 않고 canceled 로 바꾼다 (API_SPEC 1.7)
export const cancelReport = async (reportId) => {
  await getExecutor().query(
    "UPDATE reports SET status = 'canceled', canceled_at = NOW(3) WHERE id = ?",
    [reportId],
  );
};
