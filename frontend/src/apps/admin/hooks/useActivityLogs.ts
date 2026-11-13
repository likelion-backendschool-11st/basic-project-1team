import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { ApiError } from '../../../shared/api';
import { getActivityLogs } from '../api/activityLogs';
import { activityLogCopy } from '../data/mockData';
import type { ActivityLog } from '../types';

const PAGE_SIZE = 20;

export interface LogFilters {
  /** 'all' 또는 action·그룹 값 */
  readonly action: string;
  /** YYYY-MM-DD (빈 값이면 기간 제한 없음) */
  readonly start: string;
  readonly end: string;
}

const INITIAL_FILTERS: LogFilters = { action: 'all', start: '', end: '' };

/**
 * 활동 로그 목록 (API_SPEC 10.8). 필터는 "검색"을 눌러야 적용하고, 적용하면 1페이지부터 다시 불러온다.
 * TODO: 관리자 필터(adminId)는 관리자 목록 API(GET /api/admin/users?role=ADMIN)가 생기면 붙인다 (#57)
 */
export function useActivityLogs() {
  const [draft, setDraft] = useState<LogFilters>(INITIAL_FILTERS);
  const [applied, setApplied] = useState<LogFilters>(INITIAL_FILTERS);
  const [page, setPage] = useState(1);
  const [logs, setLogs] = useState<readonly ActivityLog[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    // 응답이 늦게 온 이전 요청이 최신 결과를 덮어쓰지 않도록 한다
    let ignore = false;
    setLoading(true);
    getActivityLogs({
      page,
      size: PAGE_SIZE,
      action: applied.action === 'all' ? undefined : applied.action,
      startDate: applied.start || undefined,
      endDate: applied.end || undefined,
    })
      .then((result) => {
        if (ignore) return;
        setLogs(result.items);
        setTotalCount(result.meta.totalCount);
        setErrorMessage(null);
      })
      .catch((error: unknown) => {
        if (ignore) return;
        setLogs([]);
        setTotalCount(0);
        setErrorMessage(error instanceof ApiError ? error.message : activityLogCopy.loadError);
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, [applied, page]);

  const update = useCallback(<K extends keyof LogFilters>(key: K, value: LogFilters[K]) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
  }, []);

  const submit = useCallback(
    (event?: FormEvent) => {
      event?.preventDefault();
      setApplied(draft);
      setPage(1);
    },
    [draft],
  );

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const goTo = useCallback(
    (next: number) => setPage(Math.min(Math.max(1, next), totalPages)),
    [totalPages],
  );

  return { draft, update, submit, logs, loading, errorMessage, page, totalPages, goTo };
}
