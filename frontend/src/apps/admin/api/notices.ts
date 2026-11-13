import { apiPageRequest, apiRequest, toQueryString, type PageResult } from '../../../shared/api';
import type { Notice } from '../types';

/** GET /api/admin/notices. 고정 공지 먼저, 그다음 최신순. 수정 화면을 위해 본문 포함 (API_SPEC 10.7) */
export function getNotices(page: number, size: number): Promise<PageResult<Notice>> {
  return apiPageRequest<Notice>(`/admin/notices${toQueryString({ page, size })}`);
}

export interface NoticeInput {
  readonly title: string;
  /** 에디터 HTML. 서버가 저장 규칙대로 정리한다 (API_SPEC 1.9) */
  readonly body: string;
  readonly isPinned: boolean;
}

/** POST /api/admin/notices */
export function createNotice(input: NoticeInput): Promise<Notice> {
  return apiRequest<Notice>('/admin/notices', { method: 'POST', body: input });
}

/** PATCH /api/admin/notices/:noticeId. 보낸 필드만 바뀐다 */
export function updateNotice(noticeId: number, input: Partial<NoticeInput>): Promise<Notice> {
  return apiRequest<Notice>(`/admin/notices/${noticeId}`, { method: 'PATCH', body: input });
}

/** DELETE /api/admin/notices/:noticeId. 삭제 상태로 바뀌어 사용자 화면과 관리자 목록에서 빠진다 */
export function deleteNotice(noticeId: number): Promise<void> {
  return apiRequest<void>(`/admin/notices/${noticeId}`, { method: 'DELETE' });
}
