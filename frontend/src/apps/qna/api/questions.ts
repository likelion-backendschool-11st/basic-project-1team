import { apiPageRequest, apiRequest, toQueryString, type PageResult } from '../../../shared/api';
import type {
  Question,
  QuestionInput,
  QuestionListItem,
  QuestionListQuery,
  QuestionStats,
  QuestionUpdateInput,
} from '../data/types';

const toFlag = (value: boolean | undefined) => (value === undefined ? undefined : String(value));

/** GET /api/questions (API_SPEC 3장). 검색·필터·정렬·페이징 */
export function getQuestions(query: QuestionListQuery): Promise<PageResult<QuestionListItem>> {
  return apiPageRequest<QuestionListItem>(
    `/questions${toQueryString({
      ...query,
      hasAnswer: toFlag(query.hasAnswer),
      isAccepted: toFlag(query.isAccepted),
    })}`,
  );
}

/** GET /api/questions/stats (API_SPEC 3장). 질문 목록 하단 커뮤니티 통계 */
export function getQuestionStats(): Promise<QuestionStats> {
  return apiRequest<QuestionStats>('/questions/stats');
}

/** GET /api/questions/:questionId (API_SPEC 3장). 같은 회원은 24시간에 한 번 조회수가 오른다 */
export function getQuestion(questionId: number | string): Promise<Question> {
  return apiRequest<Question>(`/questions/${questionId}`);
}

/** POST /api/questions (API_SPEC 3장). 없는 태그는 서버가 만든다 */
export function createQuestion(input: QuestionInput): Promise<Question> {
  return apiRequest<Question>('/questions', { method: 'POST', body: input });
}

/** PATCH /api/questions/:questionId (API_SPEC 3장). 작성자만, 보낸 필드만 수정 */
export function updateQuestion(
  questionId: number | string,
  input: QuestionUpdateInput,
): Promise<Question> {
  return apiRequest<Question>(`/questions/${questionId}`, { method: 'PATCH', body: input });
}
