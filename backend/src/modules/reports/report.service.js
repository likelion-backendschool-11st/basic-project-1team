import { BadRequestError, ConflictError, NotFoundError } from '../../common/error/http-errors.js';
import { withTransaction } from '../../config/database.js';
import * as attachmentService from '../attachments/attachment.service.js';

import * as reportRepository from './report.repository.js';

// 접수번호의 날짜는 서비스 이용자 기준(한국 시간)으로 쓴다 (예: REP-20261110-84092)
const seoulDateFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Asia/Seoul',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

const toReceiptNumber = (row) =>
  `REP-${seoulDateFormatter.format(row.created_at).replaceAll('-', '')}-${row.id}`;

const toReport = (row) => ({
  id: row.id,
  receiptNumber: toReceiptNumber(row),
  targetType: row.target_type,
  targetId: row.target_id,
  reason: row.reason,
  status: row.status,
  queuePosition: row.status === 'pending' ? row.queue_position : null,
  createdAt: row.created_at,
});

// 신고는 처리 대기(pending)로 접수하고 대상을 자동으로 숨기지 않는다 (REQ-QNA-008·009)
export const createReport = async (
  reporterId,
  { targetType, targetId, reason, detail, attachmentIds },
) => {
  const reportId = await withTransaction(async () => {
    await reportRepository.findReporterByIdForUpdate(reporterId);

    const targetAuthorId = await reportRepository.findReportTargetAuthorId(targetType, targetId);

    if (targetAuthorId === null) {
      throw new NotFoundError('REPORT_TARGET_NOT_FOUND', '신고 대상을 찾을 수 없습니다.');
    }

    if (targetAuthorId === reporterId) {
      throw new BadRequestError('CANNOT_REPORT_OWN_CONTENT', '본인 글은 신고할 수 없습니다.');
    }

    if (await reportRepository.hasPendingReport({ reporterId, targetType, targetId })) {
      throw new ConflictError(
        'REPORT_DUPLICATED',
        '이미 신고한 대상입니다. 처리가 끝난 뒤 다시 신고할 수 있습니다.',
      );
    }

    const createdId = await reportRepository.createReport({
      reporterId,
      targetType,
      targetId,
      targetAuthorId,
      reason,
      detail,
    });

    await attachmentService.linkReportEvidences(reporterId, createdId, attachmentIds);

    return createdId;
  });

  return toReport(await reportRepository.findReportById(reportId));
};
