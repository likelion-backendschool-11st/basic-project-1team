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

// query 값 읽기. 같은 키를 여러 번 보내면 배열이 되므로 문자열 하나만 받는다
export const readString = (query, key) => {
  const value = query[key];

  if (value === undefined) {
    return undefined;
  }

  if (typeof value !== 'string') {
    throwValidationError(`${key}는 한 번만 입력할 수 있습니다.`);
  }

  return value.trim();
};

export const readPositiveInteger = (query, key) => {
  const value = readString(query, key);

  if (value === undefined) {
    return undefined;
  }

  if (!POSITIVE_INTEGER_PATTERN.test(value) || !Number.isSafeInteger(Number(value))) {
    throwValidationError(`${key}는 1 이상의 정수여야 합니다.`);
  }

  return Number(value);
};

export const readBoolean = (query, key) => {
  const value = readString(query, key);

  if (value === undefined) {
    return undefined;
  }

  if (value !== 'true' && value !== 'false') {
    throwValidationError(`${key}는 true 또는 false여야 합니다.`);
  }

  return value === 'true';
};

export const readEnum = (query, key, allowedValues, defaultValue) => {
  const value = readString(query, key);

  if (value === undefined) {
    return defaultValue;
  }

  if (!allowedValues.includes(value)) {
    throwValidationError(`${key}는 ${allowedValues.join(', ')} 중 하나여야 합니다.`);
  }

  return value;
};

// 목록 size. 최대 100 (API 명세 1.5)
const MAX_SIZE = 100;

export const readSize = (query, defaultSize) => {
  const size = readPositiveInteger(query, 'size') ?? defaultSize;

  if (size > MAX_SIZE) {
    throwValidationError(`size는 ${MAX_SIZE} 이하여야 합니다.`);
  }

  return size;
};

// 검색어·태그 앞의 #은 무시하고, 빈 값이면 조건을 적용하지 않는다 (API 명세 1.5, 3장)
export const readSearchText = (query, key) => {
  const value = readString(query, key)?.replace(/^#+/, '').trim();

  return value === undefined || value === '' ? undefined : value;
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

// ---------------------------------------------------------------------
// query string 읽기. 같은 키를 여러 번 보내면 배열이 되므로 문자열 하나만 받는다
// 앞뒤 공백을 지우고, 빈 값이면 보내지 않은 것으로 본다 (API 명세 1.5)
// ---------------------------------------------------------------------

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;

export const readQueryString = (query, key) => {
  const value = query[key];

  if (value === undefined) {
    return undefined;
  }

  if (typeof value !== 'string') {
    throwValidationError(`${key}는 한 번만 입력할 수 있습니다.`);
  }

  const trimmedValue = value.trim();

  return trimmedValue === '' ? undefined : trimmedValue;
};

export const readQueryPositiveInteger = (query, key) => {
  const value = readQueryString(query, key);

  if (value === undefined) {
    return undefined;
  }

  if (!POSITIVE_INTEGER_PATTERN.test(value) || !Number.isSafeInteger(Number(value))) {
    throwValidationError(`${key}는 1 이상의 정수여야 합니다.`);
  }

  return Number(value);
};

export const readQueryEnum = (query, key, allowedValues, defaultValue) => {
  const value = readQueryString(query, key);

  if (value === undefined) {
    return defaultValue;
  }

  if (!allowedValues.includes(value)) {
    throwValidationError(`${key}는 ${allowedValues.join(', ')} 중 하나여야 합니다.`);
  }

  return value;
};

// page는 1부터, size는 API별 기본값(없으면 20)에 최대 100 (API 명세 1.5)
export const readPageQuery = (query, defaultSize = DEFAULT_PAGE_SIZE) => {
  const size = readQueryPositiveInteger(query, 'size') ?? defaultSize;

  if (size > MAX_PAGE_SIZE) {
    throwValidationError(`size는 ${MAX_PAGE_SIZE} 이하여야 합니다.`);
  }

  return { page: readQueryPositiveInteger(query, 'page') ?? DEFAULT_PAGE, size };
};
