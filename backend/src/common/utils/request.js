import { BadRequestError } from '../error/http-errors.js';

/*
 * 요청 값 공통 파싱 (API_SPEC 1.5).
 * Express 5 의 req.query 는 읽기 전용이라 가공한 값은 반환값으로만 쓴다.
 */

const MAX_PAGE_SIZE = 100;

const isPositiveIntegerString = (value) => typeof value === 'string' && /^[1-9]\d*$/.test(value);

/** 숫자 id (경로 파라미터 등). 양의 정수가 아니면 400 */
export const parseId = (value, name) => {
  const id = Number(value);

  if (!isPositiveIntegerString(value) || !Number.isSafeInteger(id)) {
    throw new BadRequestError('VALIDATION_ERROR', `${name}는 1 이상의 정수여야 합니다.`);
  }

  return id;
};

/** 값이 없으면 null, 있으면 parseId */
export const parseOptionalId = (value, name) =>
  value === undefined || value === '' ? null : parseId(value, name);

/** page, size 를 숫자로 바꾸고 DB 조회용 limit, offset 을 함께 돌려준다 */
export const parsePagination = (query, defaultSize = 20) => {
  const page = query.page === undefined ? 1 : parseId(query.page, 'page');
  const size = query.size === undefined ? defaultSize : parseId(query.size, 'size');

  if (size > MAX_PAGE_SIZE) {
    throw new BadRequestError('VALIDATION_ERROR', `size는 최대 ${MAX_PAGE_SIZE}입니다.`);
  }

  return { page, size, limit: size, offset: (page - 1) * size };
};

/** 검색어. 앞뒤 공백을 지우고 빈 값이면 null */
export const parseKeyword = (value) => {
  if (typeof value !== 'string') {
    return null;
  }

  const keyword = value.trim();

  return keyword === '' ? null : keyword;
};

/** SQL LIKE 패턴에서 %, _, \ 를 글자 그대로 찾도록 이스케이프 */
export const escapeLike = (value) => value.replace(/[\\%_]/g, (char) => `\\${char}`);
