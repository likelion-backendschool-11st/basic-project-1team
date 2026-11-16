import { apiRequest, toQueryString } from '../../../shared/api';

export interface TagSuggestion {
  readonly id: number;
  readonly name: string;
  readonly questionCount: number;
}

/** GET /api/tags (API_SPEC 5장). 이름 앞부분 일치 자동완성. 차단·병합된 태그는 오지 않는다 */
export function searchTags(keyword: string, size = 8): Promise<TagSuggestion[]> {
  return apiRequest<TagSuggestion[]>(`/tags${toQueryString({ keyword, size })}`);
}
