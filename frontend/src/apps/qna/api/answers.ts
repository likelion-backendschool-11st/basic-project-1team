import { apiRequest, toQueryString } from '../../../shared/api';
import type { Answer, AnswerSort, EditHistory, VoteResult } from '../data/types';

/** GET /api/questions/:questionId/answers (API_SPEC 4장). 채택된 답변이 맨 위, 페이지 없이 전체 */
export function getAnswers(questionId: number | string, sort: AnswerSort): Promise<Answer[]> {
  return apiRequest<Answer[]>(`/questions/${questionId}/answers${toQueryString({ sort })}`);
}

/** POST /api/questions/:questionId/answers (API_SPEC 4장) */
export function createAnswer(questionId: number | string, body: string): Promise<Answer> {
  return apiRequest<Answer>(`/questions/${questionId}/answers`, {
    method: 'POST',
    body: { body },
  });
}

/** DELETE /api/answers/:answerId (API_SPEC 4장). 채택된 답변은 409 ANSWER_ALREADY_ACCEPTED */
export function deleteAnswer(answerId: number): Promise<void> {
  return apiRequest<void>(`/answers/${answerId}`, { method: 'DELETE' });
}

/** POST /api/answers/:answerId/accept (API_SPEC 4장). 질문 작성자만, 질문당 1개, 취소 불가 */
export function acceptAnswer(answerId: number): Promise<Answer> {
  return apiRequest<Answer>(`/answers/${answerId}/accept`, { method: 'POST' });
}

/** POST /api/answers/:answerId/votes (API_SPEC 4장). 본인 답변은 400 */
export function voteAnswer(answerId: number): Promise<VoteResult> {
  return apiRequest<VoteResult>(`/answers/${answerId}/votes`, { method: 'POST' });
}

/** DELETE /api/answers/:answerId/votes (API_SPEC 4장). 토글이라 204 대신 200 으로 상태를 돌려준다 */
export function cancelAnswerVote(answerId: number): Promise<VoteResult> {
  return apiRequest<VoteResult>(`/answers/${answerId}/votes`, { method: 'DELETE' });
}

/** GET /api/answers/:answerId/edit-histories (API_SPEC 4장). 최신순 전체 */
export function getAnswerEditHistories(answerId: number): Promise<EditHistory[]> {
  return apiRequest<EditHistory[]>(`/answers/${answerId}/edit-histories`);
}
