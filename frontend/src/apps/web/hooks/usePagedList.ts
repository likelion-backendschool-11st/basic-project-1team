import { useEffect, useState } from 'react';
import { getErrorMessage, type PageResult } from '../../../shared/api';

/**
 * 마이페이지의 페이지 목록 (포인트 내역, 내 신고 내역). 최신순 목록을 size 개씩 불러온다.
 * fetchPage 는 모듈의 API 함수처럼 바뀌지 않는 함수를 넘긴다.
 */
export function usePagedList<T>(
  fetchPage: (page: number, size: number) => Promise<PageResult<T>>,
  size: number,
) {
  const [page, setPage] = useState(1);
  const [result, setResult] = useState<PageResult<T> | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    // 페이지를 빨리 넘기면 늦게 온 이전 페이지 응답은 버린다
    let ignore = false;
    setLoading(true);
    setErrorMessage(null);
    fetchPage(page, size)
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
  }, [fetchPage, page, size]);

  const totalCount = result?.meta.totalCount ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / size));

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
