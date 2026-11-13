import {
  BadRequestError,
  ConflictError,
  ForbiddenError,
  NotFoundError,
} from '../../common/error/http-errors.js';
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

// 접수 후 이 시간 안에만 취소할 수 있다 (REQ-QNA-016)
const CANCEL_WINDOW_SECONDS = 10;
// 신고 증빙 연결에서 신고를 가리키는 target_type
const TARGET_TYPE = 'report';

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

// 신고 완료 화면의 "접수 취소". 신고한 회원이 처리 대기 중인 신고를 접수 후 10초 안에만 취소한다 (API_SPEC 8장)
export const cancelReport = async (reporterId, reportId) => {
  await withTransaction(async () => {
    const report = await reportRepository.findReportByIdForUpdate(reportId, CANCEL_WINDOW_SECONDS);

    // 취소한 신고는 삭제 상태라 없는 신고와 같게 본다 (API_SPEC 1.7)
    if (report === null || report.status === 'canceled') {
      throw new NotFoundError('REPORT_NOT_FOUND', '신고를 찾을 수 없습니다.');
    }

    if (report.reporter_id !== reporterId) {
      throw new ForbiddenError('FORBIDDEN', '신고한 회원만 취소할 수 있습니다.');
    }

    if (report.status !== 'pending') {
      throw new ConflictError('REPORT_ALREADY_PROCESSED', '이미 처리된 신고는 취소할 수 없습니다.');
    }

    if (report.is_within_cancel_window !== 1) {
      throw new ConflictError(
        'REPORT_CANCEL_EXPIRED',
        `접수 후 ${CANCEL_WINDOW_SECONDS}초가 지나 취소할 수 없습니다.`,
      );
    }

    await reportRepository.cancelReport(reportId);
    // 증빙 파일 연결을 끊어 정리 작업이 파일을 지울 수 있게 한다 (API_SPEC 6장)
    await attachmentService.deleteAttachmentLinksByTarget(TARGET_TYPE, reportId);
  });
};
