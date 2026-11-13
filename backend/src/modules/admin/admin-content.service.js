import { ConflictError, NotFoundError } from '../../common/error/http-errors.js';
import { toPlainText } from '../../common/utils/html.js';
import { toUserSummary } from '../../common/utils/user-summary.js';
import { withTransaction } from '../../config/database.js';
import * as attachmentService from '../attachments/attachment.service.js';

import * as activityLogService from './activity-log.service.js';
import * as adminContentRepository from './admin-content.repository.js';

const PREVIEW_LENGTH = 60;

const NOT_FOUND = {
  question: ['QUESTION_NOT_FOUND', '질문을 찾을 수 없습니다.'],
  answer: ['ANSWER_NOT_FOUND', '답변을 찾을 수 없습니다.'],
  post: ['POST_NOT_FOUND', '게시글을 찾을 수 없습니다.'],
  comment: ['COMMENT_NOT_FOUND', '댓글을 찾을 수 없습니다.'],
};

// 활동 로그 action은 HIDE_QUESTION처럼 <동작>_<종류> (API 명세 10.8)
const toLogAction = (verb, type) => `${verb}_${type.toUpperCase()}`;

// 답변 본문은 HTML이라 글자만 뽑고, 앞 60자를 보여 준다 (API 명세 10.3·10.4)
const toPreview = (text) =>
  Array.from(text.replace(/\s+/g, ' ').trim()).slice(0, PREVIEW_LENGTH).join('');

const groupTagNames = (rows) => {
  const tagNamesByQuestionId = new Map();

  for (const row of rows) {
    const tagNames = tagNamesByQuestionId.get(row.question_id) ?? [];
    tagNames.push(row.name);
    tagNamesByQuestionId.set(row.question_id, tagNames);
  }

  return tagNamesByQuestionId;
};

const toItems = {
  question: async (rows) => {
    const tagRows = await adminContentRepository.findTagNamesByQuestionIds(
      rows.map((row) => row.id),
    );
    const tagNamesByQuestionId = groupTagNames(tagRows);

    return rows.map((row) => ({
      id: row.id,
      title: row.title,
      author: toUserSummary(row, 'author'),
      tags: tagNamesByQuestionId.get(row.id) ?? [],
      answerCount: row.answer_count,
      isAccepted: row.is_accepted === 1,
      status: row.status,
      createdAt: row.created_at,
    }));
  },
  answer: async (rows) =>
    rows.map((row) => ({
      id: row.id,
      preview: toPreview(toPlainText(row.body)),
      question: { id: row.question_id, title: row.question_title },
      author: toUserSummary(row, 'author'),
      isAccepted: row.is_accepted === 1,
      status: row.status,
      createdAt: row.created_at,
    })),
  post: async (rows) =>
    rows.map((row) => ({
      id: row.id,
      title: row.title,
      author: toUserSummary(row, 'author'),
      commentCount: row.comment_count,
      status: row.status,
      createdAt: row.created_at,
    })),
  comment: async (rows) =>
    rows.map((row) => ({
      id: row.id,
      preview: toPreview(row.body),
      post: { id: row.post_id, title: row.post_title },
      author: toUserSummary(row, 'author'),
      status: row.status,
      createdAt: row.created_at,
    })),
};

export const getContents = async (type, { page, size, ...filter }) => {
  const [rows, totalCount] = await Promise.all([
    adminContentRepository.findContents(type, { filter, limit: size, offset: (page - 1) * size }),
    adminContentRepository.countContents(type, filter),
  ]);

  return { items: await toItems[type](rows), meta: { page, size, totalCount } };
};

const getContentById = async (type, id) => {
  const rows = await adminContentRepository.findContents(type, {
    filter: { id },
    limit: 1,
    offset: 0,
  });
  const [item] = await toItems[type](rows);

  return item;
};

// 상세에 함께 보여 줄 하위 글: 질문은 답변, 게시글은 댓글 (숨김·삭제 포함)
const findChildren = {
  question: async (id) => {
    const rows = await adminContentRepository.findAnswersByQuestionId(id);

    return {
      answers: rows.map((row) => ({
        id: row.id,
        body: row.body,
        author: toUserSummary(row, 'author'),
        isAccepted: row.is_accepted === 1,
        status: row.status,
        createdAt: row.created_at,
      })),
    };
  },
  answer: async () => ({}),
  post: async (id) => {
    const rows = await adminContentRepository.findCommentsByPostId(id);

    return {
      comments: rows.map((row) => ({
        id: row.id,
        body: row.body,
        author: toUserSummary(row, 'author'),
        status: row.status,
        createdAt: row.created_at,
      })),
    };
  },
  comment: async () => ({}),
};

/** 관리자 상세 (API 명세 10.3·10.4 GET .../:id). 숨김·삭제된 글도 본문까지 보여 준다. */
export const getContentDetail = async (type, id) => {
  const item = await getContentById(type, id);

  if (item === undefined) {
    throw new NotFoundError(...NOT_FOUND[type]);
  }

  const [body, children] = await Promise.all([
    adminContentRepository.findContentBodyById(type, id),
    findChildren[type](id),
  ]);

  return { ...item, body, ...children };
};

const lockContent = async (type, id) => {
  const content = await adminContentRepository.findContentByIdForUpdate(type, id);

  if (content === null) {
    throw new NotFoundError(...NOT_FOUND[type]);
  }

  return content;
};

const joinDetail = (...parts) => {
  const detail = parts.filter((part) => part !== null && part !== undefined && part !== '');

  return detail.length === 0 ? null : detail.join(' · ');
};

