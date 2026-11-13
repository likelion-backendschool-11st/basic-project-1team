import { toUserSummary } from '../../common/utils/user-summary.js';

import * as activityLogRepository from './activity-log.repository.js';

// 활동 로그 action 목록 (API 명세 10.8, db/schema.sql chk_activity_logs_action)
export const ACTIVITY_LOG_ACTIONS = Object.freeze({
  SANCTION_USER: 'SANCTION_USER',
  RELEASE_SANCTION: 'RELEASE_SANCTION',
  GRANT_PERMISSION: 'GRANT_PERMISSION',
  REVOKE_PERMISSION: 'REVOKE_PERMISSION',
  MODERATE_EDIT: 'MODERATE_EDIT',
  MODERATE_DELETE: 'MODERATE_DELETE',
  HIDE_QUESTION: 'HIDE_QUESTION',
  HIDE_ANSWER: 'HIDE_ANSWER',
  HIDE_POST: 'HIDE_POST',
  HIDE_COMMENT: 'HIDE_COMMENT',
  RESTORE_QUESTION: 'RESTORE_QUESTION',
  RESTORE_ANSWER: 'RESTORE_ANSWER',
  RESTORE_POST: 'RESTORE_POST',
  RESTORE_COMMENT: 'RESTORE_COMMENT',
  DELETE_QUESTION: 'DELETE_QUESTION',
  DELETE_ANSWER: 'DELETE_ANSWER',
  DELETE_POST: 'DELETE_POST',
  DELETE_COMMENT: 'DELETE_COMMENT',
  CREATE_TAG: 'CREATE_TAG',
  UPDATE_TAG: 'UPDATE_TAG',
  DELETE_TAG: 'DELETE_TAG',
  RESTORE_TAG: 'RESTORE_TAG',
  MERGE_TAG: 'MERGE_TAG',
  RESOLVE_REPORT: 'RESOLVE_REPORT',
  REJECT_REPORT: 'REJECT_REPORT',
  CREATE_NOTICE: 'CREATE_NOTICE',
  UPDATE_NOTICE: 'UPDATE_NOTICE',
  DELETE_NOTICE: 'DELETE_NOTICE',
});

// 목록 필터에서 action 대신 보낼 수 있는 그룹 (API 명세 10.8)
export const ACTIVITY_LOG_ACTION_GROUPS = Object.freeze({
  HIDE: ['HIDE_QUESTION', 'HIDE_ANSWER', 'HIDE_POST', 'HIDE_COMMENT'],
  RESTORE: ['RESTORE_QUESTION', 'RESTORE_ANSWER', 'RESTORE_POST', 'RESTORE_COMMENT'],
  DELETE: ['DELETE_QUESTION', 'DELETE_ANSWER', 'DELETE_POST', 'DELETE_COMMENT'],
});

// targetLabel은 '<대상 종류> #<id>'로 만든다 (API 명세 10.8)
export const ACTIVITY_LOG_TARGET_LABELS = Object.freeze({
  user: '회원',
  question: '질문',
  answer: '답변',
  post: '게시글',
  comment: '댓글',
  tag: '태그',
  report: '신고',
  notice: '공지',
});

const DETAIL_MAX_LENGTH = 256;

// 사유·처리 요약은 256자를 넘으면 잘라서 저장한다 (API 명세 10.8). 이모지가 반으로 잘리지 않도록 글자 단위로 자른다
const truncateDetail = (detail) => {
  if (detail === undefined || detail === null) {
    return null;
  }

  const characters = Array.from(detail.trim());

  if (characters.length === 0) {
    return null;
  }

  return characters.slice(0, DETAIL_MAX_LENGTH).join('');
};

/**
 * 상태를 바꾸는 관리자 API(와 관리 권한 회원의 수정·삭제)가 활동 로그를 남길 때 쓴다 (API 명세 10장, 10.8).
 * 처리와 로그가 함께 성공·실패하도록 호출하는 Service의 withTransaction 안에서 부른다.
 *
 * @param {{ adminId: number, action: string, targetType: string, targetId: number, detail?: string | null }} log
 */
export const createActivityLog = async ({ adminId, action, targetType, targetId, detail }) => {
  const targetName = ACTIVITY_LOG_TARGET_LABELS[targetType];

  // 호출하는 코드의 오타는 요청 값이 아니라 개발 실수이므로 500으로 드러낸다
  if (ACTIVITY_LOG_ACTIONS[action] === undefined) {
    throw new Error(`알 수 없는 활동 로그 action입니다: ${action}`);
  }

  if (targetName === undefined) {
    throw new Error(`알 수 없는 활동 로그 targetType입니다: ${targetType}`);
  }

  return activityLogRepository.createActivityLog({
    adminId,
    action,
    targetType,
    targetId,
    targetLabel: `${targetName} #${targetId}`,
    detail: truncateDetail(detail),
  });
};

const toActions = (action) => {
  if (action === undefined) {
    return undefined;
  }

  return ACTIVITY_LOG_ACTION_GROUPS[action] ?? [action];
};

export const getActivityLogs = async ({ page, size, adminId, action, startAt, endAt }) => {
  const filter = { adminId, actions: toActions(action), startAt, endAt };

  const [rows, totalCount] = await Promise.all([
    activityLogRepository.findActivityLogs({ filter, limit: size, offset: (page - 1) * size }),
    activityLogRepository.countActivityLogs(filter),
  ]);

  const activityLogs = rows.map((row) => ({
    id: row.id,
    action: row.action,
    admin: toUserSummary(row, 'admin'),
    targetType: row.target_type,
    targetId: row.target_id,
    targetLabel: row.target_label,
    detail: row.detail,
    createdAt: row.created_at,
  }));

  return { activityLogs, meta: { page, size, totalCount } };
};
