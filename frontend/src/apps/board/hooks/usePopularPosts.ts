import { useEffect, useState } from 'react';
import { getPopularPosts } from '../api/posts';
import type { PopularPost } from '../data/types';

/**
 * 목록 위 인기글 순위 (GET /api/posts/popular, REQ-BOARD-013).
 * 부가 정보라 실패하면 오류를 띄우지 않고 순위만 숨긴다.
 */
export function usePopularPosts() {
  const [posts, setPosts] = useState<readonly PopularPost[]>([]);

  useEffect(() => {
    let ignore = false;
    getPopularPosts()
      .then((result) => {
        if (!ignore) setPosts(result);
      })
      .catch(() => {
        if (!ignore) setPosts([]);
      });
    return () => {
      ignore = true;
    };
  }, []);

  return { posts };
}
