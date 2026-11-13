import { ConflictError, NotFoundError } from '../../common/error/http-errors.js';
import { toUserSummary } from '../../common/utils/user-summary.js';
import { withTransaction } from '../../config/database.js';

import * as activityLogService from './activity-log.service.js';
import * as adminContentService from './admin-content.service.js';
import * as adminReportRepository from './admin-report.repository.js';
import * as adminUserService from './admin-user.service.js';

// 제재 이력의 "신고 처리: <사유> (신고 #id)"에 들어가는 사유 이름 (API 명세 10.6, 관리자 화면과 같은 표기)
const REASON_LABELS = {
  spam: '스팸·홍보',
  abuse: '욕설·비하',
  illegal: '불법 프로그램',
  spoiler: '스포일러',
  misinformation: '허위정보',
  privacy: '개인정보 노출',
  etc: '기타',
};

// 활동 로그 detail 예: "대상 숨김 + 7일 정지" (API 명세 10.8)
const SANCTION_SHORT_LABELS = {
  suspend: '정지',
  write_ban: '글쓰기 제한',
  comment_ban: '댓글 제한',
};

const targetKey = (type, id) => `${type}:${id}`;

const groupEvidences = (rows) => {
  const evidencesByReportId = new Map();

  for (const row of rows) {
    const evidences = evidencesByReportId.get(row.report_id) ?? [];
    evidences.push({
      id: row.id,
      name: row.original_name,
      url: row.url,
      size: row.size,
      kind: row.kind,
    });
    evidencesByReportId.set(row.report_id, evidences);
  }

  return evidencesByReportId;
};

// 신고 대상이 삭제됐으면 내용과 작성자를 보여 주지 않는다 (API 명세 10.6)
const toAdminReports = async (rows) => {
  const targets = rows.map((row) => ({ type: row.target_type, id: row.target_id }));

  const [contentByTarget, pendingRows, evidenceRows] = await Promise.all([
    adminContentService.findReportTargets(targets),
    adminReportRepository.countPendingReportsByTargets(targets),
    adminReportRepository.findEvidencesByReportIds(rows.map((row) => row.id)),
  ]);

  const pendingCountByTarget = new Map(
    pendingRows.map((row) => [targetKey(row.target_type, row.target_id), row.pending_count]),
  );
  const evidencesByReportId = groupEvidences(evidenceRows);

  return rows.map((row) => {
    const key = targetKey(row.target_type, row.target_id);
    const content = contentByTarget.get(key);
    const targetStatus = content?.status ?? 'deleted';
    const isTargetDeleted = targetStatus === 'deleted';

    return {
      id: row.id,
      targetType: row.target_type,
      targetId: row.target_id,
      targetAuthor: isTargetDeleted ? null : toUserSummary(row, 'target_author'),
      preview: isTargetDeleted ? null : adminContentService.toPreview(content.text),
      fullText: isTargetDeleted ? null : content.text,
      reason: row.reason,
      detail: row.detail,
      attachments: evidencesByReportId.get(row.id) ?? [],
      reporter: toUserSummary(row, 'reporter'),
      status: row.status,
      duplicateCount: pendingCountByTarget.get(key) ?? 0,
      targetStatus,
      createdAt: row.created_at,
      processedAt: row.processed_at,
    };
  });
};

const toStatusCounts = (rows) => {
  const counts = { pending: 0, resolved: 0, rejected: 0 };

  for (const row of rows) {
    counts[row.status] = row.count;
  }

  return counts;
};

export const getReports = async ({ page, size, ...filter }) => {
  const [rows, totalCount, statusRows] = await Promise.all([
    adminReportRepository.findReports({ filter, limit: size, offset: (page - 1) * size }),
    adminReportRepository.countReports(filter),
    adminReportRepository.countReportsByStatus(filter),
  ]);

  return {
    reports: await toAdminReports(rows),
    meta: { page, size, totalCount, statusCounts: toStatusCounts(statusRows) },
  };
};

export const getReportById = async (reportId) => {
  const row = await adminReportRepository.findReportById(reportId);

  if (row === null) {
    throw new NotFoundError('REPORT_NOT_FOUND', '신고를 찾을 수 없습니다.');
  }

  const [report] = await toAdminReports([row]);

  return report;
};

