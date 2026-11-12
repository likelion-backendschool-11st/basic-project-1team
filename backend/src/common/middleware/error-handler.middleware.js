import { AppError } from '../error/http-errors.js';
import { logger } from '../utils/logger.js';

export const errorHandler = (err, req, res, _next) => {
  if (err instanceof AppError) {
    return res.status(err.status).json({
      success: false,
      error: { code: err.code, message: err.message },
    });
  }

  // express.json()이 잘못된 JSON 본문에 대해 던지는 에러
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({
      success: false,
      error: { code: 'INVALID_JSON', message: '요청 본문이 올바른 JSON 형식이 아닙니다.' },
    });
  }

  logger.error(err);

  return res.status(500).json({
    success: false,
    error: { code: 'INTERNAL_SERVER_ERROR', message: '서버 오류가 발생했습니다.' },
  });
};
