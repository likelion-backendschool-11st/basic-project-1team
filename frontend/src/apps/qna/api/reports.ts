import { apiRequest } from '../../../shared/api';
import type { ReportInput, ReportReceipt } from '../data/types';

/** POST /api/reports (API_SPEC 8장). 처리 대기로 접수된다. 긴급 사유 신고가 3명 이상 모이면 대상이 임시 숨김된다 */
export function createReport(input: ReportInput): Promise<ReportReceipt> {
  return apiRequest<ReportReceipt>('/reports', { method: 'POST', body: input });
}

/** DELETE /api/reports/:reportId (API_SPEC 8장). 접수 후 10초 안에만 취소할 수 있다 */
export function cancelReport(reportId: number): Promise<void> {
  return apiRequest<void>(`/reports/${reportId}`, { method: 'DELETE' });
}
