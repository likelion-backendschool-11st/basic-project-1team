/**
 * 태그 이름 규칙 (API_SPEC §5.1). 질문 태그 입력과 관리자 태그 관리에서 함께 쓴다.
 * 한글 입력 중에는 자모가 먼저 들어오므로 자모도 허용한다.
 */
export const TAG_NAME_MAX = 30;
export const TAG_NAME_RULE =
  '태그는 1~30자의 한글, 영문, 숫자, _, - 만 사용할 수 있습니다. (공백 불가)';

const VALID_TAG_NAME = /^[가-힣ㄱ-ㅎㅏ-ㅣa-z0-9_-]{1,30}$/;
const DISALLOWED_CHARS = /[^가-힣ㄱ-ㅎㅏ-ㅣa-z0-9_-]/g;

/** 앞의 `#` 과 앞뒤 공백을 지우고 영문은 소문자로 바꾼다. */
export function normalizeTagName(raw: string): string {
  return raw.trim().replace(/^#/, '').trim().toLowerCase();
}

export function isValidTagName(name: string): boolean {
  return VALID_TAG_NAME.test(name);
}

/** 입력하는 동안 허용되지 않는 문자를 바로 지운다. */
export function stripInvalidTagChars(raw: string): string {
  return raw.toLowerCase().replace(DISALLOWED_CHARS, '').slice(0, TAG_NAME_MAX);
}
