import { useCallback, useState } from 'react';

interface Moderatable {
  readonly id: number;
  readonly hidden: boolean;
}

export interface ModerationState<T extends Moderatable> {
  readonly rows: readonly T[];
  readonly toggleHidden: (id: number) => void;
  readonly remove: (id: number) => void;
}

/** Hide / restore / delete actions shared by the Q&A and free-board tables. */
export function useModeration<T extends Moderatable>(initial: readonly T[]): ModerationState<T> {
  const [rows, setRows] = useState<readonly T[]>(initial);

  const toggleHidden = useCallback((id: number) => {
    setRows((prev) => prev.map((row) => (row.id === id ? { ...row, hidden: !row.hidden } : row)));
  }, []);

  const remove = useCallback((id: number) => {
    setRows((prev) => prev.filter((row) => row.id !== id));
  }, []);

  return { rows, toggleHidden, remove };
}
