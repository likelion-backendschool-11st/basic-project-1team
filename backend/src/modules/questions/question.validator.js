import { BadRequestError } from '../../common/error/http-errors.js';

const DEFAULT_PAGE = 1;
const DEFAULT_SIZE = 10;
const MAX_SIZE = 100;
const SORTS = ['latest', 'views'];
const SCOPES = ['all', 'title', 'tag', 'author'];
const POSITIVE_INTEGER_PATTERN = /^[1-9]\d*$/;

const throwValidationError = (message) => {
  throw new BadRequestError('VALIDATION_ERROR', message);
};

// 같은 키를 여러 번 보내면 배열이 되므로 문자열 하나만 받는다
const readString = (query, key) => {
  const value = query[key];

  if (value === undefined) {
    return undefined;
  }

  if (typeof value !== 'string') {
    throwValidationError(`${key}는 한 번만 입력할 수 있습니다.`);
  }

  return value.trim();
};

const readPositiveInteger = (query, key) => {
  const value = readString(query, key);

  if (value === undefined) {
    return undefined;
  }

  if (!POSITIVE_INTEGER_PATTERN.test(value) || !Number.isSafeInteger(Number(value))) {
    throwValidationError(`${key}는 1 이상의 정수여야 합니다.`);
  }

  return Number(value);
};

const readBoolean = (query, key) => {
  const value = readString(query, key);

  if (value === undefined) {
    return undefined;
  }

  if (value !== 'true' && value !== 'false') {
    throwValidationError(`${key}는 true 또는 false여야 합니다.`);
  }

  return value === 'true';
};

const readEnum = (query, key, allowedValues, defaultValue) => {
  const value = readString(query, key);

  if (value === undefined) {
    return defaultValue;
  }

  if (!allowedValues.includes(value)) {
    throwValidationError(`${key}는 ${allowedValues.join(', ')} 중 하나여야 합니다.`);
  }

  return value;
};

// 검색어·태그 앞의 #은 무시하고, 빈 값이면 조건을 적용하지 않는다 (API 명세 1.5, 3장)
const readSearchText = (query, key) => {
  const value = readString(query, key)?.replace(/^#+/, '').trim();

  return value === undefined || value === '' ? undefined : value;
};

// Express 5의 req.query는 읽기 전용이라 검증·변환한 값을 req.validatedQuery에 담는다
export const validateGetQuestions = (req, _res, next) => {
  const size = readPositiveInteger(req.query, 'size') ?? DEFAULT_SIZE;

  if (size > MAX_SIZE) {
    throwValidationError(`size는 ${MAX_SIZE} 이하여야 합니다.`);
  }

  req.validatedQuery = {
    page: readPositiveInteger(req.query, 'page') ?? DEFAULT_PAGE,
    size,
    sort: readEnum(req.query, 'sort', SORTS, 'latest'),
    keyword: readSearchText(req.query, 'keyword'),
    scope: readEnum(req.query, 'scope', SCOPES, 'all'),
    tag: readSearchText(req.query, 'tag'),
    hasAnswer: readBoolean(req.query, 'hasAnswer'),
    isAccepted: readBoolean(req.query, 'isAccepted'),
    authorId: readPositiveInteger(req.query, 'authorId'),
    answerAuthorId: readPositiveInteger(req.query, 'answerAuthorId'),
  };

  next();
};
