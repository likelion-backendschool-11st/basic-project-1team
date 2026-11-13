import crypto from 'node:crypto';

import argon2 from 'argon2';

import { BadRequestError, ForbiddenError, NotFoundError } from '../../common/error/http-errors.js';
import { withTransaction } from '../../config/database.js';

import * as userRepository from './user.repository.js';

// 이용 정지가 가장 먼저 걸리도록 우선순위 순서로 둔다
const SANCTION_ERRORS = {
  suspend: { code: 'USER_SUSPENDED', label: '이용이 정지된' },
  write_ban: { code: 'WRITE_BANNED', label: '글쓰기가 제한된' },
  comment_ban: { code: 'COMMENT_BANNED', label: '댓글 작성이 제한된' },
};

// 회원은 한국 사용자이므로 해제일은 한국 날짜로 안내한다
const seoulDateFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Asia/Seoul',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

const toSanction = (row) => ({ type: row.type, endsAt: row.ends_at });

const buildSanctionMessage = ({ type, endsAt }) => {
  const { label } = SANCTION_ERRORS[type];

  if (endsAt === null) {
    return type === 'suspend' ? '영구 정지된 계정입니다.' : `영구히 ${label} 계정입니다.`;
  }

  return `${seoulDateFormatter.format(endsAt)}까지 ${label} 계정입니다.`;
};

// 같은 종류가 여러 개면 가장 늦게 풀리는 제재로 안내한다 (영구가 가장 늦다)
const findLongestSanction = (sanctions) =>
  sanctions.reduce((longest, sanction) => {
    if (longest.endsAt === null || sanction.endsAt === null) {
      return longest.endsAt === null ? longest : sanction;
    }

    return sanction.endsAt > longest.endsAt ? sanction : longest;
  });

/** 로그인용 회원 조회. 탈퇴한 회원은 찾지 않는다. */
export const findUserForLogin = async (loginId) => {
  const row = await userRepository.findActiveUserByLoginId(loginId);

  if (row === null) {
    return null;
  }

  return {
    id: row.id,
    username: row.username,
    nickname: row.nickname,
    role: row.role,
    passwordHash: row.password_hash,
  };
};

export const findActiveSanctionsByUserId = async (userId) => {
  const rows = await userRepository.findActiveSanctionsByUserId(userId);

  return rows.map(toSanction);
};

/**
 * 인증 미들웨어가 매 요청마다 읽는 회원 정보. 권한·제재를 토큰이 아니라 DB 기준으로 판단하기 위해
 * 요청마다 다시 조회한다 (API 명세 1.2). 탈퇴했거나 없는 회원이면 null.
 */
export const findAuthUserById = async (userId) => {
  const [user, permissionRows, sanctions] = await Promise.all([
    userRepository.findActiveUserById(userId),
    userRepository.findActivePermissionsByUserId(userId),
    findActiveSanctionsByUserId(userId),
  ]);

  if (user === null) {
    return null;
  }

  return {
    id: user.id,
    username: user.username,
    nickname: user.nickname,
    role: user.role,
    permissions: permissionRows.map((row) => row.permission),
    sanctions,
  };
};

/**
 * 막을 제재 종류(types) 중 걸려 있는 제재가 있으면 403을 던진다. 이용 정지를 가장 먼저 확인한다.
 * 예: 글 작성은 ['suspend', 'write_ban'], 댓글 작성은 ['suspend', 'comment_ban']
 */
export const assertNotSanctioned = (sanctions, types) => {
  const blockingTypes = Object.keys(SANCTION_ERRORS).filter((type) => types.includes(type));

  for (const type of blockingTypes) {
    const matched = sanctions.filter((sanction) => sanction.type === type);

    if (matched.length > 0) {
      throw new ForbiddenError(
        SANCTION_ERRORS[type].code,
        buildSanctionMessage(findLongestSanction(matched)),
      );
    }
  }
};

// 재설정 토큰은 10분간, 1회만 유효하다 (API 명세 2장 비밀번호 찾기)
const PASSWORD_RESET_EXPIRES_IN = 10 * 60;
const PASSWORD_RESET_TOKEN_BYTES = 32;

const throwResetTokenInvalid = () => {
  throw new BadRequestError(
    'RESET_TOKEN_INVALID',
    '비밀번호 재설정 요청이 만료되었거나 이미 사용되었습니다. 본인 확인을 다시 해주세요.',
  );
};

const throwUserNotFound = () => {
  throw new NotFoundError('USER_NOT_FOUND', '입력한 정보와 일치하는 회원이 없습니다.');
};

// 앞 3자(5자 이하면 앞 2자)만 보여 주고 나머지는 같은 개수의 *로 가린다 (API 명세 2장, REQ-FINDID-003)
const maskUsername = (username) => {
  const visibleLength = username.length <= 5 ? 2 : 3;

  return username.slice(0, visibleLength) + '*'.repeat(username.length - visibleLength);
};

// DB에는 토큰 원문 대신 SHA-256 해시만 저장한다 (DB 설계 4.4)
const hashResetToken = (resetToken) => crypto.createHash('sha256').update(resetToken).digest('hex');

/** 비밀번호를 Argon2id로 해시한다 (API 명세 1.8). 회원가입·비밀번호 변경에서도 이 함수를 쓴다. */
export const hashPassword = (password) => argon2.hash(password, { type: argon2.argon2id });

// 이름과 이메일만 알면 남의 아이디를 알 수 있으므로 가린 아이디만 돌려준다
export const getMaskedUsername = async ({ name, email }) => {
  const user = await userRepository.findActiveUserByNameAndEmail(name, email);

  if (user === null) {
    throwUserNotFound();
  }

  return { maskedUsername: maskUsername(user.username) };
};

/** 비밀번호 찾기 1단계: 아이디·이메일로 본인 확인 후 재설정 토큰을 발급한다. */
export const createPasswordResetToken = async ({ username, email }) => {
  const user = await userRepository.findActiveUserByUsernameAndEmail(username, email);

  if (user === null) {
    throwUserNotFound();
  }

  const resetToken = crypto.randomBytes(PASSWORD_RESET_TOKEN_BYTES).toString('hex');

  await userRepository.createPasswordResetToken({
    userId: user.id,
    tokenHash: hashResetToken(resetToken),
    expiresInSeconds: PASSWORD_RESET_EXPIRES_IN,
  });

  return { resetToken, expiresIn: PASSWORD_RESET_EXPIRES_IN };
};

/** 비밀번호 찾기 2단계: 재설정 토큰이 유효하면 새 비밀번호로 바꾼다. */
export const resetPassword = async ({ resetToken, newPassword }) => {
  // 해시 계산은 오래 걸리므로 트랜잭션 밖에서 먼저 한다 (연결과 잠금을 오래 잡지 않도록)
  const passwordHash = await hashPassword(newPassword);

  await withTransaction(async () => {
    const token = await userRepository.findUsableResetTokenByHashForUpdate(
      hashResetToken(resetToken),
    );

    if (token === null) {
      throwResetTokenInvalid();
    }

    // 토큰을 받은 뒤 탈퇴한 회원은 바꾸지 않는다
    const isUpdated = await userRepository.updateActiveUserPassword(token.user_id, passwordHash);

    if (!isUpdated) {
      throwResetTokenInvalid();
    }

    // 이 토큰과 함께, 같은 회원이 전에 받아 둔 다른 토큰도 더는 못 쓰게 한다
    await userRepository.updateResetTokensUsedByUserId(token.user_id);
  });
};
