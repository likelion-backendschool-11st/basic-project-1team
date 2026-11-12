import { useCallback, useState } from 'react';

export interface PaginationState {
  readonly page: number;
  readonly totalPages: number;
  readonly goTo: (page: number) => void;
}

/** Page cursor for server-paged lists. Data is mocked, so only the cursor is tracked. */
export function usePagination(totalPages: number): PaginationState {
  const [page, setPage] = useState(1);

  const goTo = useCallback(
    (next: number) => setPage(Math.min(Math.max(1, next), Math.max(1, totalPages))),
    [totalPages],
  );

  return { page, totalPages, goTo };
}
