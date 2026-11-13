import { ConflictError, ForbiddenError, NotFoundError } from '../../common/error/http-errors.js';
import { validateRichTextLength } from '../../common/utils/html.js';
import { normalizeTagName } from '../../common/utils/tag-name.js';
import { toUserSummary } from '../../common/utils/user-summary.js';
import { withTransaction } from '../../config/database.js';
import * as attachmentService from '../attachments/attachment.service.js';
import * as tagService from '../tags/tag.service.js';
import * as viewHistoryService from '../view-histories/view-history.service.js';

import * as questionRepository from './question.repository.js';

// 첨부 연결·조회 기록에서 질문을 가리키는 target_type
const TARGET_TYPE = 'question';
const RELATED_QUESTION_LIMIT = 5;

// 질문 본문은 공백을 빼고 15자 이상 (API 명세 1.9)
const BODY_MIN_LENGTH = 15;

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

// 본문을 정리하고 길이 규칙을 검사한다. 사용 중인 에디터 이미지만 남기고 그 id를 함께 돌려준다
const prepareBody = async (rawBody) => {
  const prepared = await attachmentService.sanitizeEditorBody(rawBody);
  validateRichTextLength(prepared.body, { minLength: BODY_MIN_LENGTH });

  return prepared;
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

// 조회수는 올리지 않는다. 상세 화면 조회는 viewQuestion을 쓴다
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
  const prepared = await prepareBody(body);

  const questionId = await withTransaction(async () => {
    const tagIds = await tagService.resolveTagIdsByNames(tags, userId);
    const createdId = await questionRepository.createQuestion({
      authorId: userId,
      title,
      body: prepared.body,
    });

    await questionRepository.createQuestionTags(createdId, tagIds);
    await attachmentService.syncEditorImageLinks(TARGET_TYPE, createdId, prepared.imageIds);

    return createdId;
  });

  return getQuestionById(questionId, userId);
};

export const updateQuestion = async (userId, questionId, { title, body, tags, editReason }) => {
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
      await attachmentService.syncEditorImageLinks(TARGET_TYPE, questionId, prepared.imageIds);
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
  await withTransaction(async () => {
    const question = await questionRepository.findQuestionByIdForUpdate(questionId);
    ensureQuestionOwner(question, userId);

    const answerCount = await questionRepository.countUndeletedAnswersByQuestionId(questionId);

    if (answerCount > 0) {
      throw new ConflictError('QUESTION_HAS_ANSWERS', '답변이 달린 질문은 삭제할 수 없습니다.');
    }

    await questionRepository.deleteQuestion(questionId);
    await questionRepository.deleteQuestionTagsByQuestionId(questionId);
    await attachmentService.deleteAttachmentLinksByTarget(TARGET_TYPE, questionId);
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

// 질문 상세 화면 조회. 같은 회원(비회원은 IP)이 24시간 안에 다시 보면 조회수를 올리지 않는다 (REQ-QNA-015)
export const viewQuestion = async (questionId, viewer) => {
  const question = await getQuestionById(questionId, viewer.userId);

  const isCounted = await withTransaction(async () => {
    const isNewView = await viewHistoryService.recordView(TARGET_TYPE, questionId, viewer);

    if (isNewView) {
      await questionRepository.updateQuestionViewCount(questionId);
    }

    return isNewView;
  });

  return isCounted ? { ...question, viewCount: question.viewCount + 1 } : question;
};

export const getRelatedQuestions = async (questionId) => {
  await getQuestionById(questionId);

  const rows = await questionRepository.findRelatedQuestionsByQuestionId(
    questionId,
    RELATED_QUESTION_LIMIT,
  );

  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    answerCount: row.answer_count,
    isAccepted: row.is_accepted === 1,
    createdAt: row.created_at,
  }));
};
