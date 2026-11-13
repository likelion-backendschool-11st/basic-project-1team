import {
  BadRequestError,
  ConflictError,
  ForbiddenError,
  NotFoundError,
} from '../../common/error/http-errors.js';
import {
  countCharacters,
  findImageSources,
  sanitizeRichText,
  toPlainText,
} from '../../common/utils/html.js';
import { normalizeTagName } from '../../common/utils/tag-name.js';
import { withTransaction } from '../../config/database.js';
import * as attachmentService from '../attachments/attachment.service.js';
import * as sanctionService from '../sanctions/sanction.service.js';
import * as tagService from '../tags/tag.service.js';

import * as questionRepository from './question.repository.js';

const ATTACHMENT_TARGET_TYPE = 'question';
const WRITE_SANCTION_TYPES = [
  sanctionService.SANCTION_TYPE.SUSPEND,
  sanctionService.SANCTION_TYPE.WRITE_BAN,
];
const DELETE_SANCTION_TYPES = [sanctionService.SANCTION_TYPE.SUSPEND];

// 본문 길이 규칙 (API 명세 1.9)
const BODY_MIN_LENGTH = 15;
const BODY_MAX_TEXT_LENGTH = 10_000;
const BODY_MAX_HTML_LENGTH = 100_000;

const WITHDRAWN_USER = { id: null, nickname: '탈퇴한 회원', profileImageUrl: null };

// row의 <prefix>_id, <prefix>_nickname 등을 UserSummary로 바꾼다 (API 명세 1.6)
const toUserSummary = (row, prefix) => {
  if (row[`${prefix}_status`] === 'withdrawn') {
    return WITHDRAWN_USER;
  }

  return {
    id: row[`${prefix}_id`],
    nickname: row[`${prefix}_nickname`],
    profileImageUrl: row[`${prefix}_profile_image_url`],
  };
};

const groupTagNamesByQuestionId = (tagRows) => {
  const tagNamesByQuestionId = new Map();

  for (const { question_id: questionId, name } of tagRows) {
    const tagNames = tagNamesByQuestionId.get(questionId) ?? [];
    tagNames.push(name);
    tagNamesByQuestionId.set(questionId, tagNames);
  }

  return tagNamesByQuestionId;
};

export const getQuestions = async (query) => {
  const { page, size, sort, keyword, tag, ...rest } = query;
  const filter = {
    ...rest,
    keyword,
    tagKeyword: keyword === undefined ? undefined : normalizeTagName(keyword),
    tag: tag === undefined ? undefined : normalizeTagName(tag),
  };

  const [rows, totalCount] = await Promise.all([
    questionRepository.findQuestions({ filter, sort, limit: size, offset: (page - 1) * size }),
    questionRepository.countQuestions(filter),
  ]);

  const tagRows = await questionRepository.findTagNamesByQuestionIds(rows.map((row) => row.id));
  const tagNamesByQuestionId = groupTagNamesByQuestionId(tagRows);

  const questions = rows.map((row) => ({
    id: row.id,
    title: row.title,
    tags: tagNamesByQuestionId.get(row.id) ?? [],
    answerCount: row.answer_count,
    isAccepted: row.is_accepted === 1,
    viewCount: row.view_count,
    author: toUserSummary(row, 'author'),
    createdAt: row.created_at,
  }));

  return { questions, meta: { page, size, totalCount } };
};

const throwBodyValidationError = (message) => {
  throw new BadRequestError('VALIDATION_ERROR', message);
};

// 본문을 정리하고 길이 규칙을 검사한다. 사용 중인 에디터 이미지만 남기고 그 id를 함께 돌려준다
const prepareBody = async (rawBody) => {
  const images = await attachmentService.findEditorImagesByUrls(findImageSources(rawBody));
  const body = sanitizeRichText(rawBody, new Set(images.map((image) => image.url)));
  const text = toPlainText(body);

  if (countCharacters(text.replace(/\s/g, '')) < BODY_MIN_LENGTH) {
    throwBodyValidationError(`본문은 공백을 빼고 ${BODY_MIN_LENGTH}자 이상이어야 합니다.`);
  }

  if (countCharacters(text) > BODY_MAX_TEXT_LENGTH) {
    throwBodyValidationError(`본문은 ${BODY_MAX_TEXT_LENGTH.toLocaleString()}자 이하여야 합니다.`);
  }

  if (countCharacters(body) > BODY_MAX_HTML_LENGTH) {
    throwBodyValidationError(
      `본문 HTML은 ${BODY_MAX_HTML_LENGTH.toLocaleString()}자 이하여야 합니다.`,
    );
  }

  return { body, imageIds: images.map((image) => image.id) };
};

