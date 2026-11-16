import { readPageQuery } from '../../common/utils/validation.js';

const DEFAULT_SIZE = 20;

// Express 5의 req.query는 읽기 전용이라 검증·변환한 값을 req.validatedQuery에 담는다
export const validateGetMyPointHistories = (req, _res, next) => {
  req.validatedQuery = readPageQuery(req.query, DEFAULT_SIZE);

  next();
};
