import { useEffect, useState } from 'react';
import { ApiError, getErrorMessage } from '../../../shared/api';
import { getQuestions } from '../api/questions';
import { getTagDetail } from '../api/tags';
import type { QuestionListItem, TagDetail } from '../data/types';

/** 태그 상세에 보여 줄 최근 질문 수 */
const RECENT_QUESTION_SIZE = 5;

export interface TagDetailState {
  readonly tag: TagDetail | null;
  readonly recentQuestions: readonly QuestionListItem[];
  readonly loading: boolean;
  /** 없거나 차단된 태그 (404 TAG_NOT_FOUND), 또는 이름 형식이 틀림 (400) */
  readonly notFound: boolean;
  readonly errorMessage: string | null;
}

/**
 * 태그 상세 (GET /api/tags/:tagName)와 그 태그의 최근 질문 (GET /api/questions?tag=).
 * 병합된 이름으로 들어오면 서버가 병합 대상 태그를 주므로, 질문은 응답의 이름으로 찾는다.
 */
export function useTagDetail(name: string | undefined): TagDetailState {
  const [tag, setTag] = useState<TagDetail | null>(null);
  const [recentQuestions, setRecentQuestions] = useState<readonly QuestionListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!name) {
      setNotFound(true);
      setLoading(false);
      return undefined;
    }
    let ignore = false;
    setLoading(true);
    setNotFound(false);
    setErrorMessage(null);
    getTagDetail(name)
      .then(async (detail) => {
        const questions = await getQuestions({
          page: 1,
          size: RECENT_QUESTION_SIZE,
          sort: 'latest',
          scope: 'all',
          tag: detail.name,
        });
        if (ignore) return;
        setTag(detail);
        setRecentQuestions(questions.items);
      })
      .catch((error: unknown) => {
        if (ignore) return;
        setTag(null);
        if (
          error instanceof ApiError &&
          (error.code === 'TAG_NOT_FOUND' || error.code === 'VALIDATION_ERROR')
        ) {
          setNotFound(true);
        } else {
          setErrorMessage(getErrorMessage(error));
        }
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, [name]);

  return { tag, recentQuestions, loading, notFound, errorMessage };
}
