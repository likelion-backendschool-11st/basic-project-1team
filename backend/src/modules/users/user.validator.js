import { readBodyObject, throwValidationError } from '../../common/utils/validation.js';

// 회원 입력값 형식 규칙 (API 명세 1.8). 비밀번호 재설정·변경, 회원가입에서 함께 쓴다.
// 프론트엔드 frontend/src/shared/userRules.ts 와 같은 규칙이다.

// 이름·닉네임: 영문·한글만 (공백·숫자·특수문자·이모지 불가)
const PERSON_NAME_PATTERN = /^[A-Za-z가-힣]+$/;
const USERNAME_PATTERN = /^[a-z0-9_]+$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// 길이 규칙을 먼저 보고, 맞으면 형식 규칙을 본다. 어긋나면 메시지, 맞으면 null을 돌려주는 함수를 만든다
const createRuleChecker =
  ({ subject, minLength, maxLength, pattern, patternMessage }) =>
  (value) => {
    if (value.length < minLength || value.length > maxLength) {
      return minLength === 1
        ? `${subject} ${maxLength}자 이하여야 합니다.`
        : `${subject} ${minLength}~${maxLength}자여야 합니다.`;
    }

    return pattern.test(value) ? null : patternMessage;
  };

/** 이름 규칙에 어긋나면 메시지, 맞으면 null */
export const findNameRuleViolation = createRuleChecker({
  subject: '이름은',
  minLength: 1,
  maxLength: 16,
  pattern: PERSON_NAME_PATTERN,
  patternMessage: '이름은 영문·한글만 쓸 수 있습니다. (공백·숫자·특수문자 불가)',
});

/** 아이디 규칙에 어긋나면 메시지, 맞으면 null */
export const findUsernameRuleViolation = createRuleChecker({
  subject: '아이디는',
  minLength: 4,
  maxLength: 20,
  pattern: USERNAME_PATTERN,
  patternMessage: '아이디는 영문 소문자·숫자·_만 쓸 수 있습니다.',
});

/** 닉네임 규칙에 어긋나면 메시지, 맞으면 null */
export const findNicknameRuleViolation = createRuleChecker({
  subject: '닉네임은',
  minLength: 2,
  maxLength: 16,
  pattern: PERSON_NAME_PATTERN,
  patternMessage: '닉네임은 영문·한글만 쓸 수 있습니다. (공백·숫자·특수문자 불가)',
});

/** 이메일 규칙에 어긋나면 메시지, 맞으면 null */
export const findEmailRuleViolation = createRuleChecker({
  subject: '이메일은',
  minLength: 1,
  maxLength: 128,
  pattern: EMAIL_PATTERN,
  patternMessage: '이메일 형식이 올바르지 않습니다.',
});

const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_MAX_LENGTH = 32;
const PASSWORD_CHARACTER_KINDS = [/[A-Za-z]/, /\d/, /[^A-Za-z0-9]/];
const PASSWORD_MIN_CHARACTER_KINDS = 2;

const isAlphanumeric = (character) => /[a-z0-9]/.test(character);
const isDigit = (character) => /\d/.test(character);

// 같은 문자 3번 연속(aaa), 또는 1씩 커지거나 작아지는 같은 종류 영문·숫자 3자(abc, cba, 123, 321)
const hasRunOfThree = (password) => {
  const lowered = password.toLowerCase();

  for (let index = 0; index + 2 < lowered.length; index += 1) {
    const characters = [lowered[index], lowered[index + 1], lowered[index + 2]];
    const [first, second, third] = characters.map((character) => character.charCodeAt(0));

    if (first === second && second === third) {
      return true;
    }

    const isSameKindAlphanumeric =
      characters.every(isAlphanumeric) &&
      characters.every((character) => isDigit(character) === isDigit(characters[0]));
    const step = second - first;

    if (isSameKindAlphanumeric && Math.abs(step) === 1 && third - second === step) {
      return true;
    }
  }

  return false;
};

/** 비밀번호 규칙에 어긋나면 어긋난 규칙을 설명하는 메시지, 맞으면 null */
export const findPasswordRuleViolation = (password) => {
  if (password.length < PASSWORD_MIN_LENGTH || password.length > PASSWORD_MAX_LENGTH) {
    return `비밀번호는 ${PASSWORD_MIN_LENGTH}~${PASSWORD_MAX_LENGTH}자여야 합니다.`;
  }

  if (/\s/.test(password)) {
    return '비밀번호에는 공백을 쓸 수 없습니다.';
  }

  const kindCount = PASSWORD_CHARACTER_KINDS.filter((pattern) => pattern.test(password)).length;

  if (kindCount < PASSWORD_MIN_CHARACTER_KINDS) {
    return '비밀번호는 영문·숫자·특수문자 중 2종류 이상을 포함해야 합니다.';
  }

  if (hasRunOfThree(password)) {
    return '비밀번호에 같은 문자나 연속된 문자(abc, 123)는 2자까지만 쓸 수 있습니다.';
  }

  return null;
};

const AVAILABILITY_RULES = {
  username: findUsernameRuleViolation,
  nickname: findNicknameRuleViolation,
  email: findEmailRuleViolation,
};

// 아이디·닉네임·이메일 중 하나만 받는다 (API 명세 2장 중복 확인)
export const validateGetAvailability = (req, _res, next) => {
  const fields = Object.keys(AVAILABILITY_RULES).filter((key) => req.query[key] !== undefined);

  if (fields.length !== 1) {
    throwValidationError('username, nickname, email 중 하나만 보내주세요.');
  }

  const [field] = fields;
  const rawValue = req.query[field];

  if (typeof rawValue !== 'string') {
    throwValidationError(`${field}는 하나만 보내주세요.`);
  }

  const value = rawValue.trim();

  if (value === '') {
    throwValidationError(`${field}를 입력해주세요.`);
  }

  const violation = AVAILABILITY_RULES[field](value);

  if (violation !== null) {
    throwValidationError(violation);
  }

  req.validatedQuery = { field, value };

  next();
};

const readRequiredPassword = (body, key) => {
  const value = body[key];

  if (typeof value !== 'string' || value === '') {
    throwValidationError(`${key}를 입력해주세요.`);
  }

  return value;
};

// 비밀번호는 입력한 그대로 쓴다(trim 하지 않음). 현재 비밀번호는 저장된 해시와 비교만 하므로 규칙으로 검사하지 않는다
export const validateChangePassword = (req, _res, next) => {
  const body = readBodyObject(req.body);
  const currentPassword = readRequiredPassword(body, 'currentPassword');
  const newPassword = readRequiredPassword(body, 'newPassword');
  const violation = findPasswordRuleViolation(newPassword);

  if (violation !== null) {
    throwValidationError(violation);
  }

  req.body = { currentPassword, newPassword };

  next();
};

// 탈퇴 안내에 동의(agreed: true)해야 탈퇴한다 (API 명세 2장 회원 탈퇴)
export const validateWithdrawUser = (req, _res, next) => {
  const body = readBodyObject(req.body);

  if (body.agreed !== true) {
    throwValidationError('탈퇴 안내 사항에 동의해주세요.');
  }

  req.body = { agreed: true };

  next();
};
