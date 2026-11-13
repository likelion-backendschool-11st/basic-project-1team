import { readEnum, readSearchText, readSize } from '../../common/utils/validation.js';

const DEFAULT_SIZE = 10;
const SORTS = ['popular', 'name'];

// Express 5의 req.query는 읽기 전용이라 검증·변환한 값을 req.validatedQuery에 담는다
export const validateGetTags = (req, _res, next) => {
  req.validatedQuery = {
    keyword: readSearchText(req.query, 'keyword'),
    sort: readEnum(req.query, 'sort', SORTS, 'popular'),
    size: readSize(req.query, DEFAULT_SIZE),
  };

  next();
};
