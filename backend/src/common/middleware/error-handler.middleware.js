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

  // express.json()의 크기 제한을 넘은 요청. 본문 길이 규칙 위반과 같은 코드로 응답한다 (API 명세 1.9)
  if (err.type === 'entity.too.large') {
    return res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: '요청 본문이 너무 큽니다.' },
    });
  }

  // 서비스에서 따로 처리하지 않은 고유 키 중복. 같은 요청이 동시에 들어와 먼저 들어간 쪽이 있는 경우다
  if (err.code === 'ER_DUP_ENTRY') {
    logger.warn(err);

    return res.status(409).json({
      success: false,
      error: { code: 'CONFLICT', message: '이미 존재하는 리소스입니다.' },
    });
  }

  logger.error(err);

  return res.status(500).json({
    success: false,
    error: { code: 'INTERNAL_SERVER_ERROR', message: '서버 오류가 발생했습니다.' },
  });
};
