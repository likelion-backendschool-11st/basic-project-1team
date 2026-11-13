import { normalizeTagName } from '../../common/utils/tag-name.js';
import {
  readBodyObject,
  readPageQuery,
  readQueryEnum,
  readQueryPositiveInteger,
  readQueryString,
  throwValidationError,
  validateIdParam,
} from '../../common/utils/validation.js';

const CONTENT_STATUSES = ['active', 'hidden', 'deleted'];
// deleted는 DELETE API로만 바꾼다 (API 명세 10.3)
const UPDATE_STATUSES = ['hidden', 'active'];
const REASON_MAX_LENGTH = 200;

export const validateQuestionId = validateIdParam('questionId');
export const validateAnswerId = validateIdParam('answerId');
export const validatePostId = validateIdParam('postId');
export const validateCommentId = validateIdParam('commentId');

const readCommonQuery = (query) => ({
  ...readPageQuery(query),
  keyword: readQueryString(query, 'keyword'),
  status: readQueryEnum(query, 'status', CONTENT_STATUSES, undefined),
});

// 태그 앞의 #과 대소문자는 태그 이름 규칙대로 정리한다 (API 명세 5.1)
const readTagQuery = (query) => {
  const tag = readQueryString(query, 'tag');
  const normalizedTag = tag === undefined ? '' : normalizeTagName(tag);

  return normalizedTag === '' ? undefined : normalizedTag;
};

// Express 5의 req.query는 읽기 전용이라 검증·변환한 값을 req.validatedQuery에 담는다
export const validateGetQuestions = (req, _res, next) => {
  req.validatedQuery = {
    ...readCommonQuery(req.query),
    authorId: readQueryPositiveInteger(req.query, 'authorId'),
    tag: readTagQuery(req.query),
  };

  next();
};

export const validateGetAnswers = (req, _res, next) => {
  req.validatedQuery = {
    ...readCommonQuery(req.query),
    authorId: readQueryPositiveInteger(req.query, 'authorId'),
  };

  next();
};

// 게시글·댓글 목록은 page·size·keyword·status만 받는다 (API 명세 10.4)
export const validateGetBoardContents = (req, _res, next) => {
  req.validatedQuery = readCommonQuery(req.query);

  next();
};

// 사유는 선택이고, 비어 있으면 null로 둔다 (API 명세 10.3)
const readReason = (reason) => {
  if (reason === undefined || reason === null) {
    return null;
  }

  if (typeof reason !== 'string') {
    throwValidationError('reason은 문자열이어야 합니다.');
  }

  const trimmedReason = reason.trim();

  if (Array.from(trimmedReason).length > REASON_MAX_LENGTH) {
    throwValidationError(`reason은 ${REASON_MAX_LENGTH}자 이하여야 합니다.`);
  }

  return trimmedReason === '' ? null : trimmedReason;
};

export const validateUpdateContentStatus = (req, _res, next) => {
  const body = readBodyObject(req.body);

  if (!UPDATE_STATUSES.includes(body.status)) {
    throwValidationError(
      'status는 hidden 또는 active여야 합니다. 삭제는 DELETE 요청으로만 할 수 있습니다.',
    );
  }

  req.body = { status: body.status, reason: readReason(body.reason) };

  next();
};
