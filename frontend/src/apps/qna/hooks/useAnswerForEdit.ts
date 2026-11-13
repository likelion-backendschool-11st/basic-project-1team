import { useEffect, useState } from 'react';
import { ApiError, getErrorMessage } from '../../../shared/api';
import { getAnswer } from '../api/answers';
import { getQuestion } from '../api/questions';
import type { Answer, Question } from '../data/types';

/**
 * 답변 수정 화면의 처음 값. 수정할 답변(GET /api/answers/:answerId)과
 * 화면 위쪽 원본 질문 요약에 쓰는 질문(GET /api/questions/:questionId)을 함께 불러온다.
 * 숨김·삭제·없는 답변이거나 주소의 질문과 다른 질문의 답변이면 notFound.
 */
export function useAnswerForEdit(questionId: string, answerId: string) {
  const [answer, setAnswer] = useState<Answer | null>(null);
  const [question, setQuestion] = useState<Question | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;
    setLoading(true);
    Promise.all([getAnswer(answerId), getQuestion(questionId)])
      .then(([nextAnswer, nextQuestion]) => {
        if (ignore) return;
        if (nextAnswer.questionId !== nextQuestion.id) {
          setNotFound(true);
          return;
        }
        setAnswer(nextAnswer);
        setQuestion(nextQuestion);
      })
      .catch((error: unknown) => {
        if (ignore) return;
        // 형식이 잘못된 id(400)도 없는 답변으로 본다
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
  }, [questionId, answerId]);

  return { answer, question, loading, notFound, errorMessage };
}
