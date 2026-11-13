import { countCharacters } from '../../common/utils/html.js';
import {
  readBodyObject,
  readEnum,
  readPositiveInteger,
  readRichTextBody,
  readSize,
  readString,
  throwValidationError,
  validateIdParam,
} from '../../common/utils/validation.js';

const DEFAULT_PAGE = 1;
const DEFAULT_SIZE = 10;
const SORTS = ['latest', 'oldest'];
const TITLE_MAX_LENGTH = 80;

// Express 5의 req.query는 읽기 전용이라 검증·변환한 값을 req.validatedQuery에 담는다
export const validateGetPosts = (req, _res, next) => {
  const keyword = readString(req.query, 'keyword');

  req.validatedQuery = {
    page: readPositiveInteger(req.query, 'page') ?? DEFAULT_PAGE,
    size: readSize(req.query, DEFAULT_SIZE),
    sort: readEnum(req.query, 'sort', SORTS, 'latest'),
    // 검색어는 앞뒤 공백을 지우고, 빈 값이면 조건을 적용하지 않는다 (API 명세 1.5)
    keyword: keyword === '' ? undefined : keyword,
    authorId: readPositiveInteger(req.query, 'authorId'),
  };

  next();
};

export const validatePostId = validateIdParam('postId');

const readTitle = (title) => {
  if (typeof title !== 'string') {
    throwValidationError('title은 문자열이어야 합니다.');
  }

  const trimmedTitle = title.trim();
  const length = countCharacters(trimmedTitle);

  if (length < 1 || length > TITLE_MAX_LENGTH) {
    throwValidationError(`title은 1~${TITLE_MAX_LENGTH}자여야 합니다.`);
  }

  return trimmedTitle;
};

export const validateCreatePost = (req, _res, next) => {
  const body = readBodyObject(req.body);

  req.body = {
    title: readTitle(body.title),
    body: readRichTextBody(body.body),
  };

  next();
};

// 보낸 필드만 수정한다 (API 명세 7장 PATCH)
export const validateUpdatePost = (req, _res, next) => {
  const body = readBodyObject(req.body);

  if (body.title === undefined && body.body === undefined) {
    throwValidationError('수정할 항목(title, body)을 하나 이상 보내야 합니다.');
  }

  req.body = {
    title: body.title === undefined ? undefined : readTitle(body.title),
    body: body.body === undefined ? undefined : readRichTextBody(body.body),
  };

  next();
};
