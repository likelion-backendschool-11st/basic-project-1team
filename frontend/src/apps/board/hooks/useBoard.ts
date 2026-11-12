import { FormEvent, useCallback, useMemo, useState } from 'react';
import { isLoggedIn } from '../../../shared/auth';
import { CURRENT_USER, Post, initialPosts, labels } from '../data/mockData';

export type SortMode = 'latest' | 'oldest';

export function useBoard() {
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [draftQuery, setDraftQuery] = useState('');
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<SortMode>('latest');
  const [mineOnly, setMineOnly] = useState(false);

  const visible = useMemo(() => {
    // 제목 검색은 대소문자를 구분한다 (API_SPEC 1.10)
    const q = query;
    return posts
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

  const editTitle = useCallback((post: Post) => {
    const next = window.prompt(labels.editPrompt, post.title)?.trim();
    if (!next) return;
    setPosts((list) => list.map((p) => (p.id === post.id ? { ...p, title: next } : p)));
  }, []);

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
    editTitle,
    isOwner,
  };
}
