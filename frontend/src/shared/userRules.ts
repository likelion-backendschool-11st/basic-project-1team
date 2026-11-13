/**
 * 회원 입력값 규칙 (API_SPEC 1.8). 회원가입·비밀번호 변경/재설정에서 함께 쓴다.
 */
export const EMAIL_MAX = 128;
export const PASSWORD_MIN = 8;
export const PASSWORD_MAX = 32;
/** 이름·닉네임 최대 길이 */
export const PERSON_NAME_MAX = 16;
export const NICKNAME_MIN = 2;
export const USERNAME_MIN = 4;
export const USERNAME_MAX = 20;

/** 이름·닉네임: 영문·한글만 (공백·숫자·특수문자·이모지 불가) */
const PERSON_NAME_PATTERN = /^[A-Za-z가-힣]+$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
/** 아이디: 영문 소문자·숫자·_ */
const USERNAME_PATTERN = /^[a-z0-9_]+$/;

export const PASSWORD_RULE =
  '비밀번호는 8~32자, 영문·숫자·특수문자 중 2종류 이상을 포함하고, 같은 문자나 연속된 문자(abc, 123)는 2자까지만 쓸 수 있습니다.';
export const PERSON_NAME_RULE = `영문 또는 한글만 사용할 수 있습니다. (최대 ${PERSON_NAME_MAX}자, 공백·숫자·특수문자 불가)`;

export function isValidEmail(value: string): boolean {
  return value.length <= EMAIL_MAX && EMAIL_PATTERN.test(value);
}

export function isValidUsername(value: string): boolean {
  return (
    value.length >= USERNAME_MIN && value.length <= USERNAME_MAX && USERNAME_PATTERN.test(value)
  );
}

export function isValidPersonName(value: string, min = 1): boolean {
  return value.length >= min && value.length <= PERSON_NAME_MAX && PERSON_NAME_PATTERN.test(value);
}

/** 같은 문자 3번 연속(aaa) 또는 1씩 커지거나 작아지는 영문·숫자 3자(abc, cba, 123, 321) */
function hasRunOfThree(value: string): boolean {
  const s = value.toLowerCase();
  for (let i = 0; i + 2 < s.length; i += 1) {
    const [a, b, c] = [s.charCodeAt(i), s.charCodeAt(i + 1), s.charCodeAt(i + 2)];
    if (a === b && b === c) return true;
    const alnum = /[a-z0-9]/.test(s[i]) && /[a-z0-9]/.test(s[i + 1]) && /[a-z0-9]/.test(s[i + 2]);
    const sameKind =
      /\d/.test(s[i]) === /\d/.test(s[i + 1]) && /\d/.test(s[i + 1]) === /\d/.test(s[i + 2]);
    if (alnum && sameKind && b - a === c - b && Math.abs(b - a) === 1) return true;
  }
  return false;
}

export function isValidPassword(value: string): boolean {
  if (value.length < PASSWORD_MIN || value.length > PASSWORD_MAX || /\s/.test(value)) return false;
  const kinds = [/[A-Za-z]/, /\d/, /[^A-Za-z0-9]/].filter((re) => re.test(value)).length;
  return kinds >= 2 && !hasRunOfThree(value);
}
