import { useEffect, useState } from 'react';
import { getErrorMessage } from '../../../shared/api';
import { getTags } from '../api/tags';
import type { TagSummary } from '../data/types';

export type TagListSort = 'popular' | 'name';

/** 한 번에 가져오는 태그 수. 목록 API 의 size 최대값 (API_SPEC 5장) */
export const TAG_LIST_SIZE = 100;
/** 입력이 멈춘 뒤 검색하기까지 기다리는 시간 */
const SEARCH_DELAY_MS = 300;

/**
 * 태그 목록 (GET /api/tags, REQ-TAG-001). 이름 앞부분 검색은 입력이 멈춘 뒤 부르고,
 * 늦게 온 이전 검색 결과는 버린다.
 */
export function useTagList() {
  const [keyword, setKeyword] = useState('');
  const [sort, setSort] = useState<TagListSort>('popular');
  const [tags, setTags] = useState<readonly TagSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;
    setLoading(true);
    const timer = window.setTimeout(() => {
      getTags({ sort, size: TAG_LIST_SIZE, keyword: keyword.trim() || undefined })
        .then((result) => {
          if (ignore) return;
          setTags(result);
          setErrorMessage(null);
        })
        .catch((error: unknown) => {
          if (!ignore) setErrorMessage(getErrorMessage(error));
        })
        .finally(() => {
          if (!ignore) setLoading(false);
        });
    }, SEARCH_DELAY_MS);
    return () => {
      ignore = true;
      window.clearTimeout(timer);
    };
  }, [keyword, sort]);

  return { keyword, setKeyword, sort, setSort, tags, loading, errorMessage };
}
