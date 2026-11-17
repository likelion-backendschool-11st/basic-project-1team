import { useEffect, useState } from 'react';
import { getActivityLogAdmins, getActivityLogs } from '../api/activityLogs';
import { logAdminAllOption, logAdminOptionLabels } from '../data/mockData';
import type { ActivityLog, ActivityLogAdmin, SelectOption } from '../types';
import { usePagedList } from './usePagedList';

const PAGE_SIZE = 20;

export interface LogFilters {
  /** 'all' 또는 처리자 회원 id (관리자 또는 관리 권한 회원) */
  readonly admin: string;
  /** 'all' 또는 action·그룹 값 */
  readonly action: string;
  /** YYYY-MM-DD, 한국 날짜 (빈 값이면 기간 제한 없음) */
  readonly start: string;
  readonly end: string;
}

const INITIAL_FILTERS: LogFilters = { admin: 'all', action: 'all', start: '', end: '' };

const fetchLogs = (f: LogFilters, page: number, size: number) =>
  getActivityLogs({
    page,
    size,
    adminId: f.admin === 'all' ? undefined : Number(f.admin),
    action: f.action === 'all' ? undefined : f.action,
    startDate: f.start || undefined,
    endDate: f.end || undefined,
  });

const toAdminOptionLabel = (admin: ActivityLogAdmin): string => {
  if (admin.isWithdrawn || admin.nickname === null) return logAdminOptionLabels.withdrawn(admin.id);
  return admin.role === 'ADMIN' ? admin.nickname : logAdminOptionLabels.moderator(admin.nickname);
};

/** 처리자 선택 목록은 로그에 남은 처리자로 만든다. 관리 권한 회원·탈퇴한 관리자도 고를 수 있다 (API_SPEC 10.8) */
function useAdminOptions(): readonly SelectOption[] {
  const [options, setOptions] = useState<readonly SelectOption[]>([logAdminAllOption]);

  useEffect(() => {
    let ignore = false;
    getActivityLogAdmins()
      .then((admins) => {
        if (ignore) return;
        setOptions([
          logAdminAllOption,
          ...admins.map((admin) => ({ value: String(admin.id), label: toAdminOptionLabel(admin) })),
        ]);
      })
      // 목록을 못 불러와도 '처리자 전체'로 로그는 볼 수 있다
      .catch(() => undefined);
    return () => {
      ignore = true;
    };
  }, []);

  return options;
}

/** 활동 로그 목록 (API_SPEC 10.8). 필터는 "검색"을 눌러야 적용된다. */
export function useActivityLogs() {
  const list = usePagedList<ActivityLog, LogFilters>(INITIAL_FILTERS, PAGE_SIZE, fetchLogs);
  const adminOptions = useAdminOptions();
  return { ...list, adminOptions };
}
