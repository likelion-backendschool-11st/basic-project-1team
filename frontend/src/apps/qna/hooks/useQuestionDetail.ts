import { useState } from 'react';
import { answerComposer, answers as mockAnswers, questionDetail } from '../data/mockData';
import type { Answer, QuestionDetail } from '../data/types';

const pad = (n: number) => String(n).padStart(2, '0');
const formatNow = () => {
  const d = new Date();
  return `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

/**
 * 질문 상세와 답변 목록. 화면은 이 hook 으로만 데이터를 받는다.
 * API 연동 시 아래 mock 을 요청으로 바꾸면 된다.
 * - 질문: GET /api/questions/:questionId (본문 `body` 는 HTML)
 * - 답변: GET /api/questions/:questionId/answers, 등록: POST /api/questions/:questionId/answers
 */
export function useQuestionDetail(_questionId: string) {
  // TODO: API 연동 (mock 은 모든 id 에 같은 질문을 보여 준다)
  const question: QuestionDetail = questionDetail;
  const [answers, setAnswers] = useState<readonly Answer[]>(mockAnswers);

  /** 답변 등록. 서버 응답(Answer)을 목록에 넣는다 */
  const addAnswer = (body: string) => {
    // TODO: POST /api/questions/:questionId/answers { body, attachmentIds }
    const created: Answer = {
      id: `new-${Date.now()}`,
      accepted: false,
      answeredAt: formatNow(),
      body,
      author: answerComposer.mockAuthor,
      votes: 0,
      canEdit: true,
      canAccept: false,
    };
    setAnswers((prev) => [...prev, created]);
    return created;
  };

  return { question, answers, addAnswer };
}
