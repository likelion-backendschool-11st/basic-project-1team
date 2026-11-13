// 회원 입력값 형식 규칙 (API 명세 1.8). 비밀번호 재설정·변경, 회원가입에서 함께 쓴다.
// 프론트엔드 frontend/src/shared/userRules.ts 와 같은 규칙이다.

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
