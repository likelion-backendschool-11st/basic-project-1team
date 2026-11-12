import { useCallback, useState } from 'react';

export function usePagination(totalPages: number, initialPage = 1) {
  const [page, setPage] = useState(initialPage);
  const goTo = useCallback(
    (p: number) => setPage(Math.min(Math.max(1, p), totalPages)),
    [totalPages],
  );
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  return { page, pages, goTo };
}
