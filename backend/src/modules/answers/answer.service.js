import {
  BadRequestError,
  ConflictError,
  ForbiddenError,
  NotFoundError,
} from '../../common/error/http-errors.js';
import { validateRichTextLength } from '../../common/utils/html.js';
import { toUserSummary } from '../../common/utils/user-summary.js';
import { withTransaction } from '../../config/database.js';
import * as attachmentService from '../attachments/attachment.service.js';
import * as questionService from '../questions/question.service.js';

import * as answerRepository from './answer.repository.js';

// 첨부 연결에서 답변을 가리키는 target_type
const TARGET_TYPE = 'answer';
// 답변 본문은 공백을 빼고 1자 이상 (API 명세 1.9)
const BODY_MIN_LENGTH = 1;

const throwAnswerNotFound = () => {
  throw new NotFoundError('ANSWER_NOT_FOUND', '답변을 찾을 수 없습니다.');
};

// canAccept: 질문 작성자이고, 본인 답변이 아니고, 질문에 채택된 답변이 없을 때만 true (API 명세 4장)
const toAnswer = (row, viewerId) => {
  const isLoggedIn = viewerId !== null;

  return {
    id: row.id,
    questionId: row.question_id,
    body: row.body,
    author: toUserSummary(row, 'author'),
    voteCount: row.vote_count,
    isVoted: row.is_voted === 1,
    isAccepted: row.is_accepted === 1,
    isEdited: row.edited_at !== null,
    isMine: isLoggedIn && row.author_id === viewerId,
    canAccept:
      isLoggedIn &&
      row.question_author_id === viewerId &&
      row.author_id !== viewerId &&
      row.question_has_accepted_answer === 0,
    createdAt: row.created_at,
    editedAt: row.edited_at,
    updatedAt: row.updated_at,
  };
};

const prepareBody = async (rawBody) => {
  const prepared = await attachmentService.sanitizeEditorBody(rawBody);
  validateRichTextLength(prepared.body, { minLength: BODY_MIN_LENGTH });

  return prepared;
};

// 잠근 답변이 수정·삭제할 수 있는 상태이고 요청한 회원이 작성자인지 확인한다
const ensureAnswerEditable = (answer, userId) => {
  if (answer === null || answer.status !== 'active' || answer.question_status !== 'active') {
    throwAnswerNotFound();
  }

  // TODO: content_manage 권한 회원도 허용하고 활동 로그(MODERATE_EDIT·MODERATE_DELETE)를 남긴다 (#57)
  if (answer.author_id !== userId) {
    throw new ForbiddenError('FORBIDDEN', '답변 작성자만 수정·삭제할 수 있습니다.');
  }

  if (answer.is_accepted === 1) {
    throw new ConflictError('ANSWER_ALREADY_ACCEPTED', '채택된 답변은 수정·삭제할 수 없습니다.');
  }
};

export const getAnswersByQuestionId = async (questionId, viewerId, sort) => {
  await questionService.getQuestionById(questionId);

  const rows = await answerRepository.findAnswersByQuestionId(questionId, viewerId, sort);

  return rows.map((row) => toAnswer(row, viewerId));
};

export const getAnswerById = async (answerId, viewerId) => {
  const row = await answerRepository.findAnswerById(answerId, viewerId);

  if (row === null) {
    throwAnswerNotFound();
  }

  return toAnswer(row, viewerId);
};

export const createAnswer = async (userId, questionId, { body }) => {
  const prepared = await prepareBody(body);

  const answerId = await withTransaction(async () => {
    await questionService.getQuestionByIdForShare(questionId);

    const createdId = await answerRepository.createAnswer({
      questionId,
      authorId: userId,
      body: prepared.body,
    });

    await attachmentService.syncEditorImageLinks(TARGET_TYPE, createdId, prepared.imageIds);

    return createdId;
  });

  return getAnswerById(answerId, userId);
};

export const updateAnswer = async (userId, answerId, { body, editReason }) => {
  const prepared = await prepareBody(body);

  await withTransaction(async () => {
    const answer = await answerRepository.findAnswerByIdForUpdate(answerId);
    ensureAnswerEditable(answer, userId);

    const editedAt = new Date();

    await answerRepository.updateAnswer(answerId, { body: prepared.body, editedAt });
    await attachmentService.syncEditorImageLinks(TARGET_TYPE, answerId, prepared.imageIds);
    await answerRepository.createAnswerEditHistory({
      answerId,
      editorId: userId,
      editReason,
      editedAt,
    });
  });

  return getAnswerById(answerId, userId);
};

export const deleteAnswer = async (userId, answerId) => {
  await withTransaction(async () => {
    const answer = await answerRepository.findAnswerByIdForUpdate(answerId);
    ensureAnswerEditable(answer, userId);

    await answerRepository.deleteAnswer(answerId);
    await attachmentService.deleteAttachmentLinksByTarget(TARGET_TYPE, answerId);
  });
};

// 질문 작성자가 남의 답변을 채택한다. 질문당 1개이고 취소할 수 없다 (API 명세 4장, 1.10)
// 답변 행 → 질문 행 순서로 잠근다. 같은 질문의 채택 요청이 동시에 와도 질문 행에서 한 건씩 확인한다
export const acceptAnswer = async (userId, answerId) => {
  await withTransaction(async () => {
    const answer = await answerRepository.findAnswerByIdForUpdate(answerId);

    if (answer === null || answer.status !== 'active') {
      throwAnswerNotFound();
    }

    const question = await questionService.findActiveQuestionByIdForUpdate(answer.question_id);

    if (question === null) {
      throwAnswerNotFound();
    }

    if (question.authorId !== userId) {
      throw new ForbiddenError('FORBIDDEN', '질문 작성자만 답변을 채택할 수 있습니다.');
    }

    if (answer.author_id === userId) {
      throw new BadRequestError('CANNOT_ACCEPT_OWN_ANSWER', '본인 답변은 채택할 수 없습니다.');
    }

    if (await answerRepository.hasAcceptedAnswerByQuestionId(question.id)) {
      throw new ConflictError('QUESTION_ALREADY_ACCEPTED', '이미 채택된 답변이 있습니다.');
    }

    await answerRepository.acceptAnswer(answerId);
  });

  return getAnswerById(answerId, userId);
};

export const getAnswerEditHistories = async (answerId) => {
  await getAnswerById(answerId, null);

  const rows = await answerRepository.findAnswerEditHistoriesByAnswerId(answerId);

  return rows.map((row) => ({
    id: row.id,
    editedAt: row.edited_at,
    editor: toUserSummary(row, 'editor'),
    editReason: row.edit_reason,
  }));
};
