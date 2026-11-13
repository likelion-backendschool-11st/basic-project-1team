import { BadRequestError } from '../../common/error/http-errors.js';

const throwValidationError = (message) => {
  throw new BadRequestError('VALIDATION_ERROR', message);
};

const readRequiredString = (body, key, { shouldTrim }) => {
  const value = body[key];

  if (typeof value !== 'string') {
    throwValidationError(`${key}를 입력해주세요.`);
  }

  const result = shouldTrim ? value.trim() : value;

  if (result === '') {
    throwValidationError(`${key}를 입력해주세요.`);
  }

  return result;
};

// 로그인은 가입 규칙(API 명세 1.8)으로 검사하지 않는다. 형식이 달라도 401 INVALID_CREDENTIALS로 같게 응답한다
export const validateLogin = (req, _res, next) => {
  const body = req.body ?? {};

  if (typeof body !== 'object' || Array.isArray(body)) {
    throwValidationError('요청 본문은 JSON 객체여야 합니다.');
  }

  const { rememberMe = false } = body;

  if (typeof rememberMe !== 'boolean') {
    throwValidationError('rememberMe는 true 또는 false여야 합니다.');
  }

  req.validatedBody = {
    loginId: readRequiredString(body, 'loginId', { shouldTrim: true }),
    // 비밀번호는 입력한 그대로 비교한다
    password: readRequiredString(body, 'password', { shouldTrim: false }),
    rememberMe,
  };

  next();
};
