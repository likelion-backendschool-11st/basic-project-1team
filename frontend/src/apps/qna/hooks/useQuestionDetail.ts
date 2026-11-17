import { useCallback, useEffect, useState } from 'react';
import { ApiError, getErrorMessage } from '../../../shared/api';
import { acceptAnswer, createAnswer, deleteAnswer, getAnswers } from '../api/answers';
import { deleteQuestion, getQuestion } from '../api/questions';
import { questionDetailLabels as L } from '../data/mockData';
import type { Answer, AnswerSort, Question } from '../data/types';

/**
 * 질문 상세와 답변 목록 (API_SPEC 3·4장). 화면은 이 hook 으로만 데이터를 받는다.
 * 답변을 등록·삭제·채택하면 질문(답변 수·채택 여부)과 답변 목록(canAccept 등)을 함께 다시 불러온다.
 */
export function useQuestionDetail(questionId: string) {
  const [question, setQuestion] = useState<Question | null>(null);
  const [answers, setAnswers] = useState<readonly Answer[]>([]);
  const [sort, setSort] = useState<AnswerSort>('latest');
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [version, setVersion] = useState(0);
  const reload = useCallback(() => setVersion((v) => v + 1), []);

  // 관련 질문 등으로 다른 질문에 들어오면 이전 질문을 보여 주지 않는다
  useEffect(() => {
    setQuestion(null);
    setAnswers([]);
    setLoading(true);
    setNotFound(false);
    setErrorMessage(null);
  }, [questionId]);

  useEffect(() => {
    let ignore = false;
    // 같은 회원(비회원은 IP)이 24시간 안에 다시 불러오면 조회수는 오르지 않는다 (REQ-QNA-015)
    getQuestion(questionId)
      .then((next) => {
        if (ignore) return;
        setQuestion(next);
        setErrorMessage(null);
      })
      .catch((error: unknown) => {
        if (ignore) return;
        // 숨김·삭제·없는 질문(404)과 형식이 잘못된 id(400)는 없는 질문으로 보여 준다
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
  }, [questionId, version]);

  useEffect(() => {
    let ignore = false;
    getAnswers(questionId, sort)
      .then((next) => {
        if (!ignore) setAnswers(next);
      })
      // 질문을 불러오지 못한 경우는 위에서 안내하므로 답변 목록 오류는 빈 목록으로 둔다
      .catch(() => {
        if (!ignore) setAnswers([]);
      });
    return () => {
      ignore = true;
    };
  }, [questionId, sort, version]);

  /** 답변 등록. 성공하면 등록한 답변, 실패하면 안내 후 null */
  const addAnswer = async (body: string): Promise<Answer | null> => {
    try {
      const created = await createAnswer(questionId, body);
      reload();
      return created;
    } catch (error) {
      window.alert(getErrorMessage(error));
      return null;
    }
  };

  /**
   * 질문 삭제. 삭제 상태로만 바뀐다 (API_SPEC 1.7). 삭제하면 true.
   * 숨김 답변까지 세므로 답변 수가 0이어도 서버가 거절할 수 있다 (409 QUESTION_HAS_ANSWERS)
   */
  const removeQuestion = async (): Promise<boolean> => {
    if (question && question.answerCount > 0) {
      window.alert(L.removeBlockedAlert);
      return false;
    }
    if (!window.confirm(L.removeConfirm)) return false;
    try {
      await deleteQuestion(questionId);
      window.alert(L.removed);
      return true;
    } catch (error) {
      window.alert(getErrorMessage(error));
      return false;
    }
  };

  /** 답변 삭제. 채택된 답변은 서버가 막는다 (409 ANSWER_ALREADY_ACCEPTED) */
  const removeAnswer = async (answer: Answer) => {
    if (!window.confirm(L.answerRemoveConfirm)) return;
    try {
      await deleteAnswer(answer.id);
      reload();
    } catch (error) {
      window.alert(getErrorMessage(error));
    }
  };

  /** 답변 채택. 질문당 1개이고 취소할 수 없다 (API_SPEC 4장) */
  const accept = async (answer: Answer) => {
    if (!window.confirm(L.acceptConfirm)) return;
    try {
      await acceptAnswer(answer.id);
      reload();
    } catch (error) {
      window.alert(getErrorMessage(error));
    }
  };

  return {
    question,
    answers,
    sort,
    // 선택지는 questionDetailLabels.answerSort 의 값만 온다
    setSort: (value: string) => setSort(value as AnswerSort),
    loading,
    notFound,
    errorMessage,
    addAnswer,
    removeQuestion,
    removeAnswer,
    accept,
  };
}
