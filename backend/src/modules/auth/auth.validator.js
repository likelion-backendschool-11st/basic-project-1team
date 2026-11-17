import { BadRequestError } from '../../common/error/http-errors.js';
import {
  findEmailRuleViolation,
  findNameRuleViolation,
  findNicknameRuleViolation,
  findPasswordRuleViolation,
  findUsernameRuleViolation,
} from '../users/user.validator.js';

const throwValidationError = (message) => {
  throw new BadRequestError('VALIDATION_ERROR', message);
};

const readBodyObject = (req) => {
  const body = req.body ?? {};

  if (typeof body !== 'object' || Array.isArray(body)) {
    throwValidationError('요청 본문은 JSON 객체여야 합니다.');
  }

  return body;
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
  const body = readBodyObject(req);
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

// 이름·이메일 형식이 달라도 일치하는 회원이 없을 뿐이므로 404 USER_NOT_FOUND로 응답한다
export const validateFindUsername = (req, _res, next) => {
  const body = readBodyObject(req);

  req.validatedBody = {
    name: readRequiredString(body, 'name', { shouldTrim: true }),
    email: readRequiredString(body, 'email', { shouldTrim: true }),
  };

  next();
};

export const validateVerifyPasswordReset = (req, _res, next) => {
  const body = readBodyObject(req);

  req.validatedBody = {
    username: readRequiredString(body, 'username', { shouldTrim: true }),
    email: readRequiredString(body, 'email', { shouldTrim: true }),
  };

  next();
};

export const validateResetPassword = (req, _res, next) => {
  const body = readBodyObject(req);
  const newPassword = readRequiredString(body, 'newPassword', { shouldTrim: false });
  const violation = findPasswordRuleViolation(newPassword);

  if (violation !== null) {
    throwValidationError(violation);
  }

  req.validatedBody = {
    resetToken: readRequiredString(body, 'resetToken', { shouldTrim: true }),
    newPassword,
  };

  next();
};

const SIGNUP_RULES = {
  name: findNameRuleViolation,
  username: findUsernameRuleViolation,
  nickname: findNicknameRuleViolation,
  email: findEmailRuleViolation,
};

// 비밀번호 확인 일치 여부는 프론트엔드에서만 검사한다 (API 명세 2장 회원가입)
export const validateSignup = (req, _res, next) => {
  const body = readBodyObject(req);
  const signup = {};

  for (const [key, findRuleViolation] of Object.entries(SIGNUP_RULES)) {
    signup[key] = readRequiredString(body, key, { shouldTrim: true });
    const violation = findRuleViolation(signup[key]);

    if (violation !== null) {
      throwValidationError(violation);
    }
  }

  const password = readRequiredString(body, 'password', { shouldTrim: false });
  const passwordViolation = findPasswordRuleViolation(password);

  if (passwordViolation !== null) {
    throwValidationError(passwordViolation);
  }

  req.body = { ...signup, password };

  next();
};
