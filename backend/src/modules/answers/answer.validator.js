import {
  readBodyObject,
  readEditReason,
  readEnum,
  readPositiveInteger,
  readRichTextBody,
  readSize,
  throwValidationError,
  validateIdParam,
} from '../../common/utils/validation.js';

const SORTS = ['latest', 'votes'];
const DEFAULT_PAGE = 1;
const DEFAULT_SIZE = 10;

export const validateAnswerId = validateIdParam('answerId');
export const validateQuestionId = validateIdParam('questionId');

// Express 5의 req.query는 읽기 전용이라 검증·변환한 값을 req.validatedQuery에 담는다
export const validateGetAnswers = (req, _res, next) => {
  req.validatedQuery = { sort: readEnum(req.query, 'sort', SORTS, 'latest') };

  next();
};

export const validateCreateAnswer = (req, _res, next) => {
  const body = readBodyObject(req.body);

  req.body = { body: readRichTextBody(body.body) };

  next();
};

// 답변은 본문만 수정할 수 있다 (API 명세 4장 PATCH)
export const validateUpdateAnswer = (req, _res, next) => {
  const body = readBodyObject(req.body);

  req.body = {
    body: readRichTextBody(body.body),
    editReason: readEditReason(body.editReason),
  };

  next();
};

// 회원이 쓴 답변 목록 (API_SPEC 4장 GET /api/answers). authorId 는 필수
export const validateGetAnswersByAuthor = (req, _res, next) => {
  const authorId = readPositiveInteger(req.query, 'authorId');

  if (authorId === undefined) {
    throwValidationError('authorId는 필수입니다.');
  }

  req.validatedQuery = {
    authorId,
    page: readPositiveInteger(req.query, 'page') ?? DEFAULT_PAGE,
    size: readSize(req.query, DEFAULT_SIZE),
  };

  next();
};
