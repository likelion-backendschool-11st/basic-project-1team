import { apiPageRequest, apiRequest, toQueryString, type PageResult } from '../../../shared/api';
import type { ActivityLog, ActivityLogAdmin } from '../types';

export interface ActivityLogQuery {
  readonly page: number;
  readonly size: number;
  readonly adminId?: number;
  /** action 하나 또는 그룹(HIDE, RESTORE, DELETE) */
  readonly action?: string;
  /** YYYY-MM-DD, 한국 날짜 기준 */
  readonly startDate?: string;
  readonly endDate?: string;
}

/** GET /api/admin/activity-logs (API_SPEC 10.8) */
export function getActivityLogs(query: ActivityLogQuery): Promise<PageResult<ActivityLog>> {
  return apiPageRequest<ActivityLog>(`/admin/activity-logs${toQueryString({ ...query })}`);
}

/** GET /api/admin/activity-logs/admins (API_SPEC 10.8). 처리자 필터 목록 */
export function getActivityLogAdmins(): Promise<ActivityLogAdmin[]> {
  return apiRequest<ActivityLogAdmin[]>('/admin/activity-logs/admins');
}
