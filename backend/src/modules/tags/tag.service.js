import { BadRequestError } from '../../common/error/http-errors.js';
import { normalizeTagName } from '../../common/utils/tag-name.js';

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

  return rows.map((row) => ({ id: row.id, name: row.name, questionCount: row.question_count }));
};
