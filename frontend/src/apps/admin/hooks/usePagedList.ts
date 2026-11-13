import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { ApiError, type PageResult } from '../../../shared/api';
import { ui } from '../data/mockData';

export interface PagedListState<T, F> {
  /** 필터 바에 입력 중인 값 */
  readonly draft: F;
  /** 마지막으로 적용한 값 */
  readonly applied: F;
  readonly update: <K extends keyof F>(key: K, value: F[K]) => void;
  /** "검색" 버튼: 입력 중인 필터를 적용하고 1페이지부터 다시 불러온다 */
  readonly submit: (event?: FormEvent) => void;
  /** 정렬처럼 고르자마자 적용하는 값 */
  readonly applyNow: <K extends keyof F>(key: K, value: F[K]) => void;
  readonly items: readonly T[];
  readonly totalCount: number;
  readonly loading: boolean;
  readonly errorMessage: string | null;
  readonly page: number;
  readonly totalPages: number;
  readonly goTo: (page: number) => void;
  /** 숨김·삭제처럼 서버 값을 바꾼 뒤 지금 페이지를 다시 불러온다 */
  readonly reload: () => void;
}

/**
 * 서버 페이지네이션 목록 (API_SPEC 1.5).
 * `fetchPage` 는 렌더마다 바뀌지 않도록 모듈 범위에 둔 함수를 넘긴다.
 */
export function usePagedList<T, F>(
  initialFilters: F,
  pageSize: number,
  fetchPage: (filters: F, page: number, size: number) => Promise<PageResult<T>>,
): PagedListState<T, F> {
  const [draft, setDraft] = useState<F>(initialFilters);
  const [applied, setApplied] = useState<F>(initialFilters);
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<readonly T[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    // 응답이 늦게 온 이전 요청이 최신 결과를 덮어쓰지 않도록 한다
    let ignore = false;
    setLoading(true);
    fetchPage(applied, page, pageSize)
      .then((result) => {
        if (ignore) return;
        setItems(result.items);
        setTotalCount(result.meta.totalCount);
        setErrorMessage(null);
      })
      .catch((error: unknown) => {
        if (ignore) return;
        setItems([]);
        setTotalCount(0);
        setErrorMessage(error instanceof ApiError ? error.message : ui.loadError);
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, [applied, page, pageSize, fetchPage, version]);

  const reload = useCallback(() => setVersion((prev) => prev + 1), []);

  const update = useCallback(<K extends keyof F>(key: K, value: F[K]) => {
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

  const applyNow = useCallback(<K extends keyof F>(key: K, value: F[K]) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
    setApplied((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  }, []);

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const goTo = useCallback(
    (next: number) => setPage(Math.min(Math.max(1, next), totalPages)),
    [totalPages],
  );

  return {
    draft,
    applied,
    update,
    submit,
    applyNow,
    items,
    totalCount,
    loading,
    errorMessage,
    page,
    totalPages,
    goTo,
    reload,
  };
}
