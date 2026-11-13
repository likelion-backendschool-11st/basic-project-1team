import { BadRequestError } from '../../common/error/http-errors.js';
import { countCharacters } from '../../common/utils/html.js';
import { isValidTagName, normalizeTagName } from '../../common/utils/tag-name.js';
import {
  readBodyObject,
  readBoolean,
  readEditReason,
  readEnum,
  readPositiveInteger,
  readRichTextBody,
  readSearchText,
  readSize,
  throwValidationError,
  validateIdParam,
} from '../../common/utils/validation.js';

const DEFAULT_PAGE = 1;
const DEFAULT_SIZE = 10;
const SORTS = ['latest', 'views'];
const SCOPES = ['all', 'title', 'tag', 'author'];
const TITLE_MAX_LENGTH = 100;
const TAG_MAX_COUNT = 5;

// Express 5의 req.query는 읽기 전용이라 검증·변환한 값을 req.validatedQuery에 담는다
export const validateGetQuestions = (req, _res, next) => {
  req.validatedQuery = {
    page: readPositiveInteger(req.query, 'page') ?? DEFAULT_PAGE,
    size: readSize(req.query, DEFAULT_SIZE),
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

export const validateQuestionId = validateIdParam('questionId');

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

// 정규화(# 제거, 영문 소문자)한 뒤 중복을 빼고 개수를 센다 (API 명세 3장 POST, 5.1)
const readTags = (tags) => {
  if (tags === undefined || (Array.isArray(tags) && tags.length === 0)) {
    throw new BadRequestError('TAG_REQUIRED', '태그를 하나 이상 입력해주세요.');
  }

  if (!Array.isArray(tags)) {
    throwValidationError('tags는 배열이어야 합니다.');
  }

  const tagNames = tags.map((tag) => {
    if (typeof tag !== 'string') {
      throwValidationError('tags의 항목은 문자열이어야 합니다.');
    }

    const tagName = normalizeTagName(tag);

    if (!isValidTagName(tagName)) {
      throwValidationError(
        `'${tag}' 태그는 1~30자의 한글·영문·숫자·_·-만 사용할 수 있습니다. (공백 불가)`,
      );
    }

    return tagName;
  });
  const uniqueTagNames = [...new Set(tagNames)];

  if (uniqueTagNames.length > TAG_MAX_COUNT) {
    throw new BadRequestError(
      'TAG_LIMIT_EXCEEDED',
      `태그는 ${TAG_MAX_COUNT}개까지 입력할 수 있습니다.`,
    );
  }

  return uniqueTagNames;
};

export const validateCreateQuestion = (req, _res, next) => {
  const body = readBodyObject(req.body);

  req.body = {
    title: readTitle(body.title),
    body: readRichTextBody(body.body),
    tags: readTags(body.tags),
  };

  next();
};

// 보낸 필드만 수정한다 (API 명세 3장 PATCH)
export const validateUpdateQuestion = (req, _res, next) => {
  const body = readBodyObject(req.body);

  if (body.title === undefined && body.body === undefined && body.tags === undefined) {
    throwValidationError('수정할 항목(title, body, tags)을 하나 이상 보내야 합니다.');
  }

  req.body = {
    title: body.title === undefined ? undefined : readTitle(body.title),
    body: body.body === undefined ? undefined : readRichTextBody(body.body),
    tags: body.tags === undefined ? undefined : readTags(body.tags),
    editReason: readEditReason(body.editReason),
  };

  next();
};
