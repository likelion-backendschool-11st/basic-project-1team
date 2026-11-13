import jwt from 'jsonwebtoken';

import { env } from '../../config/env.js';
import { pool } from '../../config/database.js';
import { UnauthorizedError } from '../error/http-errors.js';

/*
 * JWT 인증 미들웨어 (API_SPEC 1.2).
 * 회원/인증 담당(#46)의 users 모듈이 develop 에 들어오면 회원 조회 부분을 그 모듈의 Service 로 바꾼다.
 * 다른 모듈은 아래 req.user 모양에만 의존한다.
 *
 * req.user = {
 *   id: number,
 *   role: 'USER' | 'ADMIN',
 *   permissions: string[],                                  // 예: ['content_manage']
 *   sanctions: { type: 'suspend' | 'write_ban' | 'comment_ban', endsAt: Date | null }[],  // 걸려 있는 제재만
 * }
 */

const BEARER_PREFIX = 'Bearer ';

const extractToken = (req) => {
  const header = req.get('Authorization');

  if (header === undefined || !header.startsWith(BEARER_PREFIX)) {
    return null;
  }

  return header.slice(BEARER_PREFIX.length).trim() || null;
};

const verifyToken = (token) => {
  try {
    return jwt.verify(token, env.jwtSecret, { algorithms: ['HS256'] });
  } catch {
    throw new UnauthorizedError('UNAUTHORIZED', '로그인이 만료되었거나 올바르지 않습니다.');
  }
};

// TODO: users 모듈의 Service 로 교체 (#46)
const findAuthUserById = async (userId) => {
  const [users] = await pool.query(
    "SELECT id, role FROM users WHERE id = ? AND status = 'active'",
    [userId],
  );

  if (users.length === 0) {
    return null;
  }

  const [[permissions], [sanctions]] = await Promise.all([
    pool.query("SELECT permission FROM user_permissions WHERE user_id = ? AND status = 'active'", [
      userId,
    ]),
    pool.query(
      `SELECT type, ends_at FROM user_sanctions
        WHERE user_id = ? AND released_at IS NULL AND (ends_at IS NULL OR ends_at > NOW(3))`,
      [userId],
    ),
  ]);

  return {
    id: Number(users[0].id),
    role: users[0].role,
    permissions: permissions.map((row) => row.permission),
    sanctions: sanctions.map((row) => ({ type: row.type, endsAt: row.ends_at })),
  };
};

const authenticate = async (token) => {
  const payload = verifyToken(token);
  const userId = Number(payload.sub);

  // 토큰이 유효해도 탈퇴했거나 없는 회원이면 401 (매 요청 DB 기준으로 판단)
  const user = Number.isSafeInteger(userId) ? await findAuthUserById(userId) : null;

  if (user === null) {
    throw new UnauthorizedError('UNAUTHORIZED', '로그인이 필요합니다.');
  }

  return user;
};

/** 인증 필수. 토큰이 없거나 올바르지 않으면 401 */
export const authMiddleware = async (req, _res, next) => {
  const token = extractToken(req);

  if (token === null) {
    throw new UnauthorizedError();
  }

  req.user = await authenticate(token);
  next();
};

/** 인증 선택. 토큰이 없으면 비회원(req.user = null), 있는데 올바르지 않으면 401 */
export const optionalAuthMiddleware = async (req, _res, next) => {
  const token = extractToken(req);

  req.user = token === null ? null : await authenticate(token);
  next();
};
