import { type FormEvent, useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useMe } from '../../../shared/me';
import { AUTHOR_PARAM, authorFilterCopy, userIdParam } from '../../../shared/site';
import { POST_PAGE_SIZE } from '../data/mockData';
import type { PostSort } from '../data/types';
import { pageNumbers } from '../format';
import { usePostList } from './usePostList';

/** 자유게시판 목록 (GET /api/posts). 검색·정렬·내 게시글·페이지 (REQ-BOARD-001·002·008) */
export function useBoard() {
  const me = useMe();
  const [draftQuery, setDraftQuery] = useState('');
  const [keyword, setKeyword] = useState('');
  const [sort, setSortState] = useState<PostSort>('latest');
  const [mineOnly, setMineOnly] = useState(false);
  const [page, setPage] = useState(1);

  // 회원 프로필 "전체 보기": 그 회원이 쓴 게시글만 (GET /api/posts?authorId=, API_SPEC 7장)
  const [params] = useSearchParams();
  const profileAuthorId = userIdParam(params.get(AUTHOR_PARAM));
  useEffect(() => setPage(1), [profileAuthorId]);

  // 내 게시글은 내 정보(회원 id)를 받은 뒤에 부른다
  const authorId = mineOnly ? me?.id : (profileAuthorId ?? undefined);
  const list = usePostList(
    { page, size: POST_PAGE_SIZE, sort, keyword: keyword || undefined, authorId },
    !mineOnly || me !== null,
  );

  // 조건의 회원 이름은 목록 응답의 작성자 닉네임으로 보여 준다
  const authorName =
    profileAuthorId === null
      ? null
      : (list.posts[0]?.author.nickname ?? authorFilterCopy.unknownUser(profileAuthorId));

  const submitSearch = useCallback(
    (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      // 앞뒤 공백을 지우고, 빈 값이면 조건을 적용하지 않는다 (API_SPEC 1.5)
      setKeyword(draftQuery.trim());
      setPage(1);
    },
    [draftQuery],
  );

  const setSort = useCallback((next: PostSort) => {
    setSortState(next);
    setPage(1);
  }, []);

  const toggleMineOnly = useCallback(() => {
    setMineOnly((v) => !v);
    setPage(1);
  }, []);

  const pages = pageNumbers(list.totalCount, POST_PAGE_SIZE);
  const goTo = useCallback(
    (next: number) => setPage(Math.min(Math.max(1, next), pages.length)),
    [pages.length],
  );

  return {
    posts: list.posts,
    loading: list.loading,
    errorMessage: list.errorMessage,
    page,
    pages,
    goTo,
    authorName,
    draftQuery,
    setDraftQuery,
    submitSearch,
    sort,
    setSort,
    mineOnly,
    toggleMineOnly,
  };
}