/**
 * 숨김(hidden) / 복구(active) (API 명세 10.3 PATCH). 이미 그 상태면 바꾸지 않고 로그도 남기지 않는다.
 * 채택된 답변을 숨기면 채택을 풀고, 복구해도 되돌리지 않는다.
 */
export const updateContentStatus = async (adminId, type, id, { status, reason }) =>
  withTransaction(async () => {
    const content = await lockContent(type, id);

    if (content.status === 'deleted') {
      throw new ConflictError('CONTENT_DELETED', '삭제된 항목은 숨기거나 복구할 수 없습니다.');
    }

    const { isChanged, isAcceptanceReleased } = await changeContentStatus(type, content, status);

    if (isChanged) {
      await activityLogService.createActivityLog({
        adminId,
        action: toLogAction(status === 'hidden' ? 'HIDE' : 'RESTORE', type),
        targetType: type,
        targetId: id,
        detail: joinDetail(reason, isAcceptanceReleased ? '채택 해제' : null),
      });
    }

    return getContentById(type, id);
  });

// 이미 그 상태면 바꾸지 않는다. 채택된 답변을 숨기면 채택을 푼다 (DB 설계서 4.7)
const changeContentStatus = async (type, content, status) => {
  if (content.status === status) {
    return { isChanged: false, isAcceptanceReleased: false };
  }

  await adminContentRepository.updateContentStatus(type, content.id, status);

  const isAcceptanceReleased = status === 'hidden' && content.is_accepted === 1;

  if (isAcceptanceReleased) {
    await adminContentRepository.releaseAnswerAcceptance(content.id);
  }

  return { isChanged: true, isAcceptanceReleased };
};

/**
 * 신고 처리에서 대상의 상태를 잠그고 확인한다 (API 명세 10.6). 신고 처리 트랜잭션 안에서 부른다.
 * 대상이 없으면 null (신고 접수 후 행이 지워질 일은 없지만 다형 참조라 FK가 없다)
 */
export const findContentStatusForUpdate = async (type, id) => {
  const content = await adminContentRepository.findContentByIdForUpdate(type, id);

  return content?.status ?? null;
};

/**
 * 신고 처리의 "대상 숨김" (API 명세 10.6). 답변 숨김과 같이 채택을 풀고, 활동 로그는
 * 신고 처리(RESOLVE_REPORT) 하나로 남기므로 여기서 남기지 않는다. 채택을 풀었는지 돌려준다.
 */
export const hideContentForReport = async (type, id) => {
  const content = await lockContent(type, id);
  const { isAcceptanceReleased } = await changeContentStatus(type, content, 'hidden');

  return isAcceptanceReleased;
};

// 신고 화면의 대상 내용: 상태와 본문 글자 (질문·답변·게시글 본문은 HTML이라 글자만 뽑는다)
export const findReportTargets = async (targets) => {
  const idsByType = new Map();

  for (const { type, id } of targets) {
    idsByType.set(type, [...(idsByType.get(type) ?? []), id]);
  }

  const results = await Promise.all(
    [...idsByType].map(async ([type, ids]) => {
      const rows = await adminContentRepository.findContentBodiesByIds(type, [...new Set(ids)]);

      return rows.map((row) => [
        `${type}:${row.id}`,
        {
          status: row.status,
          text: (type === 'comment' ? row.body : toPlainText(row.body)).replace(/\s+/g, ' ').trim(),
        },
      ]);
    }),
  );

  return new Map(results.flat());
};

export { toPreview };

// 종류별로 함께 지울 것을 지우고, 활동 로그에 적을 내용을 돌려준다
const cascadeDelete = {
  // 관리자는 답변이 있는 질문도 지운다. 답변·태그 연결·본문 이미지 연결을 함께 끊는다 (API 명세 10.3, 1.7)
  question: async (id) => {
    const answerIds = await adminContentRepository.findUndeletedAnswerIdsByQuestionId(id);

    await adminContentRepository.deleteAnswersByQuestionId(id);
    await adminContentRepository.deleteQuestionTagsByQuestionId(id);
    await attachmentService.deleteAttachmentLinksByTarget('question', id);

    for (const answerId of answerIds) {
      await attachmentService.deleteAttachmentLinksByTarget('answer', answerId);
    }

    return answerIds.length > 0 ? `답변 ${answerIds.length}개 함께 삭제` : null;
  },
  answer: async (id, content) => {
    await attachmentService.deleteAttachmentLinksByTarget('answer', id);

    if (content.is_accepted !== 1) {
      return null;
    }

    await adminContentRepository.releaseAnswerAcceptance(id);

    return '채택 해제';
  },
  post: async (id) => {
    const commentCount = await adminContentRepository.deleteCommentsByPostId(id);
    await attachmentService.deleteAttachmentLinksByTarget('post', id);

    return commentCount > 0 ? `댓글 ${commentCount}개 함께 삭제` : null;
  },
  comment: async () => null,
};

/** 삭제 (API 명세 10.3·10.4 DELETE). soft delete이고, 이미 삭제됐으면 바꾸지 않고 로그도 남기지 않는다. */
export const deleteContent = async (adminId, type, id) =>
  withTransaction(async () => {
    const content = await lockContent(type, id);

    if (content.status === 'deleted') {
      return;
    }

    await adminContentRepository.deleteContent(type, id);
    const detail = await cascadeDelete[type](id, content);

    await activityLogService.createActivityLog({
      adminId,
      action: toLogAction('DELETE', type),
      targetType: type,
      targetId: id,
      detail,
    });
  });
