import { useCallback, useState } from 'react';
import type { ContentStatus } from '../types';

interface Moderatable {
  readonly id: number;
  readonly status: ContentStatus;
}

export interface ModerationState<T extends Moderatable> {
  readonly rows: readonly T[];
  readonly toggleHidden: (id: number) => void;
  readonly remove: (id: number) => void;
}

/** 목록 상태 필터. 'all' 은 삭제된 항목을 뺀 전체 (API_SPEC 10.3). */
export function matchesStatus(status: ContentStatus, filter: string): boolean {
  return filter === 'all' ? status !== 'deleted' : status === filter;
}

const keep = <T>(row: T) => row;

/**
 * Hide / restore / delete actions shared by the Q&A and free-board tables.
 * 삭제는 행을 지우지 않고 status 를 deleted 로 바꾼다 (soft delete, API_SPEC 1.7).
 * takeDown: 숨기거나 삭제할 때 함께 바꿀 값. 채택된 답변은 채택이 풀린다 (API_SPEC 10.3)
 */
export function useModeration<T extends Moderatable>(
  initial: readonly T[],
  takeDown: (row: T) => T = keep,
): ModerationState<T> {
  const [rows, setRows] = useState<readonly T[]>(initial);

  const toggleHidden = useCallback(
    (id: number) => {
      setRows((prev) =>
        prev.map((row) => {
          if (row.id !== id || row.status === 'deleted') return row;
          return row.status === 'hidden'
            ? { ...row, status: 'active' }
            : takeDown({ ...row, status: 'hidden' });
        }),
      );
    },
    [takeDown],
  );

  const remove = useCallback(
    (id: number) => {
      setRows((prev) =>
        prev.map((row) => (row.id === id ? takeDown({ ...row, status: 'deleted' }) : row)),
      );
    },
    [takeDown],
  );

  return { rows, toggleHidden, remove };
}
