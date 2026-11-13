import { withTransaction } from '../../config/database.js';
import * as noticeService from '../notices/notice.service.js';

import * as activityLogService from './activity-log.service.js';

const { CREATE_NOTICE, UPDATE_NOTICE, DELETE_NOTICE } = activityLogService.ACTIVITY_LOG_ACTIONS;

// 관리자 목록은 수정 화면에서 바로 쓰도록 본문까지 준다 (API 명세 10.7, 9장 Notice)
export const getNotices = async ({ page, size }) =>
  noticeService.getNotices({ page, size, withBody: true });

const writeLog = (adminId, action, noticeId, detail) =>
  activityLogService.createActivityLog({
    adminId,
    action,
    targetType: 'notice',
    targetId: noticeId,
    detail,
  });

/** 공지 작성 (API 명세 10.7 POST). 본문 정리는 트랜잭션 밖에서 먼저 한다 */
export const createNotice = async (adminId, { title, body, isPinned }) => {
  const prepared = await noticeService.prepareNoticeBody(body);

  const noticeId = await withTransaction(async () => {
    const createdId = await noticeService.createNotice(adminId, {
      title,
      body: prepared.body,
      imageIds: prepared.imageIds,
      isPinned,
    });

    await writeLog(adminId, CREATE_NOTICE, createdId, `${isPinned ? '[고정] ' : ''}${title}`);

    return createdId;
  });

  return noticeService.getNoticeById(noticeId);
};

const toUpdateLogDetail = (current, next) =>
  [
    next.title === current.title ? null : `제목: ${current.title} → ${next.title}`,
    next.body === current.body ? null : '본문 수정',
    next.isPinned === current.isPinned ? null : next.isPinned ? '고정' : '고정 해제',
  ]
    .filter((part) => part !== null)
    .join(' · ');

/** 공지 수정 (API 명세 10.7 PATCH). 보낸 필드만 바꾸고, 바뀐 것이 없으면 로그도 남기지 않는다 */
export const updateNotice = async (adminId, noticeId, changes) => {
  const prepared =
    changes.body === undefined ? undefined : await noticeService.prepareNoticeBody(changes.body);

  await withTransaction(async () => {
    const current = await noticeService.findNoticeForUpdate(noticeId);
    const next = {
      title: changes.title ?? current.title,
      body: prepared?.body ?? current.body,
      isPinned: changes.isPinned ?? current.isPinned,
    };
    const detail = toUpdateLogDetail(current, next);

    if (detail === '') {
      return;
    }

    await noticeService.updateNotice(noticeId, next, prepared?.imageIds);
    await writeLog(adminId, UPDATE_NOTICE, noticeId, detail);
  });

  return noticeService.getNoticeById(noticeId);
};

/** 공지 삭제 (API 명세 10.7 DELETE). 삭제 상태로 바꿔 사용자 화면과 관리자 목록에서 뺀다 */
export const deleteNotice = async (adminId, noticeId) =>
  withTransaction(async () => {
    const current = await noticeService.findNoticeForUpdate(noticeId);

    await noticeService.deleteNotice(noticeId);
    await writeLog(adminId, DELETE_NOTICE, noticeId, current.title);
  });
