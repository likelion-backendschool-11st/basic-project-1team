import { useEffect, useState } from 'react';
import { getErrorMessage, type PageResult } from '../../../shared/api';
import { getQuestions } from '../api/questions';
import type { QuestionListItem, QuestionSort } from '../data/types';
import type { QuestionFilters } from './useQuestionFilters';

const PAGE_SIZE = 10;
/** 받은 목록과 그 목록을 부른 정렬. 다음 목록을 불러오는 동안에도 번호를 이 값으로 센다 */
type QuestionListResult = PageResult<QuestionListItem> & { readonly sort: QuestionSort };
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
  const [result, setResult] = useState<QuestionListResult | null>(null);
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
        setResult({ ...next, sort: filters.sort });
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
  const goTo = (next: number) =>
    setPaging({ conditionKey, page: Math.min(Math.max(1, next), totalPages) });
  // 화면 번호 칸. id는 운영 DB에서 이어지지 않아 페이지 정보로 센다.
  // 최신순은 거꾸로, 조회순은 순위처럼 1부터 센다 (API_SPEC 3장)
  const numberAt = (index: number) => {
    if (result === null) return index + 1;
    const offset = (result.meta.page - 1) * result.meta.size;
    return result.sort === 'latest' ? result.meta.totalCount - offset - index : offset + index + 1;
  };

  return {
    questions: errorMessage === null ? (result?.items ?? []) : [],
    numberAt,
    totalCount,
    loading,
    errorMessage,
    page,
    totalPages,
    goTo,
  };
}
