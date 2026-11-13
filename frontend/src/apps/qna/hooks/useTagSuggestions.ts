import { useEffect, useState } from 'react';
import { isValidTagName, normalizeTagName } from '../../../shared/tag';
import { getTags } from '../api/tags';

/** 추천 태그 개수 (API_SPEC 5장 사용 예: 추천 태그 size=5) */
const SUGGESTION_COUNT = 5;
/** 입력이 멈추고 이만큼 지나면 자동완성을 부른다. 글자마다 요청하지 않도록 */
const INPUT_DELAY_MS = 200;

/**
 * 태그 입력 아래 추천 태그 (REQ-TAG-007).
 * 입력 중이면 이름 앞부분 일치 자동완성, 비어 있으면 인기 태그. 이미 고른 태그는 뺀다.
 */
export function useTagSuggestions(input: string, selected: readonly string[]): readonly string[] {
  const [names, setNames] = useState<readonly string[]>([]);
  const keyword = normalizeTagName(input);

  useEffect(() => {
    // 규칙에 맞지 않는 글자가 섞이면 맞는 태그가 없으므로 부르지 않는다
    if (keyword && !isValidTagName(keyword)) {
      setNames([]);
      return undefined;
    }
    let ignore = false;
    const timer = setTimeout(() => {
      getTags({
        sort: 'popular',
        // 고른 태그를 빼도 SUGGESTION_COUNT 개가 남도록 넉넉히 받는다
        size: SUGGESTION_COUNT * 2,
        keyword: keyword || undefined,
      })
        .then((tags) => {
          if (!ignore) setNames(tags.map((tag) => tag.name));
        })
        .catch(() => {
          if (!ignore) setNames([]);
        });
    }, INPUT_DELAY_MS);
    return () => {
      ignore = true;
      clearTimeout(timer);
    };
  }, [keyword]);

  return names.filter((name) => !selected.includes(name)).slice(0, SUGGESTION_COUNT);
}
