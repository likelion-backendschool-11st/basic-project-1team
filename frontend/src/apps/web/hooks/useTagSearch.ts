import { useEffect, useState } from 'react';
import { getErrorMessage } from '../../../shared/api';
import { normalizeTagName } from '../../../shared/tag';
import { searchTags, type TagSuggestion } from '../api/tags';

const DEBOUNCE_MS = 200;

/**
 * 태그 자동완성. 입력이 멈추면 검색하고, 늦게 온 이전 검색 결과는 버린다.
 * 빈 입력이면 검색하지 않는다
 */
export function useTagSearch(keyword: string) {
  const [suggestions, setSuggestions] = useState<readonly TagSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const normalized = normalizeTagName(keyword);

  useEffect(() => {
    if (!normalized) {
      setSuggestions([]);
      setLoading(false);
      setErrorMessage(null);
      return undefined;
    }
    let ignore = false;
    setLoading(true);
    const timer = window.setTimeout(() => {
      searchTags(normalized)
        .then((result) => {
          if (ignore) return;
          setSuggestions(result);
          setErrorMessage(null);
        })
        .catch((error: unknown) => {
          if (ignore) return;
          setSuggestions([]);
          setErrorMessage(getErrorMessage(error));
        })
        .finally(() => {
          if (!ignore) setLoading(false);
        });
    }, DEBOUNCE_MS);
    return () => {
      ignore = true;
      window.clearTimeout(timer);
    };
  }, [normalized]);

  return { suggestions, loading, errorMessage, hasKeyword: normalized !== '' };
}
