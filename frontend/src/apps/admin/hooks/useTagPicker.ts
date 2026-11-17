import { useCallback, useEffect, useState } from 'react';
import { getTags } from '../api/tags';
import type { Tag } from '../types';

/** 후보는 몇 개만 보여 준다 */
const SUGGESTION_SIZE = 6;
/** 입력이 멈춘 뒤 검색한다 */
const SEARCH_DELAY_MS = 250;

export interface TagPickerState {
  readonly query: string;
  readonly setQuery: (value: string) => void;
  readonly selected: Tag | null;
  readonly select: (tag: Tag) => void;
  readonly clear: () => void;
  readonly suggestions: readonly Tag[];
}

/**
 * 태그 병합 창의 대상 태그 검색·선택.
 * 대상은 사용 중(active) 태그만 고를 수 있어 서버에서 active 태그만 찾는다 (API_SPEC 10.5)
 */
export function useTagPicker(excludeId: number | undefined): TagPickerState {
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<Tag | null>(null);
  const [suggestions, setSuggestions] = useState<readonly Tag[]>([]);

  useEffect(() => {
    const keyword = query.trim();
    if (!keyword || selected) {
      setSuggestions([]);
      return undefined;
    }
    let ignore = false;
    const timer = setTimeout(() => {
      // 원본은 빼야 하므로 하나 더 받아 둔다
      getTags({ page: 1, size: SUGGESTION_SIZE + 1, keyword, status: 'active', sort: 'usage_desc' })
        .then((result) => {
          if (ignore) return;
          setSuggestions(
            result.items.filter((tag) => tag.id !== excludeId).slice(0, SUGGESTION_SIZE),
          );
        })
        // 후보를 못 불러와도 다시 입력하면 된다
        .catch(() => {
          if (!ignore) setSuggestions([]);
        });
    }, SEARCH_DELAY_MS);
    return () => {
      ignore = true;
      clearTimeout(timer);
    };
  }, [query, selected, excludeId]);

  const select = useCallback((tag: Tag) => {
    setSelected(tag);
    setQuery('');
  }, []);

  const clear = useCallback(() => setSelected(null), []);

  return { query, setQuery, selected, select, clear, suggestions };
}