// 잠근 질문이 수정·삭제할 수 있는 상태이고 요청한 회원이 작성자인지 확인한다
const ensureQuestionOwner = (question, userId) => {
  if (question === null || question.status !== 'active') {
    throw new NotFoundError('QUESTION_NOT_FOUND', '질문을 찾을 수 없습니다.');
  }

  // TODO: content_manage 권한 회원도 허용하고 활동 로그(MODERATE_EDIT·MODERATE_DELETE)를 남긴다 (#57)
  if (question.author_id !== userId) {
    throw new ForbiddenError('FORBIDDEN', '질문 작성자만 수정·삭제할 수 있습니다.');
  }
};

const replaceQuestionTags = async (questionId, tagNames, userId) => {
  const tagIds = await tagService.resolveTagIdsByNames(tagNames, userId);

  await questionRepository.deleteQuestionTagsExceptTagIds(questionId, tagIds);
  await questionRepository.createQuestionTags(questionId, tagIds);
};

// 조회수는 올리지 않는다. 조회수 증가는 질문 상세 API에서 한다 (#73)
export const getQuestionById = async (questionId, userId) => {
  const row = await questionRepository.findQuestionById(questionId);

  if (row === null) {
    throw new NotFoundError('QUESTION_NOT_FOUND', '질문을 찾을 수 없습니다.');
  }

  const tagRows = await questionRepository.findTagNamesByQuestionIds([row.id]);

  return {
    id: row.id,
    title: row.title,
    body: row.body,
    tags: tagRows.map((tagRow) => tagRow.name),
    author: toUserSummary(row, 'author'),
    viewCount: row.view_count,
    answerCount: row.answer_count,
    isAccepted: row.is_accepted === 1,
    isEdited: row.edited_at !== null,
    isMine: row.author_id === userId,
    createdAt: row.created_at,
    editedAt: row.edited_at,
    updatedAt: row.updated_at,
  };
};

export const createQuestion = async (userId, { title, body, tags }) => {
  await sanctionService.ensureNotSanctioned(userId, WRITE_SANCTION_TYPES);

  const prepared = await prepareBody(body);

  const questionId = await withTransaction(async () => {
    const tagIds = await tagService.resolveTagIdsByNames(tags, userId);
    const createdId = await questionRepository.createQuestion({
      authorId: userId,
      title,
      body: prepared.body,
    });

    await questionRepository.createQuestionTags(createdId, tagIds);
    await attachmentService.syncEditorImageLinks(
      ATTACHMENT_TARGET_TYPE,
      createdId,
      prepared.imageIds,
    );

    return createdId;
  });

  return getQuestionById(questionId, userId);
};

export const updateQuestion = async (userId, questionId, { title, body, tags, editReason }) => {
  await sanctionService.ensureNotSanctioned(userId, WRITE_SANCTION_TYPES);

  const prepared = body === undefined ? undefined : await prepareBody(body);

  await withTransaction(async () => {
    const question = await questionRepository.findQuestionByIdForUpdate(questionId);
    ensureQuestionOwner(question, userId);

    const editedAt = new Date();

    await questionRepository.updateQuestion(questionId, {
      title,
      body: prepared?.body,
      editedAt,
    });

    if (tags !== undefined) {
      await replaceQuestionTags(questionId, tags, userId);
    }

    if (prepared !== undefined) {
      await attachmentService.syncEditorImageLinks(
        ATTACHMENT_TARGET_TYPE,
        questionId,
        prepared.imageIds,
      );
    }

    await questionRepository.createQuestionEditHistory({
      questionId,
      editorId: userId,
      editReason,
      editedAt,
    });
  });

  return getQuestionById(questionId, userId);
};

export const deleteQuestion = async (userId, questionId) => {
  await sanctionService.ensureNotSanctioned(userId, DELETE_SANCTION_TYPES);

  await withTransaction(async () => {
    const question = await questionRepository.findQuestionByIdForUpdate(questionId);
    ensureQuestionOwner(question, userId);

    const answerCount = await questionRepository.countUndeletedAnswersByQuestionId(questionId);

    if (answerCount > 0) {
      throw new ConflictError('QUESTION_HAS_ANSWERS', '답변이 달린 질문은 삭제할 수 없습니다.');
    }

    await questionRepository.deleteQuestion(questionId);
    await questionRepository.deleteQuestionTagsByQuestionId(questionId);
    await attachmentService.deleteAttachmentLinksByTarget(ATTACHMENT_TARGET_TYPE, questionId);
  });
};

export const getQuestionEditHistories = async (questionId) => {
  await getQuestionById(questionId);

  const rows = await questionRepository.findQuestionEditHistoriesByQuestionId(questionId);

  return rows.map((row) => ({
    id: row.id,
    editedAt: row.edited_at,
    editor: toUserSummary(row, 'editor'),
    editReason: row.edit_reason,
  }));
};
