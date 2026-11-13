// 태그 이름 규칙 (API 명세 5.1): 1~30자, 한글·영문·숫자·_·- 만, 공백 불가
const TAG_NAME_PATTERN = /^[\p{Script=Hangul}A-Za-z0-9_-]{1,30}$/u;

// 앞뒤 공백과 앞의 #을 지우고 영문은 소문자로 바꾼다. 정규화한 이름이 같으면 같은 태그다
export const normalizeTagName = (name) => name.trim().replace(/^#+/, '').trim().toLowerCase();

export const isValidTagName = (name) => TAG_NAME_PATTERN.test(name);
