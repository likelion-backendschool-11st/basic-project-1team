// LIKE 검색어의 \·%·_를 글자 그대로 찾도록 escape 한다 (MySQL 기본 escape 문자는 \)
export const escapeLikePattern = (value) => value.replace(/[\\%_]/g, '\\$&');
