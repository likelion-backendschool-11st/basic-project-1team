import { apiPageRequest, apiRequest, toQueryString, type PageResult } from '../../../shared/api';
import type { Tag, TagStatus } from '../types';

export type TagSort = 'usage_desc' | 'name_asc' | 'recent';

export interface TagListQuery {
  readonly page: number;
  readonly size: number;
  /** 이름 부분 일치. 서버가 태그 규칙대로 정규화해서 찾는다 */
  readonly keyword?: string;
  readonly sort?: TagSort;
  /** 생략하면 전체 */
  readonly status?: TagStatus;
}

/** GET /api/admin/tags (API_SPEC 10.5) */
export function getTags(query: TagListQuery): Promise<PageResult<Tag>> {
  return apiPageRequest<Tag>(`/admin/tags${toQueryString({ ...query })}`);
}

/** POST /api/admin/tags. 차단된 이름은 400 TAG_BLOCKED, 있는 이름은 409 TAG_DUPLICATED */
export function createTag(body: { name: string; description: string }): Promise<Tag> {
  return apiRequest<Tag>('/admin/tags', { method: 'POST', body });
}

/** PATCH /api/admin/tags/:tagId. 보낸 필드만 바꾸고, 차단 해제는 { status: 'active' } */
export function updateTag(
  tagId: number,
  changes: { name?: string; description?: string; status?: 'active' },
): Promise<Tag> {
  return apiRequest<Tag>(`/admin/tags/${tagId}`, { method: 'PATCH', body: changes });
}

/** DELETE /api/admin/tags/:tagId. 삭제 = 차단, 질문 연결만 끊는다 */
export function deleteTag(tagId: number): Promise<void> {
  return apiRequest<void>(`/admin/tags/${tagId}`, { method: 'DELETE' });
}
