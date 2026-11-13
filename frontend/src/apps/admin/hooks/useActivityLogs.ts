import { useEffect, useState } from 'react';
import { getActivityLogs } from '../api/activityLogs';
import { getUsers } from '../api/users';
import { logAdminAllOption } from '../data/mockData';
import type { ActivityLog, SelectOption } from '../types';
import { usePagedList } from './usePagedList';

const PAGE_SIZE = 20;
/** 관리자는 많지 않아 한 번에 불러온다 (최대 size) */
const ADMIN_OPTIONS_SIZE = 100;

export interface LogFilters {
  /** 'all' 또는 관리자 회원 id */
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

/** 관리자 선택 목록은 GET /api/admin/users?role=ADMIN 으로 만든다 (API_SPEC 10.8) */
function useAdminOptions(): readonly SelectOption[] {
  const [options, setOptions] = useState<readonly SelectOption[]>([logAdminAllOption]);

  useEffect(() => {
    let ignore = false;
    getUsers({ page: 1, size: ADMIN_OPTIONS_SIZE, role: 'ADMIN' })
      .then((result) => {
        if (ignore) return;
        setOptions([
          logAdminAllOption,
          ...result.items.map((admin) => ({
            value: String(admin.id),
            label: admin.nickname ?? String(admin.id),
          })),
        ]);
      })
      // 목록을 못 불러와도 '관리자 전체'로 로그는 볼 수 있다
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
