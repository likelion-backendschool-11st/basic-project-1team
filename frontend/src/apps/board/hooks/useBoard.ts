import { type FormEvent, useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { isLoggedIn } from '../../../shared/auth';
import { CURRENT_USER, type Post, initialPosts, routes } from '../data/mockData';
import { isPostDeleted } from '../data/mockStore';

export type SortMode = 'latest' | 'oldest';

export function useBoard() {
  const navigate = useNavigate();
  const [posts] = useState<Post[]>(initialPosts);
  const [draftQuery, setDraftQuery] = useState('');
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<SortMode>('latest');
  const [mineOnly, setMineOnly] = useState(false);

  const visible = useMemo(() => {
    // 제목 검색은 대소문자를 구분한다 (API_SPEC 1.10)
    const q = query;
    return posts
      .filter((p) => !isPostDeleted(p.id))
      .filter((p) => (q === '' || p.title.includes(q)) && (!mineOnly || p.author === CURRENT_USER))
      .sort((a, b) => (sort === 'latest' ? a.id - b.id : b.id - a.id));
  }, [posts, query, sort, mineOnly]);

  const submitSearch = useCallback(
    (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setQuery(draftQuery.trim());
    },
    [draftQuery],
  );

  const toggleMineOnly = useCallback(() => setMineOnly((v) => !v), []);

  /** 수정 화면으로 이동한다. 제목·본문을 에디터로 함께 고친다. */
  const editPost = useCallback((post: Post) => navigate(routes.edit(post.id)), [navigate]);

  const isOwner = useCallback((post: Post) => isLoggedIn() && post.author === CURRENT_USER, []);

  return {
    visible,
    draftQuery,
    setDraftQuery,
    submitSearch,
    sort,
    setSort,
    mineOnly,
    toggleMineOnly,
    editPost,
    isOwner,
  };
}
