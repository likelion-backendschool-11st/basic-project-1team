import { ForbiddenError, UnauthorizedError } from '../error/http-errors.js';
import * as authService from '../../modules/auth/auth.service.js';
import * as userService from '../../modules/users/user.service.js';

const BEARER_PATTERN = /^Bearer\s+(\S+)$/i;

/** Authorization 헤더가 없으면 undefined, 형식이 틀리면 401 */
const readBearerToken = (req) => {
  const header = req.get('Authorization');

  if (header === undefined) {
    return undefined;
  }

  const matched = BEARER_PATTERN.exec(header);

  if (matched === null) {
    throw new UnauthorizedError('UNAUTHORIZED', '로그인 정보가 만료되었거나 올바르지 않습니다.');
  }

  return matched[1];
};

/**
 * 인증 `필수` API. 토큰을 검증하고 DB에서 다시 읽은 회원 정보를 req.user에 담는다.
 * req.user = { id, username, nickname, role, permissions: string[], sanctions: { type, endsAt }[] }
 */
export const authMiddleware = async (req, _res, next) => {
  const token = readBearerToken(req);

  if (token === undefined) {
    throw new UnauthorizedError('UNAUTHORIZED', '로그인이 필요합니다.');
  }

  req.user = await authService.authenticateAccessToken(token);

  next();
};

/**
 * 인증 `선택` API. 토큰이 없으면 req.user = null(비회원)로 진행한다.
 * 토큰을 보냈는데 만료·위조면 401로 응답해 프론트엔드가 토큰을 지우게 한다 (API 명세 1.2).
 */
export const optionalAuthMiddleware = async (req, _res, next) => {
  const token = readBearerToken(req);

  req.user = token === undefined ? null : await authService.authenticateAccessToken(token);

  next();
};

/** 인증 `ADMIN` API. authMiddleware 뒤에 둔다. 권한은 토큰이 아니라 DB 값으로 판단한다. */
export const adminMiddleware = (req, _res, next) => {
  if (req.user?.role !== 'ADMIN') {
    throw new ForbiddenError('FORBIDDEN', '관리자 권한이 필요합니다.');
  }

  next();
};

/**
 * 걸려 있는 제재로 막을 API에 둔다. authMiddleware 뒤에 둔다. (API 명세 1.2 제재)
 * 예: 질문·답변·게시글 작성·수정은 sanctionMiddleware('suspend', 'write_ban'),
 *     댓글 작성은 sanctionMiddleware('suspend', 'comment_ban'), 그 밖의 쓰기 API는 sanctionMiddleware('suspend')
 */
export const sanctionMiddleware =
  (...types) =>
  (req, _res, next) => {
    userService.assertNotSanctioned(req.user.sanctions, types);

    next();
  };
