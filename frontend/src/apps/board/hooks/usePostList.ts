import { useEffect, useState } from 'react';
import { getErrorMessage } from '../../../shared/api';
import { getPosts, type PostListQuery } from '../api/posts';
import type { PostSummary } from '../data/types';

interface PostListState {
  readonly posts: readonly PostSummary[];
  readonly totalCount: number;
  readonly errorMessage: string | null;
}

const EMPTY: PostListState = { posts: [], totalCount: 0, errorMessage: null };

/**
 * 게시글 목록 조회 (GET /api/posts). 조건이 바뀌면 다시 부른다.
 * `enabled` 가 false 면 부르지 않는다 (내 게시글처럼 내 정보를 아직 못 받았을 때).
 */
export function usePostList(
  { page, size, sort, keyword, authorId }: PostListQuery,
  enabled = true,
) {
  const [state, setState] = useState<PostListState>(EMPTY);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!enabled) return;
    // 응답이 늦게 온 이전 요청이 최신 결과를 덮어쓰지 않도록 한다 (CODE_CONVENTION 12.2)
    let ignore = false;
    setLoading(true);
    getPosts({ page, size, sort, keyword, authorId })
      .then((result) => {
        if (ignore) return;
        setState({ posts: result.items, totalCount: result.meta.totalCount, errorMessage: null });
      })
      .catch((error: unknown) => {
        if (ignore) return;
        setState({ ...EMPTY, errorMessage: getErrorMessage(error) });
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, [page, size, sort, keyword, authorId, enabled]);

  return { ...state, loading };
}
