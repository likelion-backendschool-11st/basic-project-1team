import {
  apiPageRequest,
  apiRequest,
  toQueryString,
  type PageMeta,
  type PageResult,
} from '../../../shared/api';
import type { Report, ReportReason, ReportStatus, ReportTarget, SanctionType } from '../types';

/** 신고 목록 meta. statusCounts 는 status 를 뺀 다른 필터를 적용한 상태별 건수 (API_SPEC 10.6) */
export interface ReportPageMeta extends PageMeta {
  readonly statusCounts: Readonly<Record<ReportStatus, number>>;
}

export interface ReportListQuery {
  readonly page: number;
  readonly size: number;
  /** 생략하면 처리 대기(pending) */
  readonly status?: ReportStatus;
  readonly targetType?: ReportTarget;
  readonly reason?: ReportReason;
  /** 회원 상세의 받은 신고 수에서 넘어올 때 */
  readonly targetAuthorId?: number;
}

/** GET /api/admin/reports */
export function getReports(query: ReportListQuery): Promise<PageResult<Report, ReportPageMeta>> {
  return apiPageRequest<Report, ReportPageMeta>(`/admin/reports${toQueryString({ ...query })}`);
}

/** 처리: 대상 숨김 여부와 작성자 제재(하지 않으면 null, days null 은 영구) / 반려 */
export type ReportDecision =
  | {
      readonly status: 'resolved';
      readonly hideTarget: boolean;
      readonly sanction: { readonly type: SanctionType; readonly days: number | null } | null;
    }
  | { readonly status: 'rejected' };

/** PATCH /api/admin/reports/:reportId. 같은 대상의 처리 대기 신고도 함께 바뀐다 */
export function processReport(reportId: number, decision: ReportDecision): Promise<Report> {
  return apiRequest<Report>(`/admin/reports/${reportId}`, { method: 'PATCH', body: decision });
}
