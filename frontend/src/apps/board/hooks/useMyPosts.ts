import { useCallback, useState } from 'react';
import { useMe } from '../../../shared/me';
import { MY_POSTS_ROWS } from '../data/mockData';
import { pageNumbers } from '../format';
import { usePostList } from './usePostList';

/** 내 게시글 목록 (GET /api/posts?authorId=<내 id>, API_SPEC 7장). 최신순 */
export function useMyPosts() {
  const me = useMe();
  const [page, setPage] = useState(1);
  const list = usePostList(
    { page, size: MY_POSTS_ROWS, sort: 'latest', authorId: me?.id },
    me !== null,
  );

  const pages = pageNumbers(list.totalCount, MY_POSTS_ROWS);
  const goTo = useCallback(
    (next: number) => setPage(Math.min(Math.max(1, next), pages.length)),
    [pages.length],
  );

  return {
    posts: list.posts,
    // 내 정보를 받기 전에는 목록도 불러오는 중으로 본다
    loading: me === null || list.loading,
    errorMessage: list.errorMessage,
    /** 화면 NO 칸. 페이지가 바뀌어도 이어서 센다 */
    startNo: (page - 1) * MY_POSTS_ROWS + 1,
    page,
    pages,
    goTo,
  };
}
