import { useCallback, useMemo, useState } from 'react';

export function usePagination(totalPages: number, windowSize: number) {
  const [page, setPage] = useState(1);

  const pages = useMemo(() => {
    const start = Math.max(1, Math.min(page - Math.floor(windowSize / 2), totalPages - windowSize + 1));
    return Array.from({ length: Math.min(windowSize, totalPages) }, (_, i) => start + i);
  }, [page, totalPages, windowSize]);

  const goTo = useCallback((p: number) => setPage(Math.min(Math.max(1, p), totalPages)), [totalPages]);

  return {
    page,
    pages,
    totalPages,
    goTo,
    prev: () => goTo(page - 1),
    next: () => goTo(page + 1),
    hasPrev: page > 1,
    hasNext: page < totalPages,
  } as const;
}
