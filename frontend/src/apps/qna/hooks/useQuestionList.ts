import { useEffect, useMemo, useState } from 'react';
import { getErrorMessage, type PageResult } from '../../../shared/api';
import { getQuestions } from '../api/questions';
import type { QuestionListItem } from '../data/types';
import type { QuestionFilters } from './useQuestionFilters';

const PAGE_SIZE = 10;
/** 페이지 번호 버튼을 한 번에 몇 개 보여 줄지 */
const VISIBLE_PAGES = 5;

/** 지금 페이지를 가운데에 두고 VISIBLE_PAGES 개의 페이지 번호를 만든다 */
function pageWindow(page: number, totalPages: number): number[] {
  const start = Math.max(
    1,
    Math.min(page - Math.floor(VISIBLE_PAGES / 2), totalPages - VISIBLE_PAGES + 1),
  );
  return Array.from({ length: Math.min(VISIBLE_PAGES, totalPages) }, (_, i) => start + i);
}

/**
 * 질문 목록 (GET /api/questions, API_SPEC 3장).
 * 검색·필터·회원 조건이 바뀌면 1페이지부터 다시 불러오고, 늦게 온 이전 응답은 버린다.
 * `authorId`·`answerAuthorId` 는 프로필의 "전체 보기"로 들어온 회원 조건.
 */
export function useQuestionList(
  filters: QuestionFilters,
  authorId: number | null,
  answerAuthorId: number | null,
) {
  const conditionKey = JSON.stringify([filters, authorId, answerAuthorId]);
  // 조건이 바뀐 첫 렌더부터 1페이지로 부르도록, 페이지를 조건과 함께 기억한다
  const [paging, setPaging] = useState({ conditionKey, page: 1 });
  const page = paging.conditionKey === conditionKey ? paging.page : 1;
  const [result, setResult] = useState<PageResult<QuestionListItem> | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;
    setLoading(true);
    getQuestions({
      ...filters,
      page,
      size: PAGE_SIZE,
      authorId: authorId ?? undefined,
      answerAuthorId: answerAuthorId ?? undefined,
    })
      .then((next) => {
        if (ignore) return;
        setResult(next);
        setErrorMessage(null);
      })
      .catch((error: unknown) => {
        if (!ignore) setErrorMessage(getErrorMessage(error));
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, [filters, authorId, answerAuthorId, page]);

  const totalCount = result?.meta.totalCount ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const pages = useMemo(() => pageWindow(page, totalPages), [page, totalPages]);
  const goTo = (next: number) =>
    setPaging({ conditionKey, page: Math.min(Math.max(1, next), totalPages) });

  return {
    questions: errorMessage === null ? (result?.items ?? []) : [],
    totalCount,
    loading,
    errorMessage,
    page,
    pages,
    totalPages,
    hasPrev: page > 1,
    hasNext: page < totalPages,
    goTo,
    prev: () => goTo(page - 1),
    next: () => goTo(page + 1),
  };
}
