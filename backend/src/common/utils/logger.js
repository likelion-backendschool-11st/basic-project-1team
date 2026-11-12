/* eslint-disable no-console -- 로거 라이브러리 도입 전까지 console을 이 파일에서만 사용한다. */
export const logger = {
  info: (...args) => console.info(...args),
  warn: (...args) => console.warn(...args),
  error: (...args) => console.error(...args),
};
