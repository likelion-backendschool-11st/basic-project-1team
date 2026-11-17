import { countCharacters } from '../../common/utils/html.js';
import {
  readBodyObject,
  readPageQuery,
  readRichTextBody,
  throwValidationError,
  validateIdParam,
} from '../../common/utils/validation.js';

const TITLE_MAX_LENGTH = 100;

export const validateNoticeId = validateIdParam('noticeId');

// Express 5의 req.query는 읽기 전용이라 검증·변환한 값을 req.validatedQuery에 담는다
export const validateGetNotices = (req, _res, next) => {
  req.validatedQuery = readPageQuery(req.query);

  next();
};

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

const readIsPinned = (isPinned) => {
  if (typeof isPinned !== 'boolean') {
    throwValidationError('isPinned는 true 또는 false여야 합니다.');
  }

  return isPinned;
};

// isPinned는 선택, 기본 false (API 명세 10.7 POST)
export const validateCreateNotice = (req, _res, next) => {
  const body = readBodyObject(req.body);

  req.body = {
    title: readTitle(body.title),
    body: readRichTextBody(body.body),
    isPinned: body.isPinned === undefined ? false : readIsPinned(body.isPinned),
  };

  next();
};

// 보낸 필드만 수정한다 (API 명세 10.7 PATCH)
export const validateUpdateNotice = (req, _res, next) => {
  const body = readBodyObject(req.body);

  if (body.title === undefined && body.body === undefined && body.isPinned === undefined) {
    throwValidationError('수정할 항목(title, body, isPinned)을 하나 이상 보내야 합니다.');
  }

  req.body = {
    title: body.title === undefined ? undefined : readTitle(body.title),
    body: body.body === undefined ? undefined : readRichTextBody(body.body),
    isPinned: body.isPinned === undefined ? undefined : readIsPinned(body.isPinned),
  };

  next();
};
