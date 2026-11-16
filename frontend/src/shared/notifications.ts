import { apiPageRequest, apiRequest, type PageMeta, type PageResult, toQueryString } from './api';
import { noticePaths, site } from './site';

/**
 * 헤더 알림 센터 (API_SPEC 12장, REQ-NOTI-001~012).
 * 사용자 화면(Q&A·자유게시판·회원) 모두 같은 헤더를 써서 shared 에 둔다.
 */

/** 알림 종류 (API_SPEC 12.1) */
export type NotificationType =
  | 'answer_created'
  | 'answer_accepted'
  | 'comment_created'
  | 'notice_created'
  | 'question_edited'
  | 'answer_edited'
  | 'report_processed'
  | 'rank_achieved'
  | 'report_action';

export interface NotificationActor {
  readonly id: number | null;
  readonly nickname: string;
  readonly profileImageUrl: string | null;
}

/** Notification 객체 (API_SPEC 12장) */
export interface Notification {
  readonly id: number;
  readonly type: NotificationType;
  /** 알림을 만든 시점의 글 제목. 순위 달성은 등급 이름(Challenger 등) */
  readonly title: string;
  /** 신고 조치 내용, 신고 결과(처리 완료/반려), 순위(순위 3위) */
  readonly detail: string | null;
  /** 답변·댓글 작성자, 채택·수정한 회원. 공지·신고·순위 알림은 null */
  readonly actor: NotificationActor | null;
  readonly targetType: 'question' | 'answer' | 'post' | 'comment' | 'notice' | 'report' | 'user';
  readonly targetId: number;
  /** 답변·댓글 id */
  readonly subTargetId: number | null;
  readonly isRead: boolean;
  readonly createdAt: string;
}

export interface NotificationPageMeta extends PageMeta {
  readonly unreadCount: number;
}

/** GET /api/notifications. 최신순, meta 에 읽지 않은 수 */
export function getNotifications(
  page: number,
  size: number,
): Promise<PageResult<Notification, NotificationPageMeta>> {
  return apiPageRequest<Notification, NotificationPageMeta>(
    `/notifications${toQueryString({ page, size })}`,
  );
}

/** GET /api/notifications/unread-count. 화면을 옮길 때와 60초마다 부른다 */
export async function getUnreadNotificationCount(): Promise<number> {
  const result = await apiRequest<{ readonly unreadCount: number }>('/notifications/unread-count');
  return result.unreadCount;
}

/** PATCH /api/notifications/:id/read. 이미 읽었어도 성공 */
export function readNotification(id: number): Promise<void> {
  return apiRequest<void>(`/notifications/${id}/read`, { method: 'PATCH' });
}

/** PATCH /api/notifications/read-all */
export function readAllNotifications(): Promise<void> {
  return apiRequest<void>('/notifications/read-all', { method: 'PATCH' });
}

export const notificationLabels = {
  button: '알림',
  title: '알림',
  readAll: '모두 읽음',
  empty: '새 알림이 없습니다.',
  loadError: '알림을 불러오지 못했습니다.',
  loading: '불러오는 중...',
  more: '더 보기',
  unread: (count: number) => `읽지 않은 알림 ${count}개`,
} as const;

const actorName = (n: Notification) => n.actor?.nickname ?? '알 수 없는 회원';

/** 알림 한 줄 문구와 아이콘 (API_SPEC 12.1) */
export const NOTIFICATION_MESSAGES: Readonly<
  Record<NotificationType, { readonly icon: string; readonly text: (n: Notification) => string }>
> = {
  answer_created: { icon: 'forum', text: (n) => `${actorName(n)}님이 내 질문에 답변했습니다` },
  answer_accepted: { icon: 'verified', text: (n) => `${actorName(n)}님이 내 답변을 채택했습니다` },
  comment_created: {
    icon: 'chat',
    text: (n) => `${actorName(n)}님이 내 게시글에 댓글을 남겼습니다`,
  },
  notice_created: { icon: 'campaign', text: () => '새 공지가 등록되었습니다' },
  question_edited: {
    icon: 'edit_note',
    text: (n) => `${actorName(n)}님이 내가 답변한 질문을 수정했습니다`,
  },
  answer_edited: { icon: 'edit_note', text: (n) => `${actorName(n)}님이 답변을 수정했습니다` },
  report_processed: {
    icon: 'flag',
    text: (n) => `내가 신고한 글이 ${n.detail ?? '처리'}되었습니다`,
  },
  rank_achieved: { icon: 'trophy', text: (n) => `${n.title} 등급을 달성했습니다` },
  report_action: { icon: 'gavel', text: () => '내 글이 신고 처리로 조치되었습니다' },
};

/**
 * 알림을 눌렀을 때 이동할 경로 (API_SPEC 12.1). 신고 조치는 숨김 처리된 글이라 이동하지 않는다(null).
 * 답변은 질문 상세에서 그 답변 위치로 간다.
 */
export function notificationHref(n: Notification): string | null {
  switch (n.type) {
    case 'answer_created':
    case 'answer_accepted':
    case 'answer_edited':
      return `${site.questionPath(n.targetId)}${n.subTargetId ? `#answer-${n.subTargetId}` : ''}`;
    case 'question_edited':
      return site.questionPath(n.targetId);
    case 'comment_created':
      return site.postPath(n.targetId);
    case 'notice_created':
      return noticePaths.detail(n.targetId);
    case 'report_processed':
      return site.myReportsPath;
    case 'rank_achieved':
      return site.myPagePath;
    case 'report_action':
      return null;
  }
}

const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/** 알림 시각. 방금 전 / 5분 전 / 3시간 전 / 2일 전 / 2026.11.16 */
export function formatNotificationTime(iso: string, now = Date.now()): string {
  const diff = now - new Date(iso).getTime();
  if (diff < MINUTE) return '방금 전';
  if (diff < HOUR) return `${Math.floor(diff / MINUTE)}분 전`;
  if (diff < DAY) return `${Math.floor(diff / HOUR)}시간 전`;
  if (diff < 7 * DAY) return `${Math.floor(diff / DAY)}일 전`;
  const d = new Date(iso);
  const pad = (v: number) => String(v).padStart(2, '0');
  return `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())}`;
}
