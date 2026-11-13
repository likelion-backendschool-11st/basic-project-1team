import { ConflictError, ForbiddenError, NotFoundError } from '../../common/error/http-errors.js';
import { toUserSummary } from '../../common/utils/user-summary.js';
import { withTransaction } from '../../config/database.js';

import * as activityLogService from './activity-log.service.js';
import * as adminUserRepository from './admin-user.repository.js';

const SANCTION_LABELS = {
  suspend: '이용 정지',
  write_ban: '글쓰기 제한',
  comment_ban: '댓글 제한',
};

const groupByUserId = (rows, toValue) => {
  const valuesByUserId = new Map();

  for (const row of rows) {
    const values = valuesByUserId.get(row.user_id) ?? [];
    values.push(toValue(row));
    valuesByUserId.set(row.user_id, values);
  }

  return valuesByUserId;
};

const toSanction = (row) => ({ type: row.type, until: row.ends_at });

// 탈퇴했으면 withdrawn, 아니면 걸려 있는 제재로 계산한다 (API 명세 10.2)
const toUserStatus = (row, sanctions) => {
  if (row.status === 'withdrawn') {
    return 'withdrawn';
  }

  if (sanctions.some((sanction) => sanction.type === 'suspend')) {
    return 'suspended';
  }

  return sanctions.length > 0 ? 'restricted' : 'active';
};

// 목록·상세에 공통으로 들어가는 항목
const toUserSummaryForAdmin = (row, sanctions, permissions) => ({
  id: row.id,
  username: row.username,
  nickname: row.nickname,
  role: row.role,
  permissions,
  status: toUserStatus(row, sanctions),
  sanctions,
  withdrawnAt: row.withdrawn_at,
  createdAt: row.created_at,
});

const findSanctionsAndPermissions = async (userIds) => {
  const [sanctionRows, permissionRows] = await Promise.all([
    adminUserRepository.findActiveSanctionsByUserIds(userIds),
    adminUserRepository.findActivePermissionsByUserIds(userIds),
  ]);

  return {
    sanctionsByUserId: groupByUserId(sanctionRows, toSanction),
    permissionsByUserId: groupByUserId(permissionRows, (row) => row.permission),
  };
};

export const getUsers = async ({ page, size, keyword, status, role, sort }) => {
  const filter = { keyword, status, role };

  const [rows, totalCount] = await Promise.all([
    adminUserRepository.findUsers({ filter, sort, limit: size, offset: (page - 1) * size }),
    adminUserRepository.countUsers(filter),
  ]);

  const { sanctionsByUserId, permissionsByUserId } = await findSanctionsAndPermissions(
    rows.map((row) => row.id),
  );

  const users = rows.map((row) =>
    toUserSummaryForAdmin(
      row,
      sanctionsByUserId.get(row.id) ?? [],
      permissionsByUserId.get(row.id) ?? [],
    ),
  );

  return { users, meta: { page, size, totalCount } };
};

// 제재 1건을 제재(apply)와 해제(release) 이력으로 나눠 최신순으로 합친다 (DB 설계서 4.3)
const toSanctionHistory = (rows) =>
  rows
    .flatMap((row) => {
      const applied = {
        action: 'apply',
        type: row.type,
        days: row.days,
        reason: row.reason,
        admin: toUserSummary(row, 'applied_by'),
        createdAt: row.starts_at,
      };

      if (row.released_at === null) {
        return [applied];
      }

      const released = {
        action: 'release',
        type: row.type,
        days: null,
        reason: row.release_reason,
        admin: toUserSummary(row, 'released_by'),
        createdAt: row.released_at,
      };

      return [applied, released];
    })
    .sort((a, b) => b.createdAt - a.createdAt);

