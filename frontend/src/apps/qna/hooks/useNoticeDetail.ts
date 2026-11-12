import { type Notice, notices } from '../../../shared/notices';

/**
 * 공지 상세. 화면은 이 hook 으로만 데이터를 받는다.
 * TODO: GET /api/notices/:noticeId 연동 (본문 `body` 는 HTML, 없으면 404 NOTICE_NOT_FOUND → null)
 */
export function useNoticeDetail(noticeId: string | undefined): Notice | null {
  return notices.find((n) => String(n.id) === noticeId) ?? null;
}
