import { NotFoundError } from '../../common/error/http-errors.js';
import { toUserSummary } from '../../common/utils/user-summary.js';

import * as notificationRepository from './notification.repository.js';

const DETAIL_MAX_LENGTH = 200;

// ---------------------------------------------------------------------
// 알림 만들기 (API 명세 12.1). 모두 그 일이 일어난 요청의 트랜잭션 안에서 부른다
// ---------------------------------------------------------------------

/** 내 질문에 새 답변 */
export const notifyAnswerCreated = ({ questionId, answerId, actorId }) =>
  notificationRepository.createAnswerCreatedNotification({ questionId, answerId, actorId });

/** 내 답변이 채택됨 */
export const notifyAnswerAccepted = ({ answerId, actorId }) =>
  notificationRepository.createAnswerAcceptedNotification({ answerId, actorId });

/** 내 게시글에 새 댓글 */
export const notifyCommentCreated = ({ postId, commentId, actorId }) =>
  notificationRepository.createCommentCreatedNotification({ postId, commentId, actorId });

/** 공지 등록: 일반 회원 전체. 보낸 수를 돌려준다 */
export const notifyNoticeCreated = ({ noticeId, title }) =>
  notificationRepository.createNoticeCreatedNotifications({ noticeId, title });

/** 내가 답변한 질문이 수정됨 */
export const notifyQuestionEdited = ({ questionId, actorId }) =>
  notificationRepository.createQuestionEditedNotifications({ questionId, actorId });

/** 내가 추천한 답변, 내 질문에 달린 답변이 수정됨 */
export const notifyAnswerEdited = ({ answerId, actorId }) =>
  notificationRepository.createAnswerEditedNotifications({ answerId, actorId });

const REPORT_RESULT_LABELS = { resolved: '처리 완료', rejected: '반려' };

/** 내가 접수한 신고가 처리·반려됨. 신고 상태를 바꾸기 전에 부른다 */
export const notifyReportProcessed = ({ targetType, targetId, status }) =>
  notificationRepository.createReportProcessedNotifications({
    targetType,
    targetId,
    detail: REPORT_RESULT_LABELS[status],
  });

/** Grandmaster·Challenger 달성. tierLabel은 'Challenger' 같은 등급 이름 */
export const notifyRankAchieved = ({ userId, tierLabel, rank }) =>
  notificationRepository.createRankAchievedNotification({
    userId,
    title: tierLabel,
    detail: `순위 ${rank}위`,
  });

/** 내 글이 신고 처리로 숨김·제재됨. detail은 "<신고 사유> · <조치>" */
export const notifyReportAction = ({ userId, targetType, targetId, detail }) =>
  notificationRepository.createReportActionNotification({
    userId,
    targetType,
    targetId,
    detail: detail.slice(0, DETAIL_MAX_LENGTH),
  });

// ---------------------------------------------------------------------
// 내 알림 조회·읽음 처리
// ---------------------------------------------------------------------

const toNotification = (row) => ({
  id: row.id,
  type: row.type,
  title: row.title,
  detail: row.detail,
  actor: row.actor_id === null ? null : toUserSummary(row, 'actor'),
  targetType: row.target_type,
  targetId: row.target_id,
  subTargetId: row.sub_target_id,
  isRead: row.read_at !== null,
  createdAt: row.created_at,
});

/** 내 알림 목록 (API 명세 12장 GET /api/notifications). 최신순, meta에 읽지 않은 수 */
export const getMyNotifications = async (userId, { page, size }) => {
  const [rows, totalCount, unreadCount] = await Promise.all([
    notificationRepository.findNotificationsByUserId(userId, {
      limit: size,
      offset: (page - 1) * size,
    }),
    notificationRepository.countNotificationsByUserId(userId),
    notificationRepository.countUnreadNotificationsByUserId(userId),
  ]);

  return { notifications: rows.map(toNotification), meta: { page, size, totalCount, unreadCount } };
};

export const getUnreadCount = async (userId) => ({
  unreadCount: await notificationRepository.countUnreadNotificationsByUserId(userId),
});

/** 알림 하나 읽음 처리. 이미 읽었어도 그대로 성공, 내 알림이 아니면 404 */
export const readNotification = async (userId, notificationId) => {
  if (!(await notificationRepository.existsNotificationOfUser(userId, notificationId))) {
    throw new NotFoundError('NOTIFICATION_NOT_FOUND', '알림을 찾을 수 없습니다.');
  }

  await notificationRepository.updateNotificationRead(userId, notificationId);
};

export const readAllNotifications = (userId) =>
  notificationRepository.updateAllNotificationsRead(userId);
