import argon2 from 'argon2';
import jwt from 'jsonwebtoken';

import { UnauthorizedError } from '../../common/error/http-errors.js';
import { env } from '../../config/env.js';
import { ATTEMPT_SCOPES, createAttemptLimiter } from '../auth-attempts/auth-attempt.service.js';
import * as userService from '../users/user.service.js';

const JWT_ALGORITHM = 'HS256';
const ONE_DAY_SECONDS = 24 * 60 * 60;
const DEFAULT_EXPIRES_IN = ONE_DAY_SECONDS;
const REMEMBER_ME_EXPIRES_IN = 14 * ONE_DAY_SECONDS;
const POSITIVE_INTEGER_PATTERN = /^[1-9]\d*$/;

let dummyPasswordHash;

// 같은 IP에서 같은 아이디로 5번 틀리면 5분 동안 막는다 (API 명세 1.11)
const loginLimiter = createAttemptLimiter(ATTEMPT_SCOPES.login);

// 없는 아이디도 비밀번호 검증 시간을 똑같이 써서, 응답 시간으로 아이디 존재 여부를 알 수 없게 한다
const getDummyPasswordHash = async () => {
  dummyPasswordHash ??= await argon2.hash('dummy-password-for-timing', { type: argon2.argon2id });

  return dummyPasswordHash;
};

const isPasswordMatched = async (user, password) => {
  if (user === null || user.passwordHash === null) {
    await argon2.verify(await getDummyPasswordHash(), password);
    return false;
  }

  return argon2.verify(user.passwordHash, password);
};

const createAccessToken = (user, expiresIn) =>
  jwt.sign({ role: user.role }, env.jwt.secret, {
    algorithm: JWT_ALGORITHM,
    subject: String(user.id),
    expiresIn,
  });

// 서명·만료가 맞으면 회원 id와 발급 시각(초)을 돌려준다. 아니면 null
const readAccessToken = (token) => {
  try {
    const { sub, iat } = jwt.verify(token, env.jwt.secret, { algorithms: [JWT_ALGORITHM] });

    if (typeof sub !== 'string' || !POSITIVE_INTEGER_PATTERN.test(sub) || !Number.isInteger(iat)) {
      return null;
    }

    return { userId: Number(sub), issuedAtSeconds: iat };
  } catch {
    return null;
  }
};

// 비밀번호를 바꾸기 전에 발급된 토큰인지 (API 명세 1.2). iat가 초 단위라 바꾼 시각도 초로 내려 비교해,
// 비밀번호를 바꾼 같은 초에 다시 로그인한 토큰은 통과시킨다
const isIssuedBeforePasswordChange = (issuedAtSeconds, passwordChangedAt) =>
  passwordChangedAt !== null && issuedAtSeconds < Math.floor(passwordChangedAt.getTime() / 1000);

const throwInvalidToken = () => {
  throw new UnauthorizedError('UNAUTHORIZED', '로그인 정보가 만료되었거나 올바르지 않습니다.');
};

export const login = async ({ loginId, password, rememberMe, clientIp }) => {
  let user = null;
  const matched = await loginLimiter.attempt(`${clientIp}|${loginId}`, async () => {
    user = await userService.findUserForLogin(loginId);

    return isPasswordMatched(user, password);
  });

  // 아이디가 없는 경우와 비밀번호가 틀린 경우를 구분하지 않는다 (API 명세 2장 로그인)
  if (!matched) {
    throw new UnauthorizedError('INVALID_CREDENTIALS', '아이디 또는 비밀번호가 올바르지 않습니다.');
  }

  // 정지 여부는 비밀번호가 맞을 때만 알려 준다
  const sanctions = await userService.findActiveSanctionsByUserId(user.id);
  userService.assertNotSanctioned(sanctions, ['suspend']);

  const expiresIn = rememberMe ? REMEMBER_ME_EXPIRES_IN : DEFAULT_EXPIRES_IN;

  return {
    accessToken: createAccessToken(user, expiresIn),
    expiresIn,
    user: { id: user.id, username: user.username, nickname: user.nickname, role: user.role },
  };
};

/**
 * 토큰을 검증하고 DB에서 회원 정보를 다시 읽는다.
 * 만료·위조이거나, 탈퇴·없는 회원이거나, 비밀번호를 바꾸기 전에 발급된 토큰이면 401.
 */
export const authenticateAccessToken = async (token) => {
  const payload = readAccessToken(token);
  const user = payload === null ? null : await userService.findAuthUserById(payload.userId);

  if (user === null) {
    throwInvalidToken();
  }

  // 바꾼 시각은 판단에만 쓰고 req.user 에는 넣지 않는다
  const { passwordChangedAt, ...authUser } = user;

  if (isIssuedBeforePasswordChange(payload.issuedAtSeconds, passwordChangedAt)) {
    throwInvalidToken();
  }

  return authUser;
};
