// TODO: #46 로그인 인증 구현이 들어오면 이 임시 미들웨어를 그 구현으로 교체한다 (#46)
// 다른 module은 authMiddleware가 req.user = { id, role }을 넣어 준다는 것만 사용한다.
import jwt from 'jsonwebtoken';

import { getExecutor } from '../../config/database.js';
import { env } from '../../config/env.js';
import { UnauthorizedError } from '../error/http-errors.js';

const BEARER_PREFIX = 'Bearer ';

const readUserId = (authorization) => {
  if (authorization === undefined || !authorization.startsWith(BEARER_PREFIX)) {
    throw new UnauthorizedError();
  }

  let payload;

  try {
    payload = jwt.verify(authorization.slice(BEARER_PREFIX.length), env.jwtSecret, {
      algorithms: ['HS256'],
    });
  } catch {
    throw new UnauthorizedError();
  }

  const userId = Number(payload.sub);

  if (!Number.isSafeInteger(userId) || userId < 1) {
    throw new UnauthorizedError();
  }

  return userId;
};

// 정지·탈퇴·권한 변경을 토큰 만료 전에도 바로 적용하려고 매 요청 DB에서 회원을 다시 확인한다 (API 명세 1.2)
export const authMiddleware = async (req, _res, next) => {
  const userId = readUserId(req.headers.authorization);

  const [rows] = await getExecutor().query('SELECT id, role, status FROM users WHERE id = ?', [
    userId,
  ]);
  const user = rows[0];

  if (user === undefined || user.status !== 'active') {
    throw new UnauthorizedError();
  }

  req.user = { id: user.id, role: user.role };
  next();
};
