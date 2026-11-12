import { useState } from 'react';
import {
  answerComposer,
  answers as mockAnswers,
  questionDetail,
  questionDetailLabels as L,
  questions,
} from '../data/mockData';
import {
  isAnswerDeleted,
  isQuestionDeleted,
  markAnswerDeleted,
  markQuestionDeleted,
} from '../data/mockStore';
import type { Answer, Attachment, QuestionDetail } from '../data/types';

const pad = (n: number) => String(n).padStart(2, '0');
const formatNow = () => {
  const d = new Date();
  return `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

/**
 * 질문 상세와 답변 목록. 화면은 이 hook 으로만 데이터를 받는다.
 * API 연동 시 아래 mock 을 요청으로 바꾸면 된다.
 * - 질문: GET /api/questions/:questionId (본문 `body` 는 HTML), 삭제: DELETE /api/questions/:questionId
 * - 답변: GET /api/questions/:questionId/answers, 등록: POST, 삭제: DELETE /api/answers/:answerId
 */
export function useQuestionDetail(questionId: string) {
  // TODO: API 연동. mock 은 모든 id 에 같은 질문을 보여 주고, 목록에서 답변이 0개인 질문은 답변 없이 보여 준다
  const summary = questions.find((q) => String(q.id) === questionId);
  const question: QuestionDetail = {
    ...questionDetail,
    id: Number(questionId) || questionDetail.id,
    title: summary?.title ?? questionDetail.title,
  };
  const [answers, setAnswers] = useState<readonly Answer[]>(() =>
    summary?.answers === 0 ? [] : mockAnswers.filter((a) => !isAnswerDeleted(a.id)),
  );

  /** 답변 등록. 서버 응답(Answer)을 목록에 넣는다 */
  const addAnswer = (body: string, attachments: readonly Attachment[] = []) => {
    // TODO: POST /api/questions/:questionId/answers { body, attachmentIds }
    const created: Answer = {
      id: `new-${Date.now()}`,
      accepted: false,
      answeredAt: formatNow(),
      body,
      attachments,
      author: answerComposer.mockAuthor,
      votes: 0,
      canEdit: true,
      canAccept: false,
    };
    setAnswers((prev) => [...prev, created]);
    return created;
  };

  /**
   * 질문 삭제. 답변이 있으면 막는다 (409 QUESTION_HAS_ANSWERS).
   * 행을 지우지 않고 삭제 상태로 바꾼다 (API_SPEC 1.7). 삭제하면 true.
   */
  const removeQuestion = () => {
    if (answers.length > 0) {
      window.alert(L.removeBlockedAlert);
      return false;
    }
    if (!window.confirm(L.removeConfirm)) return false;
    markQuestionDeleted(questionId);
    window.alert(L.removed);
    return true;
  };

  /** 답변 삭제. 채택된 답변은 삭제할 수 없다 (409 ANSWER_ALREADY_ACCEPTED) */
  const removeAnswer = (answer: Answer) => {
    if (answer.accepted || !window.confirm(L.answerRemoveConfirm)) return;
    markAnswerDeleted(answer.id);
    setAnswers((prev) => prev.filter((a) => a.id !== answer.id));
  };

  return {
    question,
    answers,
    notFound: isQuestionDeleted(questionId),
    addAnswer,
    removeQuestion,
    removeAnswer,
  };
}
