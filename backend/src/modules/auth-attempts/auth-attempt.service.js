import crypto from 'node:crypto';

import { TooManyRequestsError } from '../../common/error/http-errors.js';
import { logger } from '../../common/utils/logger.js';
import { withTransaction } from '../../config/database.js';

import * as authAttemptRepository from './auth-attempt.repository.js';

// 시도 횟수 제한 (API 명세 1.11). 같은 대상으로 5번 실패하면 5분 동안 시도를 막는다.
// 기록은 DB(auth_attempts)에 두어 서버리스 인스턴스가 여러 개여도 함께 센다 (DB 설계서 4.26)
const MAX_FAILURES = 5;
const LOCK_SECONDS = 5 * 60;
const LOCK_MS = LOCK_SECONDS * 1000;

// 세는 기준(API 명세 1.11 표)마다 따로 센다
export const ATTEMPT_SCOPES = Object.freeze({
  login: 'login',
  findUsername: 'find_username',
  passwordResetVerify: 'password_reset_verify',
  currentPassword: 'current_password',
});

// 입력한 loginId 원문을 DB에 남기지 않고, 길이와 상관없이 같은 크기의 키로 만든다
const hashAttemptKey = (key) => crypto.createHash('sha256').update(key).digest('hex');

const throwTooManyAttempts = (remainingMs) => {
  const minutes = Math.max(1, Math.ceil(remainingMs / 60000));

  throw new TooManyRequestsError(
    'TOO_MANY_ATTEMPTS',
    `시도 횟수를 초과했습니다. ${minutes}분 후에 다시 시도해주세요.`,
    Math.max(1, Math.ceil(remainingMs / 1000)),
  );
};

/**
 * 확인하기 전에 이번 시도를 먼저 센다. 잠겨 있거나 확인 중인 요청까지 5번이 차 있으면 429.
 * 비밀번호 검증처럼 오래 걸리는 확인은 이 트랜잭션 밖에서 한다 (행 잠금을 오래 잡지 않도록)
 */
const reserveAttempt = async (target) => {
  await authAttemptRepository.createAuthAttemptIfAbsent(target);

  return withTransaction(async () => {
    const row = await authAttemptRepository.findAuthAttemptForUpdate({
      ...target,
      staleAfterSeconds: LOCK_SECONDS,
    });

    // 행을 만든 직후 다른 요청의 성공으로 지워졌으면 처음부터 센다
    if (row === null) {
      await authAttemptRepository.createAuthAttemptIfAbsent(target);
      await authAttemptRepository.updateAuthAttemptCount({ ...target, attemptCount: 1 });
      return;
    }

    if (Number(row.is_locked) === 1) {
      throwTooManyAttempts(Number(row.lock_remaining_ms));
    }

    const attemptCount = Number(row.is_stale) === 1 ? 0 : row.attempt_count;

    if (attemptCount >= MAX_FAILURES) {
      throwTooManyAttempts(LOCK_MS);
    }

    await authAttemptRepository.updateAuthAttemptCount({
      ...target,
      attemptCount: attemptCount + 1,
    });
  });
};

const releaseAttempt = async (target) => {
  try {
    await authAttemptRepository.decrementAuthAttemptCount(target);
  } catch (error) {
    logger.warn('[auth-attempt] 미리 센 시도를 되돌리지 못했습니다', error);
  }
};

/**
 * scope(세는 기준)별 시도 횟수 제한을 만든다.
 * attempt(key, verify): verify()가 true면 성공으로 기록을 지우고, false면 실패로 센다.
 * 그 밖의 오류는 세지 않고 그대로 던진다. 잠겨 있으면 verify()를 부르지 않고 429를 던진다
 */
export const createAttemptLimiter = (scope) => {
  const attempt = async (key, verify) => {
    const target = { scope, keyHash: hashAttemptKey(key) };

    await reserveAttempt(target);

    let matched;

    try {
      matched = await verify();
    } catch (error) {
      await releaseAttempt(target);
      throw error;
    }

    if (matched) {
      await authAttemptRepository.deleteAuthAttempt(target);
    } else {
      await authAttemptRepository.updateAuthAttemptFailed({
        ...target,
        maxFailures: MAX_FAILURES,
        lockSeconds: LOCK_SECONDS,
      });
    }

    return matched;
  };

  return { attempt };
};

/** 잠금이 풀렸거나 마지막 시도 뒤 5분이 지난 기록을 지운다. 지운 개수를 돌려준다 (API 명세 1.7 예외) */
export const cleanupAuthAttempts = () =>
  authAttemptRepository.deleteStaleAuthAttempts(LOCK_SECONDS);
