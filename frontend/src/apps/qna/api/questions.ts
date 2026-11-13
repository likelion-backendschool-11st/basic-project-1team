import { apiPageRequest, apiRequest, toQueryString, type PageResult } from '../../../shared/api';
import type { QuestionListItem, QuestionListQuery, QuestionStats } from '../data/types';

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
