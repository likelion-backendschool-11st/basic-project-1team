import { countCharacters } from '../../common/utils/html.js';
import {
  readBodyObject,
  readPositiveInteger,
  readSize,
  throwValidationError,
  validateIdParam,
} from '../../common/utils/validation.js';

const DEFAULT_PAGE = 1;
const DEFAULT_SIZE = 20;
const BODY_MAX_LENGTH = 500;

export const validatePostId = validateIdParam('postId');
export const validateCommentId = validateIdParam('commentId');

// Express 5의 req.query는 읽기 전용이라 검증·변환한 값을 req.validatedQuery에 담는다
export const validateGetComments = (req, _res, next) => {
  req.validatedQuery = {
    page: readPositiveInteger(req.query, 'page') ?? DEFAULT_PAGE,
    size: readSize(req.query, DEFAULT_SIZE),
  };

  next();
};

// 댓글은 에디터 없는 일반 텍스트, 1~500자 (API 명세 1.9, 7장)
export const validateCreateComment = (req, _res, next) => {
  const { body } = readBodyObject(req.body);

  if (typeof body !== 'string') {
    throwValidationError('body는 문자열이어야 합니다.');
  }

  const trimmedBody = body.trim();
  const length = countCharacters(trimmedBody);

  if (length < 1 || length > BODY_MAX_LENGTH) {
    throwValidationError(`body는 1~${BODY_MAX_LENGTH}자여야 합니다.`);
  }

  req.body = { body: trimmedBody };

  next();
};
