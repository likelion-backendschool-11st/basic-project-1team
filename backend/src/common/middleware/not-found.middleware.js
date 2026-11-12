import { NotFoundError } from '../error/http-errors.js';

export const notFoundHandler = (req, _res) => {
  throw new NotFoundError('ROUTE_NOT_FOUND', `${req.method} ${req.path} 경로를 찾을 수 없습니다.`);
};
