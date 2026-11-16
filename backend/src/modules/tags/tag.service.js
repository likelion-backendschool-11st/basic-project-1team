import { BadRequestError, ForbiddenError, NotFoundError } from '../../common/error/http-errors.js';
import { normalizeTagName } from '../../common/utils/tag-name.js';
import { withTransaction } from '../../config/database.js';
import * as activityLogService from '../admin/activity-log.service.js';
import * as pointService from '../points/point.service.js';

import * as tagRepository from './tag.repository.js';

// 병합이 다시 병합된 경우를 따라가되, 잘못된 데이터로 끝없이 돌지 않도록 횟수를 제한한다
const MAX_MERGE_DEPTH = 10;

const throwTagBlocked = (name) => {
  throw new BadRequestError('TAG_BLOCKED', `'${name}' 태그는 사용할 수 없습니다.`);
};

const findMergeTargets = async (tags) => {
  const resolvedTags = new Map(tags.map((tag) => [tag.name, tag]));

  for (let depth = 0; depth < MAX_MERGE_DEPTH; depth += 1) {
    const mergedTags = [...resolvedTags.values()].filter((tag) => tag.status === 'merged');

    if (mergedTags.length === 0) {
      return resolvedTags;
    }

    const targets = await tagRepository.findTagsByIds(mergedTags.map((tag) => tag.merged_into_id));
    const targetsById = new Map(targets.map((target) => [target.id, target]));

    for (const [name, tag] of resolvedTags) {
      if (tag.status === 'merged') {
        resolvedTags.set(name, targetsById.get(tag.merged_into_id));
      }
    }
  }

  throw new Error('태그 병합 관계가 너무 깊거나 순환합니다.');
};

// 정규화한 태그 이름을 태그 id로 바꾼다. 없는 태그는 만들고, 병합된 이름은 병합 대상 태그로 바꾼다.
// 관리자가 차단한 태그는 쓸 수 없다 (API 명세 5.1, REQ-TAG-006)
export const resolveTagIdsByNames = async (names, userId) => {
  const existingTags = await tagRepository.findTagsByNames(names);
  const existingNames = new Set(existingTags.map((tag) => tag.name));
  const blockedTag = existingTags.find((tag) => tag.status === 'blocked');

  if (blockedTag !== undefined) {
    throwTagBlocked(blockedTag.name);
  }

  const missingNames = names.filter((name) => !existingNames.has(name));

  if (missingNames.length > 0) {
    await tagRepository.createTags(missingNames, userId);
  }

  const tags = missingNames.length > 0 ? await tagRepository.findTagsByNames(names) : existingTags;
  const resolvedTags = await findMergeTargets(tags);
  const tagIds = [];

  for (const name of names) {
    const tag = resolvedTags.get(name);

    if (tag.status === 'blocked') {
      throwTagBlocked(name);
    }

    tagIds.push(tag.id);
  }

  return [...new Set(tagIds)];
};

// 태그 이름은 정규화해서 저장하므로 검색어도 같은 규칙(# 제거, 영문 소문자)으로 바꿔 앞부분을 비교한다 (API 명세 1.10)
export const getTags = async ({ keyword, sort, size }) => {
  const namePrefix = keyword === undefined ? undefined : normalizeTagName(keyword);
  const rows = await tagRepository.findTags({
    namePrefix: namePrefix === '' ? undefined : namePrefix,
    sort,
    limit: size,
  });

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    description: row.description,
    questionCount: row.question_count,
  }));
};

const throwTagNotFound = () => {
  throw new NotFoundError('TAG_NOT_FOUND', '태그를 찾을 수 없습니다.');
};

// 이름은 정규화(# 제거, 영문 소문자)해서 찾는다. 병합된 이름이면 병합 대상 태그, 차단됐거나 없으면 404
const findActiveTargetByName = async (tagName) => {
  const name = normalizeTagName(tagName);
  const [tag] = await tagRepository.findTagsByNames([name]);

  if (tag === undefined) {
    throwTagNotFound();
  }

  const target = (await findMergeTargets([tag])).get(name);

  if (target === undefined || target.status !== 'active') {
    throwTagNotFound();
  }

  return target;
};

// 태그 설명은 ADMIN과 Diamond(Lv60) 이상 회원이 수정한다 (API 명세 5장, REQ-TAG-003)
const DESCRIPTION_EDIT_MIN_LEVEL = 60;

// 수정할 수 있으면 회원의 레벨(관리자는 null), 없으면 false
const findEditorLevel = async (user) => {
  if (user === null) {
    return false;
  }

  if (user.role === 'ADMIN') {
    return null;
  }

  const level = await pointService.findUserLevel(user.id);

  return level !== null && level >= DESCRIPTION_EDIT_MIN_LEVEL ? level : false;
};

/** 태그 상세 (API 명세 5장 GET /api/tags/:tagName). viewer는 로그인한 회원 또는 null */
export const getTagByName = async (tagName, viewer = null) => {
  const target = await findActiveTargetByName(tagName);
  const [detail, aliases, editorLevel] = await Promise.all([
    tagRepository.findTagDetailById(target.id),
    tagRepository.findMergedTagNamesByTargetId(target.id),
    findEditorLevel(viewer),
  ]);

  return {
    id: detail.id,
    name: detail.name,
    description: detail.description,
    questionCount: Number(detail.question_count),
    aliases,
    canEdit: editorLevel !== false,
    createdAt: detail.created_at,
  };
};

/**
 * 태그 설명 수정 (API 명세 5장 PATCH /api/tags/:tagName). 이름은 바꾸지 않는다.
 * 바뀌면 활동 로그 UPDATE_TAG를 수정한 회원 이름으로 남긴다. 같은 값이면 아무것도 하지 않는다
 */
export const updateTagDescription = async (user, tagName, description) => {
  const editorLevel = await findEditorLevel(user);

  if (editorLevel === false) {
    throw new ForbiddenError(
      'FORBIDDEN',
      `Diamond(Lv${DESCRIPTION_EDIT_MIN_LEVEL}) 이상 회원만 태그 설명을 수정할 수 있습니다.`,
    );
  }

  await withTransaction(async () => {
    const { id } = await findActiveTargetByName(tagName);
    const current = await tagRepository.findTagByIdForUpdate(id);

    if (current.status !== 'active') {
      throwTagNotFound();
    }

    if (current.description === description) {
      return;
    }

    await tagRepository.updateTagDescription(id, description);
    await activityLogService.createActivityLog({
      adminId: user.id,
      action: activityLogService.ACTIVITY_LOG_ACTIONS.UPDATE_TAG,
      targetType: 'tag',
      targetId: id,
      detail: `${editorLevel === null ? '' : `회원(Lv${editorLevel}) `}설명 수정: ${description ?? '(비움)'}`,
    });
  });

  return getTagByName(tagName, user);
};
