import { apiRequest, toQueryString } from '../../../shared/api';
import type { TagSummary } from '../data/types';

export interface TagListQuery {
  readonly sort: 'popular' | 'name';
  readonly size: number;
  /** 이름 앞부분 일치 (자동완성) */
  readonly keyword?: string;
}

/** GET /api/tags (API_SPEC 5장). 인기 태그·자동완성. 차단·병합된 태그는 오지 않는다 */
export function getTags(query: TagListQuery): Promise<TagSummary[]> {
  return apiRequest<TagSummary[]>(`/tags${toQueryString({ ...query })}`);
}
