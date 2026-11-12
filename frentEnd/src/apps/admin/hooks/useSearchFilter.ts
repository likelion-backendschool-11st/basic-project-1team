import { useCallback, useMemo, useState, type FormEvent } from 'react';

export interface SearchFilterState<F extends Record<string, string>, T> {
  /** Values currently typed into the filter bar. */
  readonly draft: F;
  /** Values applied by the last submit. */
  readonly applied: F;
  readonly update: <K extends keyof F>(key: K, value: F[K]) => void;
  readonly submit: (event?: FormEvent) => void;
  readonly results: readonly T[];
}

/**
 * Filter-bar state: edits go into `draft`, and only take effect on submit
 * (the "검색" button), matching the Stitch screens.
 * `match` must be referentially stable (define it at module scope).
 */
export function useSearchFilter<T, F extends Record<string, string>>(
  items: readonly T[],
  initial: F,
  match: (item: T, filters: F) => boolean,
): SearchFilterState<F, T> {
  const [draft, setDraft] = useState<F>(initial);
  const [applied, setApplied] = useState<F>(initial);

  const update = useCallback(<K extends keyof F>(key: K, value: F[K]) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
  }, []);

  const submit = useCallback(
    (event?: FormEvent) => {
      event?.preventDefault();
      setApplied(draft);
    },
    [draft],
  );

  const results = useMemo(() => items.filter((item) => match(item, applied)), [items, applied, match]);

  return { draft, applied, update, submit, results };
}

/** Case-insensitive "contains" helper for text search fields. */
export function includesText(haystack: readonly string[], needle: string): boolean {
  const q = needle.trim().toLowerCase();
  if (!q) return true;
  return haystack.some((value) => value.toLowerCase().includes(q));
}
