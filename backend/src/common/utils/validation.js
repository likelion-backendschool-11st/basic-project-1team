import { BadRequestError } from '../error/http-errors.js';

import { countCharacters } from './html.js';

export const POSITIVE_INTEGER_PATTERN = /^[1-9]\d*$/;

const EDIT_REASON_MAX_LENGTH = 200;

export const throwValidationError = (message) => {
  throw new BadRequestError('VALIDATION_ERROR', message);
};

// 경로 id(:questionId 등)는 1 이상의 정수만 받는다 (API 명세 1.3)
export const validateIdParam = (name) => (req, _res, next) => {
  if (!POSITIVE_INTEGER_PATTERN.test(req.params[name])) {
    throwValidationError(`${name}는 1 이상의 정수여야 합니다.`);
  }

  next();
};

export const readBodyObject = (body) => {
  if (body === undefined) {
    return {};
  }

  if (body === null || typeof body !== 'object' || Array.isArray(body)) {
    throwValidationError('요청 본문은 JSON 객체여야 합니다.');
  }

  return body;
};

// 본문 글자 수와 HTML 정리는 저장할 HTML 기준이라 Service에서 검사한다
export const readRichTextBody = (body) => {
  if (typeof body !== 'string') {
    throwValidationError('body는 문자열이어야 합니다.');
  }

  return body;
};

// 질문·답변 수정 사유. 입력하지 않았거나 빈 값이면 null로 저장한다 (API 명세 3장 수정 이력)
export const readEditReason = (editReason) => {
  if (editReason === undefined || editReason === null) {
    return null;
  }

  if (typeof editReason !== 'string') {
    throwValidationError('editReason은 문자열이어야 합니다.');
  }

  const trimmedEditReason = editReason.trim();

  if (countCharacters(trimmedEditReason) > EDIT_REASON_MAX_LENGTH) {
    throwValidationError(`editReason은 ${EDIT_REASON_MAX_LENGTH}자 이하여야 합니다.`);
  }

  return trimmedEditReason === '' ? null : trimmedEditReason;
};
