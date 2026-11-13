import { useEffect, useState } from 'react';
import { ApiError, getErrorMessage } from '../../../shared/api';
import { getQuestion } from '../api/questions';
import type { Question } from '../data/types';

/** 질문 수정 화면의 처음 값 (GET /api/questions/:questionId). 숨김·삭제·없는 질문이면 notFound */
export function useQuestionForEdit(questionId: string) {
  const [question, setQuestion] = useState<Question | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;
    setLoading(true);
    getQuestion(questionId)
      .then((next) => {
        if (!ignore) setQuestion(next);
      })
      .catch((error: unknown) => {
        if (ignore) return;
        // 형식이 잘못된 id(400)도 없는 질문으로 본다
        if (error instanceof ApiError && (error.status === 404 || error.status === 400)) {
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
  }, [questionId]);

  return { question, loading, notFound, errorMessage };
}