const toSanctionLogLabel = ({ type, days }) =>
  `${days === null ? '영구' : `${days}일`} ${SANCTION_SHORT_LABELS[type]}`;

// 처리 내용 요약: "대상 숨김 + 7일 정지", 함께 처리한 신고가 있으면 건수도 적는다
const toResolveLogDetail = ({ isTargetDeleted, hideTarget, sanction, isAcceptanceReleased }) => {
  if (isTargetDeleted) {
    return '대상 삭제됨 (신고 상태만 처리)';
  }

  const actions = [
    hideTarget ? `대상 숨김${isAcceptanceReleased ? '(채택 해제)' : ''}` : null,
    sanction ? toSanctionLogLabel(sanction) : null,
  ].filter((action) => action !== null);

  return actions.length === 0 ? '조치 없음' : actions.join(' + ');
};

const withBatchNote = (detail, processedCount, verb) =>
  processedCount > 1 ? `${detail} · 같은 대상 신고 ${processedCount}건 함께 ${verb}` : detail;

const resolveReport = async (adminId, report, { hideTarget, sanction }) => {
  const targetStatus = await adminContentService.findContentStatusForUpdate(
    report.target_type,
    report.target_id,
  );
  // 대상이 이미 삭제됐으면 숨김·제재는 무시하고 신고 상태만 바꾼다 (API 명세 10.6)
  const isTargetDeleted = targetStatus === null || targetStatus === 'deleted';
  let isAcceptanceReleased = false;

  if (!isTargetDeleted && sanction !== null) {
    await adminUserService.applySanctionForReport(adminId, report.target_author_id, {
      ...sanction,
      reason: `신고 처리: ${REASON_LABELS[report.reason]} (신고 #${report.id})`,
      reportId: report.id,
    });
  }

  if (!isTargetDeleted && hideTarget) {
    isAcceptanceReleased = await adminContentService.hideContentForReport(
      report.target_type,
      report.target_id,
    );
  }

  const processedCount = await adminReportRepository.updatePendingReportsByTarget({
    targetType: report.target_type,
    targetId: report.target_id,
    status: 'resolved',
    hideTarget: isTargetDeleted ? null : hideTarget,
    processedBy: adminId,
  });

  return withBatchNote(
    toResolveLogDetail({ isTargetDeleted, hideTarget, sanction, isAcceptanceReleased }),
    processedCount,
    '처리',
  );
};

const rejectReport = async (adminId, report) => {
  const processedCount = await adminReportRepository.updatePendingReportsByTarget({
    targetType: report.target_type,
    targetId: report.target_id,
    status: 'rejected',
    hideTarget: null,
    processedBy: adminId,
  });

  return processedCount > 1 ? `같은 대상 신고 ${processedCount}건 함께 반려` : null;
};

/**
 * 신고 처리(resolved) / 반려(rejected) (API 명세 10.6 PATCH).
 * 같은 대상의 처리 대기 신고를 함께 바꾸고, 숨김·제재·활동 로그를 한 트랜잭션에서 남긴다.
 */
export const processReport = async (adminId, reportId, decision) =>
  withTransaction(async () => {
    const report = await adminReportRepository.findReportByIdForUpdate(reportId);

    if (report === null) {
      throw new NotFoundError('REPORT_NOT_FOUND', '신고를 찾을 수 없습니다.');
    }

    if (report.status !== 'pending') {
      throw new ConflictError('REPORT_ALREADY_PROCESSED', '이미 처리된 신고입니다.');
    }

    const isResolved = decision.status === 'resolved';
    const detail = isResolved
      ? await resolveReport(adminId, report, decision)
      : await rejectReport(adminId, report);

    await activityLogService.createActivityLog({
      adminId,
      action: isResolved
        ? activityLogService.ACTIVITY_LOG_ACTIONS.RESOLVE_REPORT
        : activityLogService.ACTIVITY_LOG_ACTIONS.REJECT_REPORT,
      targetType: 'report',
      targetId: reportId,
      detail,
    });

    return getReportById(reportId);
  });
