import { readPageQuery, validateIdParam } from '../../common/utils/validation.js';

// 사용자 공지 목록은 기본 10개, 헤더 롤링은 size=5 (API 명세 9장)
const DEFAULT_SIZE = 10;

export const validateNoticeId = validateIdParam('noticeId');

// Express 5의 req.query는 읽기 전용이라 검증·변환한 값을 req.validatedQuery에 담는다
export const validateGetNotices = (req, _res, next) => {
  req.validatedQuery = readPageQuery(req.query, DEFAULT_SIZE);

  next();
};
