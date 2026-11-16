import { useEffect, useState } from 'react';
import { getErrorMessage, type PageResult } from '../../../shared/api';
import { getMyPointHistories } from '../api/users';
import type { PointHistory } from '../data/mockData';

const PAGE_SIZE = 10;

/** 내 포인트 내역 (GET /api/users/me/point-histories, API_SPEC 11장). 최신순, 10개씩 */
export function usePointHistories() {
  const [page, setPage] = useState(1);
  const [result, setResult] = useState<PageResult<PointHistory> | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    // 페이지를 빨리 넘기면 늦게 온 이전 페이지 응답은 버린다
    let ignore = false;
    setLoading(true);
    setErrorMessage(null);
    getMyPointHistories(page, PAGE_SIZE)
      .then((next) => {
        if (!ignore) setResult(next);
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
  }, [page]);

  const totalCount = result?.meta.totalCount ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  return {
    items: result?.items ?? [],
    totalCount,
    page,
    totalPages,
    goTo: (next: number) => setPage(Math.min(Math.max(1, next), totalPages)),
    loading,
    errorMessage,
  };
}
