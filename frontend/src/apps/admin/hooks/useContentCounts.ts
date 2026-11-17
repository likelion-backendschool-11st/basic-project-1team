import { useCallback, useEffect, useState } from 'react';
import { getContents } from '../api/contents';
import type { ContentType } from '../types';

export interface ContentCountsState {
  /** 탭 배지 숫자. 아직 못 불러왔으면 undefined */
  readonly counts: Partial<Record<ContentType, number>>;
  readonly reload: () => void;
}

/**
 * 탭 배지에 쓰는 종류별 전체 건수 (삭제 제외).
 * 목록 API 를 size=1 로 불러 meta.totalCount 만 쓴다 (API_SPEC 1.5).
 */
export function useContentCounts(types: readonly ContentType[]): ContentCountsState {
  const [counts, setCounts] = useState<Partial<Record<ContentType, number>>>({});
  const [version, setVersion] = useState(0);
  const key = types.join(',');

  useEffect(() => {
    let ignore = false;
    const targets = key.split(',') as ContentType[];
    Promise.all(targets.map((type) => getContents(type, { page: 1, size: 1 })))
      .then((results) => {
        if (ignore) return;
        setCounts(Object.fromEntries(targets.map((type, i) => [type, results[i].meta.totalCount])));
      })
      // 배지는 보조 정보라 실패하면 숫자 없이 둔다
      .catch(() => undefined);
    return () => {
      ignore = true;
    };
  }, [key, version]);

  const reload = useCallback(() => setVersion((prev) => prev + 1), []);
  return { counts, reload };
}
