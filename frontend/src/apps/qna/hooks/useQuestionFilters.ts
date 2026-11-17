import { useEffect, useMemo, useState } from 'react';
import { normalizeTagName } from '../../../shared/tag';
import type { QuestionSearchScope, QuestionSort } from '../data/types';

/** 태그 필터 입력이 멈추고 이만큼 지나면 적용한다. 글자를 칠 때마다 목록을 다시 부르지 않도록 */
const TAG_INPUT_DELAY_MS = 300;

/** GET /api/questions 로 보내는 검색·필터 조건 (API_SPEC 3장) */
export interface QuestionFilters {
  readonly sort: QuestionSort;
  readonly scope: QuestionSearchScope;
  readonly keyword?: string;
  readonly tag?: string;
  readonly hasAnswer?: boolean;
  readonly isAccepted?: boolean;
}

/**
 * 질문 목록의 검색·정렬·필터 입력 상태.
 * 검색어는 Enter·버튼으로 적용하고, 정렬·필터·빠른 태그는 고르자마자 적용한다.
 * `urlTag` 는 다른 화면의 태그 링크(/qna/questions?tag=...)로 들어온 태그.
 */
export function useQuestionFilters(urlTag: string | null) {
  const [scope, setScope] = useState<QuestionSearchScope>('all');
  const [query, setQuery] = useState('');
  const [keyword, setKeyword] = useState('');
  const [sort, setSort] = useState<QuestionSort>('latest');
  const [panelOpen, setPanelOpen] = useState(false);
  const [answerFilter, setAnswerFilter] = useState('all');
  const [acceptedFilter, setAcceptedFilter] = useState('all');
  const [tagFilter, setTagFilter] = useState(urlTag ?? '');
  const [appliedTag, setAppliedTag] = useState(urlTag ?? '');

  useEffect(() => {
    setTagFilter(urlTag ?? '');
    setAppliedTag(urlTag ?? '');
  }, [urlTag]);

  useEffect(() => {
    const timer = setTimeout(() => setAppliedTag(tagFilter), TAG_INPUT_DELAY_MS);
    return () => clearTimeout(timer);
  }, [tagFilter]);

  /** 빠른 태그: 태그 이름 정확히 일치로 거른다 (API_SPEC 3장 `tag`). 빈 값이면 전체 */
  const selectTag = (tag: string) => {
    setTagFilter(tag);
    setAppliedTag(tag);
  };

  const reset = () => {
    setQuery('');
    setKeyword('');
    setAnswerFilter('all');
    setAcceptedFilter('all');
    selectTag('');
  };

  const activeTag = normalizeTagName(appliedTag);

  const filters = useMemo<QuestionFilters>(
    () => ({
      sort,
      scope,
      keyword: keyword || undefined,
      tag: activeTag || undefined,
      hasAnswer: answerFilter === 'all' ? undefined : answerFilter === 'has_answer',
      isAccepted: acceptedFilter === 'all' ? undefined : acceptedFilter === 'accepted_only',
    }),
    [sort, scope, keyword, activeTag, answerFilter, acceptedFilter],
  );

  return {
    filters,
    scope,
    // 선택지는 filterPanel·searchScopes·sortOptions 의 값만 온다
    setScope: (value: string) => setScope(value as QuestionSearchScope),
    query,
    setQuery,
    submitSearch: () => setKeyword(query.trim()),
    sort,
    setSort: (value: string) => setSort(value as QuestionSort),
    panelOpen,
    togglePanel: () => setPanelOpen((open) => !open),
    activeTag,
    selectTag,
    answerFilter,
    setAnswerFilter,
    acceptedFilter,
    setAcceptedFilter,
    tagFilter,
    setTagFilter,
    reset,
  };
}
