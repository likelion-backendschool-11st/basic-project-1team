import { BadRequestError, ConflictError, NotFoundError } from '../../common/error/http-errors.js';
import { withTransaction } from '../../config/database.js';

import * as activityLogService from './activity-log.service.js';
import * as adminTagRepository from './admin-tag.repository.js';

const { CREATE_TAG, UPDATE_TAG, DELETE_TAG, RESTORE_TAG } = activityLogService.ACTIVITY_LOG_ACTIONS;

// MySQL 고유 키 중복 (같은 이름을 동시에 만든 경우)
const DUPLICATE_ENTRY = 'ER_DUP_ENTRY';

const toAdminTag = (row) => ({
  id: row.id,
  name: row.name,
  description: row.description,
  questionCount: row.question_count,
  status: row.status,
  blockedAt: row.blocked_at,
  createdAt: row.created_at,
});

const throwTagNotFound = () => {
  throw new NotFoundError('TAG_NOT_FOUND', '태그를 찾을 수 없습니다.');
};

const throwTagDuplicated = () => {
  throw new ConflictError('TAG_DUPLICATED', '이미 있는 태그 이름입니다.');
};

export const getTags = async ({ page, size, sort, ...filter }) => {
  const [rows, totalCount] = await Promise.all([
    adminTagRepository.findTags({ filter, sort, limit: size, offset: (page - 1) * size }),
    adminTagRepository.countTags(filter),
  ]);

  return { tags: rows.map(toAdminTag), meta: { page, size, totalCount } };
};

const getTagById = async (tagId) => {
  const [row] = await adminTagRepository.findTags({ filter: { id: tagId }, limit: 1, offset: 0 });

  if (row === undefined) {
    throwTagNotFound();
  }

  return toAdminTag(row);
};

// 차단된 이름은 다시 쓸 수 없고(400 TAG_BLOCKED), 사용 중·병합된 이름은 중복이다(409) (API 명세 10.5)
const ensureNameAvailable = async (name) => {
  const existing = await adminTagRepository.findTagByName(name);

  if (existing === null) {
    return;
  }

  if (existing.status === 'blocked') {
    throw new BadRequestError(
      'TAG_BLOCKED',
      `'${name}'은(는) 차단된 태그입니다. 다시 쓰려면 차단을 해제하세요.`,
    );
  }

  throwTagDuplicated();
};

const lockTag = async (tagId) => {
  const tag = await adminTagRepository.findTagByIdForUpdate(tagId);

  if (tag === null) {
    throwTagNotFound();
  }

  // 병합된 태그는 대상 태그의 다른 이름으로만 남으므로 고치거나 지우지 않는다 (API 명세 10.5)
  if (tag.status === 'merged') {
    throw new BadRequestError('VALIDATION_ERROR', '병합된 태그는 수정하거나 삭제할 수 없습니다.');
  }

  return tag;
};

export const createTag = async (adminId, { name, description }) =>
  withTransaction(async () => {
    await ensureNameAvailable(name);

    let tagId;

    try {
      tagId = await adminTagRepository.createTag({ name, description, createdBy: adminId });
    } catch (error) {
      if (error.code === DUPLICATE_ENTRY) {
        throwTagDuplicated();
      }

      throw error;
    }

    await activityLogService.createActivityLog({
      adminId,
      action: CREATE_TAG,
      targetType: 'tag',
      targetId: tagId,
      detail: name,
    });

    return getTagById(tagId);
  });

// 차단 해제: 상태만 바꾸고, 차단할 때 끊긴 질문 연결은 되돌리지 않는다 (API 명세 10.5)
const unblock = async (adminId, tag) => {
  await adminTagRepository.unblockTag(tag.id);
  await activityLogService.createActivityLog({
    adminId,
    action: RESTORE_TAG,
    targetType: 'tag',
    targetId: tag.id,
    detail: tag.name,
  });
};

const toUpdateLogDetail = (tag, next) =>
  [
    next.name === tag.name ? null : `이름: ${tag.name} → ${next.name}`,
    next.description === tag.description ? null : '설명 수정',
  ]
    .filter((part) => part !== null)
    .join(' · ');

/**
 * 태그 수정 / 차단 해제 (API 명세 10.5 PATCH). 보낸 필드만 바꾸고, 바뀐 것이 없으면 로그도 남기지 않는다.
 * 차단된 태그는 status: "active"(차단 해제)만 받는다.
 */
export const updateTag = async (adminId, tagId, changes) =>
  withTransaction(async () => {
    const tag = await lockTag(tagId);
    const hasContentChange = changes.name !== undefined || changes.description !== undefined;

    if (tag.status === 'blocked') {
      if (hasContentChange) {
        throw new BadRequestError(
          'VALIDATION_ERROR',
          '차단된 태그는 차단을 해제한 뒤 이름·설명을 수정할 수 있습니다.',
        );
      }

      await unblock(adminId, tag);

      return getTagById(tagId);
    }

    const next = {
      name: changes.name ?? tag.name,
      description: changes.description === undefined ? tag.description : changes.description,
    };

    if (next.name !== tag.name) {
      await ensureNameAvailable(next.name);
    }

    const detail = toUpdateLogDetail(tag, next);

    if (detail !== '') {
      try {
        await adminTagRepository.updateTag(tagId, next);
      } catch (error) {
        if (error.code === DUPLICATE_ENTRY) {
          throwTagDuplicated();
        }

        throw error;
      }

      await activityLogService.createActivityLog({
        adminId,
        action: UPDATE_TAG,
        targetType: 'tag',
        targetId: tagId,
        detail,
      });
    }

    return getTagById(tagId);
  });

/**
 * 태그 삭제 = 차단 (API 명세 10.5 DELETE, REQ-ADMIN-010). 사용 중이어도 지우고 질문 연결만 끊는다.
 * 이미 차단된 태그는 바꾸지 않는다.
 */
export const deleteTag = async (adminId, tagId) =>
  withTransaction(async () => {
    const tag = await lockTag(tagId);

    if (tag.status === 'blocked') {
      return;
    }

    await adminTagRepository.blockTag(tagId);
    const unlinkedCount = await adminTagRepository.deleteQuestionTagsByTagId(tagId);

    await activityLogService.createActivityLog({
      adminId,
      action: DELETE_TAG,
      targetType: 'tag',
      targetId: tagId,
      // 숨김·삭제된 질문과의 연결도 함께 끊으므로 목록의 questionCount보다 클 수 있다
      detail: unlinkedCount > 0 ? `${tag.name} · 질문 연결 ${unlinkedCount}건 해제` : tag.name,
    });
  });
