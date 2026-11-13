import { ForbiddenError, UnauthorizedError } from '../../common/error/http-errors.js';

const ADMIN_ROLE = 'ADMIN';

/**
 * 관리자 API 접근 제어 (REQ-ADMIN-001, #55).
 * 인증 미들웨어가 DB에서 다시 읽어 채운 req.user 를 기준으로 판단한다.
 * 토큰의 role 은 권한 변경이 바로 반영되지 않으므로 쓰지 않는다 (API_SPEC 1.2).
 */
export const adminOnly = (req, _res, next) => {
  // 인증 미들웨어보다 먼저 등록되는 실수를 막기 위해 req.user 가 없으면 401 로 처리한다
  if (!req.user) {
    throw new UnauthorizedError();
  }

  if (req.user.role !== ADMIN_ROLE) {
    throw new ForbiddenError('FORBIDDEN', '관리자만 접근할 수 있습니다.');
  }

  next();
};
