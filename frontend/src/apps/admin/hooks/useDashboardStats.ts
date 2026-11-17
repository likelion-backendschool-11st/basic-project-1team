import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { getErrorMessage } from '../../../shared/api';
import { getDashboardStats, type DashboardStats } from '../api/stats';

export interface DashboardStatsState {
  /** 아직 못 받았거나 실패하면 null */
  readonly stats: DashboardStats | null;
  readonly loading: boolean;
  readonly errorMessage: string | null;
}

export const DashboardStatsContext = createContext<DashboardStatsState>({
  stats: null,
  loading: true,
  errorMessage: null,
});

/**
 * 대시보드 현황 (GET /api/admin/stats). 관리자 레이아웃이 한 번 불러 대시보드와 사이드바 신고 배지가 같이 쓴다.
 * 신고를 처리하면 대기 수가 바뀌므로 화면을 옮길 때마다 다시 불러온다.
 */
export function useDashboardStatsLoader(): DashboardStatsState {
  const { pathname } = useLocation();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const load = useCallback(() => {
    let ignore = false;
    setLoading(true);
    getDashboardStats()
      .then((result) => {
        if (ignore) return;
        setStats(result);
        setErrorMessage(null);
      })
      .catch((error: unknown) => {
        if (!ignore) setErrorMessage(getErrorMessage(error));
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => load(), [load, pathname]);

  return { stats, loading, errorMessage };
}

export const useDashboardStats = (): DashboardStatsState => useContext(DashboardStatsContext);
