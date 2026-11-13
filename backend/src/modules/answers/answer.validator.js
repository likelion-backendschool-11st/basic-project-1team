import {
  readBodyObject,
  readEditReason,
  readEnum,
  readRichTextBody,
  validateIdParam,
} from '../../common/utils/validation.js';

const SORTS = ['latest', 'votes'];

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
