import { BadRequestError } from '../../common/error/http-errors.js';

const TITLE_MAX_LENGTH = 80;
// 저장 HTML 최대 길이 (API_SPEC 1.9). 정리(sanitize) 전 원본도 이 길이로 먼저 막는다
export const BODY_HTML_MAX_LENGTH = 100_000;

const validateTitle = (title) => {
  if (typeof title !== 'string') {
    throw new BadRequestError('VALIDATION_ERROR', '제목을 입력해주세요.');
  }

  const length = [...title.trim()].length;

  if (length < 1 || length > TITLE_MAX_LENGTH) {
    throw new BadRequestError('VALIDATION_ERROR', `제목은 1~${TITLE_MAX_LENGTH}자로 입력해주세요.`);
  }
};

const validateBody = (body) => {
  if (typeof body !== 'string') {
    throw new BadRequestError('VALIDATION_ERROR', '본문을 입력해주세요.');
  }

  if (body.length > BODY_HTML_MAX_LENGTH) {
    throw new BadRequestError(
      'VALIDATION_ERROR',
      `본문 HTML은 최대 ${BODY_HTML_MAX_LENGTH.toLocaleString('ko-KR')}자입니다.`,
    );
  }
};

const getRequestBody = (req) => {
  if (req.body === null || typeof req.body !== 'object' || Array.isArray(req.body)) {
    throw new BadRequestError('VALIDATION_ERROR', '요청 본문이 올바르지 않습니다.');
  }

  return req.body;
};

export const validateCreatePost = (req, _res, next) => {
  const { title, body } = getRequestBody(req);

  validateTitle(title);
  validateBody(body);
  next();
};

/** 보낸 필드만 수정한다. 하나도 없으면 400 */
export const validateUpdatePost = (req, _res, next) => {
  const { title, body } = getRequestBody(req);

  if (title === undefined && body === undefined) {
    throw new BadRequestError('VALIDATION_ERROR', '수정할 제목이나 본문을 보내주세요.');
  }

  if (title !== undefined) {
    validateTitle(title);
  }

  if (body !== undefined) {
    validateBody(body);
  }

  next();
};
