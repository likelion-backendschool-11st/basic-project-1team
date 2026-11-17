import { apiPageRequest, apiRequest, toQueryString, type PageResult } from './api';

/** 공지 (API_SPEC 9장). 헤더 공지 롤링과 Q&A 공지 화면이 함께 쓴다. */

/** 작성자 (API_SPEC 1.6 UserSummary) */
export interface NoticeAuthor {
  readonly id: number | null;
  readonly nickname: string;
  readonly profileImageUrl: string | null;
}

/** GET /api/notices 의 항목. 목록에는 본문이 없다 */
export interface NoticeSummary {
  readonly id: number;
  readonly title: string;
  readonly isPinned: boolean;
  readonly author: NoticeAuthor;
  readonly createdAt: string;
}

/** GET /api/notices/:noticeId */
export interface Notice extends NoticeSummary {
  /** 에디터 HTML (서버가 저장 전에 정리함, API_SPEC 1.9) */
  readonly body: string;
  readonly updatedAt: string;
}

export const noticeLabels = {
  tickerLabel: '공지',
  tickerAll: '전체 보기',
  listTitle: '공지사항',
  listDescription: 'GAMERS 운영진이 전하는 서비스 이용 안내와 점검 소식입니다.',
  pinned: '고정',
  columns: { title: '제목', author: '작성자', createdAt: '작성일' },
  empty: '등록된 공지사항이 없습니다.',
  notFound: '존재하지 않거나 삭제된 공지사항입니다.',
  loading: '불러오는 중입니다...',
  backToList: '목록으로',
} as const;

/** GET /api/notices. 고정 공지 먼저, 그다음 최신순 (헤더 롤링은 size=5) */
export function getNotices(page: number, size: number): Promise<PageResult<NoticeSummary>> {
  return apiPageRequest<NoticeSummary>(`/notices${toQueryString({ page, size })}`);
}

/** GET /api/notices/:noticeId. 없거나 삭제됐으면 404 NOTICE_NOT_FOUND */
export function getNotice(noticeId: number): Promise<Notice> {
  return apiRequest<Notice>(`/notices/${noticeId}`);
}

const pad = (n: number) => String(n).padStart(2, '0');

/** "2026-11-15" (보는 사람의 현지 날짜) */
export function formatNoticeDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