export const getUserById = async (userId) => {
  const user = await adminUserRepository.findUserById(userId);

  if (user === null) {
    throw new NotFoundError('USER_NOT_FOUND', '회원을 찾을 수 없습니다.');
  }

  const [{ sanctionsByUserId, permissionsByUserId }, activity, sanctionRows] = await Promise.all([
    findSanctionsAndPermissions([userId]),
    adminUserRepository.countUserActivity(userId),
    adminUserRepository.findSanctionsByUserId(userId),
  ]);

  return {
    ...toUserSummaryForAdmin(
      user,
      sanctionsByUserId.get(userId) ?? [],
      permissionsByUserId.get(userId) ?? [],
    ),
    name: user.name,
    email: user.email,
    activity: {
      questionCount: activity.question_count,
      answerCount: activity.answer_count,
      reportsReceivedCount: activity.reports_received_count,
    },
    sanctionHistory: toSanctionHistory(sanctionRows),
  };
};

// 활동 로그 detail 예: "이용 정지 7일 · 욕설·비하", "글쓰기 제한 해제 · 오처리 정정" (API 명세 10.8)
const toSanctionLogDetail = ({ type, action, days, reason }) => {
  const label = SANCTION_LABELS[type];

  if (action === 'release') {
    return `${label} 해제 · ${reason}`;
  }

  return `${label} ${days === null ? '영구' : `${days}일`} · ${reason}`;
};

// 탈퇴한 회원은 제재 대상이 아니므로 없는 회원으로 본다
const lockSanctionTarget = async (userId) => {
  const user = await adminUserRepository.findUserByIdForUpdate(userId);

  if (user === null || user.status === 'withdrawn') {
    throw new NotFoundError('USER_NOT_FOUND', '회원을 찾을 수 없습니다.');
  }

  if (user.role === 'ADMIN') {
    throw new ForbiddenError('CANNOT_SANCTION_ADMIN', '관리자 계정은 제재할 수 없습니다.');
  }
};

const applySanction = async (adminId, userId, { type, days, reason, reportId }) => {
  const isAlreadyActive = await adminUserRepository.hasActiveSanctionByUserIdAndType(userId, type);

  if (isAlreadyActive) {
    throw new ConflictError(
      'SANCTION_ALREADY_ACTIVE',
      '이미 같은 종류의 제재가 걸려 있습니다. 기간을 바꾸려면 해제한 뒤 다시 걸어주세요.',
    );
  }

  await adminUserRepository.createSanction({
    userId,
    type,
    days,
    reason,
    appliedBy: adminId,
    reportId,
  });
};

/**
 * 신고 처리에서 작성자를 제재한다 (API 명세 10.6). 회원 제재와 같은 규칙(탈퇴 404, 관리자 403,
 * 같은 종류 중복 409)을 따르고, 활동 로그는 신고 처리(RESOLVE_REPORT) 하나로 남기므로 여기서 남기지 않는다.
 * 신고 처리 트랜잭션 안에서 부른다.
 */
export const applySanctionForReport = async (adminId, userId, { type, days, reason, reportId }) => {
  await lockSanctionTarget(userId);
  await applySanction(adminId, userId, { type, days, reason, reportId });
};

const releaseSanction = async (adminId, userId, { type, reason }) => {
  const releasedCount = await adminUserRepository.releaseActiveSanctions({
    userId,
    type,
    reason,
    releasedBy: adminId,
  });

  if (releasedCount === 0) {
    throw new ConflictError('SANCTION_NOT_ACTIVE', '걸려 있지 않은 제재입니다.');
  }
};

/**
 * 회원 제재 / 제재 해제 (API 명세 10.2 PATCH). 제재 이력과 활동 로그를 한 트랜잭션에서 남긴다.
 * @param {{ action: 'apply' | 'release', type: string, days?: number | null, reason: string }} sanction
 */
export const updateUserSanction = async (adminId, userId, sanction) =>
  withTransaction(async () => {
    await lockSanctionTarget(userId);

    if (sanction.action === 'apply') {
      await applySanction(adminId, userId, sanction);
    } else {
      await releaseSanction(adminId, userId, sanction);
    }

    await activityLogService.createActivityLog({
      adminId,
      action:
        sanction.action === 'apply'
          ? activityLogService.ACTIVITY_LOG_ACTIONS.SANCTION_USER
          : activityLogService.ACTIVITY_LOG_ACTIONS.RELEASE_SANCTION,
      targetType: 'user',
      targetId: userId,
      detail: toSanctionLogDetail(sanction),
    });

    return getUserById(userId);
  });
