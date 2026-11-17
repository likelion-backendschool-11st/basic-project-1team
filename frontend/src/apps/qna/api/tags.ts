import { apiRequest, toQueryString } from '../../../shared/api';
import type { TagDetail, TagSummary } from '../data/types';

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

/** GET /api/tags/:tagName (API_SPEC 5장). 병합된 이름이면 병합 대상 태그가 온다 */
export function getTagDetail(name: string): Promise<TagDetail> {
  return apiRequest<TagDetail>(`/tags/${encodeURIComponent(name)}`);
}

/** PATCH /api/tags/:tagName (API_SPEC 5장). ADMIN·Diamond 이상 회원. null 이면 설명을 지운다 */
export function updateTagDescription(name: string, description: string | null): Promise<TagDetail> {
  return apiRequest<TagDetail>(`/tags/${encodeURIComponent(name)}`, {
    method: 'PATCH',
    body: { description },
  });
}
