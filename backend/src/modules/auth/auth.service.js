import argon2 from 'argon2';
import jwt from 'jsonwebtoken';

import { UnauthorizedError } from '../../common/error/http-errors.js';
import { env } from '../../config/env.js';
import * as userService from '../users/user.service.js';

const JWT_ALGORITHM = 'HS256';
const ONE_DAY_SECONDS = 24 * 60 * 60;
const DEFAULT_EXPIRES_IN = ONE_DAY_SECONDS;
const REMEMBER_ME_EXPIRES_IN = 14 * ONE_DAY_SECONDS;
const POSITIVE_INTEGER_PATTERN = /^[1-9]\d*$/;

let dummyPasswordHash;

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

const findUserIdInToken = (token) => {
  try {
    const { sub } = jwt.verify(token, env.jwt.secret, { algorithms: [JWT_ALGORITHM] });

    return typeof sub === 'string' && POSITIVE_INTEGER_PATTERN.test(sub) ? Number(sub) : null;
  } catch {
    return null;
  }
};

export const login = async ({ loginId, password, rememberMe }) => {
  const user = await userService.findUserForLogin(loginId);

  // 아이디가 없는 경우와 비밀번호가 틀린 경우를 구분하지 않는다 (API 명세 2장 로그인)
  if (!(await isPasswordMatched(user, password))) {
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

/** 토큰을 검증하고 DB에서 회원 정보를 다시 읽는다. 만료·위조이거나 탈퇴·없는 회원이면 401. */
export const authenticateAccessToken = async (token) => {
  const userId = findUserIdInToken(token);
  const user = userId === null ? null : await userService.findAuthUserById(userId);

  if (user === null) {
    throw new UnauthorizedError('UNAUTHORIZED', '로그인 정보가 만료되었거나 올바르지 않습니다.');
  }

  return user;
};
