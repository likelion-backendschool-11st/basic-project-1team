import { useEffect, useState } from 'react';
import { getTags } from '../api/tags';

/** 질문 목록 "인기 게임 태그" 개수 (API_SPEC 5장 사용 예) */
const POPULAR_TAG_COUNT = 8;

/** 질문 수가 많은 태그 이름. 불러오지 못하면 빈 목록이라 빠른 태그만 숨겨진다 */
export function usePopularTags(): readonly string[] {
  const [names, setNames] = useState<readonly string[]>([]);

  useEffect(() => {
    let ignore = false;
    getTags({ sort: 'popular', size: POPULAR_TAG_COUNT })
      .then((tags) => {
        if (!ignore) setNames(tags.map((tag) => tag.name));
      })
      .catch(() => undefined);
    return () => {
      ignore = true;
    };
  }, []);

  return names;
}
