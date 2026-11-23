import { BadRequestError, ConflictError, NotFoundError } from '../../common/error/http-errors.js';
import { withTransaction } from '../../config/database.js';
import * as notificationService from '../notifications/notification.service.js';

import * as activityLogService from './activity-log.service.js';
import * as adminTagRepository from './admin-tag.repository.js';

const { CREATE_TAG, UPDATE_TAG, DELETE_TAG, RESTORE_TAG, MERGE_TAG, UNMERGE_TAG } =
  activityLogService.ACTIVITY_LOG_ACTIONS;

// MySQL 고유 키 중복 (같은 이름을 동시에 만든 경우)
const DUPLICATE_ENTRY = 'ER_DUP_ENTRY';

const toAdminTag = (row) => ({
  id: row.id,
  name: row.name,
  description: row.description,
  questionCount: row.question_count,
  status: row.status,
  blockedAt: row.blocked_at,
  // 병합된 태그면 병합 대상 (API 명세 10.5)
  mergedInto:
    row.merged_into_id === null ? null : { id: row.merged_into_id, name: row.merged_into_name },
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

const throwUnmergeUnavailable = (message) => {
  throw new BadRequestError('VALIDATION_ERROR', message);
};

/**
 * 병합 취소 (API 명세 10.5 PATCH, DB 설계서 4.22·4.23). 원본을 사용 중으로 되돌리고, 병합 때 옮긴 질문 중
 * 대상 태그 연결이 남아 있는 질문에 원본 태그를 다시 붙인다. 병합 때 새로 붙인 대상 태그는 뗀다.
 * 병합과 같은 순서(id 순)로 두 태그를 잠가 교착을 피한다.
 */
const unmerge = async (adminId, sourceTagId, targetTagId) => {
  const tags = await adminTagRepository.findTagsByIdsForUpdate([sourceTagId, targetTagId]);
  const source = tags.find((tag) => tag.id === sourceTagId);
  const target = tags.find((tag) => tag.id === targetTagId);

  // 미리 본 뒤 잠그기 전에 다른 관리자가 먼저 바꾼 경우
  if (source?.status !== 'merged' || source.merged_into_id !== targetTagId) {
    throwUnmergeUnavailable(
      '다른 관리자가 먼저 태그를 바꿨습니다. 목록을 새로 고친 뒤 다시 시도하세요.',
    );
  }

  const merge = await adminTagRepository.findActiveTagMerge(sourceTagId);

  if (merge === null) {
    throwUnmergeUnavailable(
      '병합 기록이 없어 되돌릴 수 없습니다. (병합 취소 기능을 넣기 전에 한 병합)',
    );
  }

  // 원본이 병합한 대상이 그 뒤 다른 태그로 병합돼, 원본이 새 대상을 가리키게 바뀐 경우
  if (merge.target_tag_id !== targetTagId) {
    throwUnmergeUnavailable(
      '병합한 뒤 대상 태그가 다시 병합됐습니다. 나중에 한 병합부터 취소하세요.',
    );
  }

  if (target.status !== 'active') {
    throwUnmergeUnavailable(
      `병합 대상 태그(${target.name})가 차단돼 있어 되돌릴 수 없습니다. 차단을 먼저 해제하세요.`,
    );
  }

  const questions = await adminTagRepository.findRestorableMergeQuestions(merge.id, targetTagId);
  const addedQuestionIds = questions
    .filter((question) => question.is_target_added === 1)
    .map((question) => question.question_id);

  if (questions.length > 0) {
    await adminTagRepository.linkTagToQuestions(
      sourceTagId,
      questions.map((question) => question.question_id),
    );
  }

  if (addedQuestionIds.length > 0) {
    await adminTagRepository.unlinkTagFromQuestions(targetTagId, addedQuestionIds);
  }

  await adminTagRepository.unmergeTag(sourceTagId);
  await adminTagRepository.restoreRedirectedTags(sourceTagId, targetTagId);
  await adminTagRepository.markTagMergeUndone(merge.id, adminId);

  await activityLogService.createActivityLog({
    adminId,
    action: UNMERGE_TAG,
    targetType: 'tag',
    targetId: sourceTagId,
    detail: `${source.name} → ${target.name} 병합 취소${questions.length > 0 ? ` · 질문 연결 ${questions.length}건 복원` : ''}`,
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
 * 태그 수정 / 차단 해제 / 병합 취소 (API 명세 10.5 PATCH). 보낸 필드만 바꾸고, 바뀐 것이 없으면 로그도 남기지 않는다.
 * 차단된 태그와 병합된 태그는 status: "active"(차단 해제·병합 취소)만 받는다.
 */
export const updateTag = async (adminId, tagId, changes) =>
  withTransaction(async () => {
    const hasContentChange = changes.name !== undefined || changes.description !== undefined;

    if (!hasContentChange) {
      const state = await adminTagRepository.findTagMergeState(tagId);

      if (state?.status === 'merged') {
        await unmerge(adminId, tagId, state.merged_into_id);

        return getTagById(tagId);
      }
    }

    const tag = await lockTag(tagId);

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
 * 차단 영향 미리보기 (API 명세 10.5 GET block-impact). 삭제 확인 창이 대체 태그가 필요한지 판단한다.
 * 이미 차단·병합된 태그는 차단할 것이 없으므로 400
 */
export const getTagBlockImpact = async (tagId) => {
  const tag = await getTagById(tagId);

  if (tag.status !== 'active') {
    throw new BadRequestError('VALIDATION_ERROR', '사용 중인 태그만 차단할 수 있습니다.');
  }

  const impact = await adminTagRepository.countBlockImpactByTagId(tagId);

  // SUM은 DECIMAL이라 mysql2가 문자열로 돌려준다
  return {
    questionCount: Number(impact.question_count),
    untaggedQuestionCount: Number(impact.untagged_question_count),
  };
};

// 대체 태그는 사용 중(active)이어야 한다. 없으면 404, 차단은 TAG_BLOCKED, 병합·자기 자신은 400 (API 명세 10.5)
const ensureReplaceable = (tag, replacement) => {
  if (replacement === undefined) {
    throwTagNotFound();
  }

  if (replacement.id === tag.id) {
    throw new BadRequestError(
      'VALIDATION_ERROR',
      '삭제하려는 태그는 대체 태그로 고를 수 없습니다.',
    );
  }

  if (replacement.status === 'blocked') {
    throw new BadRequestError(
      'TAG_BLOCKED',
      `차단된 태그(${replacement.name})는 대체 태그로 고를 수 없습니다.`,
    );
  }

  if (replacement.status === 'merged') {
    throw new BadRequestError(
      'VALIDATION_ERROR',
      '병합된 태그는 대체 태그로 고를 수 없습니다. 사용 중인 태그를 고르세요.',
    );
  }
};

// 대체 태그도 함께 잠근다. 병합과 같이 id 순서로 잠가 교착을 피한다
const lockTagsForBlock = async (tagId, replaceWith) => {
  if (replaceWith === undefined || replaceWith === tagId) {
    return { tag: await lockTag(tagId), replacement: undefined };
  }

  const tags = await adminTagRepository.findTagsByIdsForUpdate([tagId, replaceWith]);
  const tag = tags.find((row) => row.id === tagId);

  if (tag === undefined) {
    throwTagNotFound();
  }

  if (tag.status === 'merged') {
    throw new BadRequestError('VALIDATION_ERROR', '병합된 태그는 수정하거나 삭제할 수 없습니다.');
  }

  return { tag, replacement: tags.find((row) => row.id === replaceWith) };
};

const toDeleteLogDetail = (tag, unlinkedCount, replacement, replacedCount) =>
  [
    tag.name,
    unlinkedCount > 0 ? `질문 연결 ${unlinkedCount}건 해제` : null,
    replacedCount > 0 ? `${replacedCount}건에 ${replacement.name} 대체` : null,
  ]
    .filter((part) => part !== null)
    .join(' · ');

/**
 * 태그 삭제 = 차단 (API 명세 10.5 DELETE, REQ-ADMIN-010). 사용 중이어도 지우고 질문 연결을 끊는다.
 * 이 태그를 빼면 태그가 0개가 되는 질문(사용 중·숨김)에는 대체 태그를 붙이고 작성자에게 알린다.
 * 그런 질문이 없으면 replaceWith는 쓰지 않는다. 이미 차단된 태그는 바꾸지 않는다.
 */
export const deleteTag = async (adminId, tagId, replaceWith) =>
  withTransaction(async () => {
    const { tag, replacement } = await lockTagsForBlock(tagId, replaceWith);

    if (tag.status === 'blocked') {
      return;
    }

    const untaggedQuestionIds = await adminTagRepository.findUntaggedQuestionIdsByTagId(tagId);

    if (untaggedQuestionIds.length > 0) {
      if (replaceWith === undefined) {
        throw new BadRequestError(
          'TAG_REPLACEMENT_REQUIRED',
          `이 태그를 빼면 태그가 없어지는 질문이 ${untaggedQuestionIds.length}건 있습니다. 대체 태그를 고르세요.`,
        );
      }

      ensureReplaceable(tag, replaceWith === tagId ? tag : replacement);
    }

    await adminTagRepository.blockTag(tagId);

    // 질문에 태그가 1개 이상 남도록 연결을 끊기 전에 대체 태그를 붙인다 (API 명세 3장 tags 필수)
    if (untaggedQuestionIds.length > 0) {
      await adminTagRepository.linkTagToQuestions(replacement.id, untaggedQuestionIds);
      await notificationService.notifyTagReplaced({
        questionIds: untaggedQuestionIds,
        blockedTagName: tag.name,
        replacementTagName: replacement.name,
      });
    }

    const unlinkedCount = await adminTagRepository.deleteQuestionTagsByTagId(tagId);

    await activityLogService.createActivityLog({
      adminId,
      action: DELETE_TAG,
      targetType: 'tag',
      targetId: tagId,
      // 숨김·삭제된 질문과의 연결도 함께 끊으므로 목록의 questionCount보다 클 수 있다
      detail: toDeleteLogDetail(tag, unlinkedCount, replacement, untaggedQuestionIds.length),
    });
  });

// 원본·대상 모두 사용 중(active)이어야 한다. 차단은 400 TAG_BLOCKED, 병합된 태그는 400 (API 명세 10.5)
const ensureMergeable = (tag, role) => {
  if (tag.status === 'blocked') {
    throw new BadRequestError('TAG_BLOCKED', `차단된 태그(${tag.name})는 병합할 수 없습니다.`);
  }

  if (tag.status === 'merged') {
    throw new BadRequestError(
      'VALIDATION_ERROR',
      role === 'source'
        ? '이미 병합된 태그입니다.'
        : '병합된 태그로는 합칠 수 없습니다. 사용 중인 태그를 고르세요.',
    );
  }
};

/**
 * 태그 병합 (API 명세 10.5 DELETE ?mergeInto=, REQ-ADMIN-011). 원본을 쓰던 질문을 대상 태그로 옮기고
 * (이미 대상이 붙어 있으면 중복 제거), 원본은 merged로 남겨 이후 그 이름을 대상 태그로 바꿔 저장한다.
 * 병합 후 대상 태그를 돌려준다.
 */
export const mergeTag = async (adminId, sourceTagId, targetTagId) => {
  if (sourceTagId === targetTagId) {
    throw new BadRequestError('TAG_MERGE_SAME', '같은 태그로는 병합할 수 없습니다.');
  }

  return withTransaction(async () => {
    const tags = await adminTagRepository.findTagsByIdsForUpdate([sourceTagId, targetTagId]);
    const source = tags.find((tag) => tag.id === sourceTagId);
    const target = tags.find((tag) => tag.id === targetTagId);

    if (source === undefined || target === undefined) {
      throwTagNotFound();
    }

    ensureMergeable(source, 'source');
    ensureMergeable(target, 'target');

    // 병합 취소할 수 있도록 원본 연결을 끊기 전에 옮길 질문을 남긴다 (DB 설계서 4.22·4.23)
    const mergeId = await adminTagRepository.createTagMerge({
      sourceTagId,
      targetTagId,
      mergedBy: adminId,
    });
    await adminTagRepository.createTagMergeQuestions(mergeId, sourceTagId, targetTagId);

    await adminTagRepository.linkQuestionsOfTagToTag(sourceTagId, targetTagId);
    const movedCount = await adminTagRepository.deleteQuestionTagsByTagId(sourceTagId);
    await adminTagRepository.mergeTagInto(sourceTagId, targetTagId);
    await adminTagRepository.updateMergedIntoId(sourceTagId, targetTagId);

    await activityLogService.createActivityLog({
      adminId,
      action: MERGE_TAG,
      targetType: 'tag',
      targetId: sourceTagId,
      detail: `${source.name} → ${target.name}${movedCount > 0 ? ` · 질문 연결 ${movedCount}건 이동` : ''}`,
    });

    return getTagById(targetTagId);
  });
};
