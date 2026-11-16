import { TooManyRequestsError } from '../error/http-errors.js';

// 시도 횟수 제한 (API 명세 1.11). 같은 대상(key)으로 5번 실패하면 5분 동안 시도를 막는다.
// 기록은 서버 메모리에만 두므로 서버를 다시 켜면 처음부터 센다
const MAX_FAILURES = 5;
const LOCK_MS = 5 * 60 * 1000;
const SWEEP_INTERVAL_MS = 60 * 1000;

const toRetryAfterSeconds = (ms) => Math.max(1, Math.ceil(ms / 1000));

const throwTooManyAttempts = (remainingMs) => {
  const minutes = Math.max(1, Math.ceil(remainingMs / 60000));

  throw new TooManyRequestsError(
    'TOO_MANY_ATTEMPTS',
    `시도 횟수를 초과했습니다. ${minutes}분 후에 다시 시도해주세요.`,
    toRetryAfterSeconds(remainingMs),
  );
};

/**
 * 기록: { failures, pending, lastFailedAt, lockedUntil }
 * - 잠긴 동안에는 비밀번호가 맞아도 확인하지 않고 429로 막는다
 * - 성공하면 실패 기록을 지운다. 잠기지 않은 채 마지막 실패 뒤 5분이 지나도 지운다
 * - 확인 중인 요청(pending)도 함께 세서, 동시에 여러 요청을 보내 5번을 넘겨 시도하지 못하게 한다
 */
export const createAttemptLimiter = () => {
  const records = new Map();

  // 잠금이 풀렸거나 실패가 오래돼 더 볼 필요가 없는 기록인지
  const isStale = (record, now) =>
    record.lockedUntil !== null
      ? record.lockedUntil <= now
      : record.lastFailedAt === null || record.lastFailedAt + LOCK_MS <= now;

  const readRecord = (key, now) => {
    const record = records.get(key);

    if (record === undefined) {
      return null;
    }

    if (isStale(record, now)) {
      record.failures = 0;
      record.lastFailedAt = null;
      record.lockedUntil = null;
    }

    return record;
  };

  const release = (key, record) => {
    record.pending -= 1;

    if (record.pending === 0 && record.failures === 0) {
      records.delete(key);
    }
  };

  // 오래된 기록을 지워 메모리가 계속 늘지 않게 한다
  setInterval(() => {
    const now = Date.now();

    for (const [key, record] of records) {
      if (record.pending === 0 && isStale(record, now)) {
        records.delete(key);
      }
    }
  }, SWEEP_INTERVAL_MS).unref();

  /**
   * verify()가 true를 돌려주면 성공, false면 실패로 센다. 그 밖의 오류는 세지 않고 그대로 던진다.
   * 잠겨 있으면 verify()를 부르지 않고 429를 던진다
   */
  const attempt = async (key, verify) => {
    const now = Date.now();
    let record = readRecord(key, now);

    if (record !== null) {
      if (record.lockedUntil !== null) {
        throwTooManyAttempts(record.lockedUntil - now);
      }

      if (record.failures + record.pending >= MAX_FAILURES) {
        throwTooManyAttempts(LOCK_MS);
      }
    } else {
      record = { failures: 0, pending: 0, lastFailedAt: null, lockedUntil: null };
      records.set(key, record);
    }

    record.pending += 1;

    let matched;

    try {
      matched = await verify();
    } catch (error) {
      release(key, record);
      throw error;
    }

    const finishedAt = Date.now();

    if (matched) {
      record.failures = 0;
      record.lastFailedAt = null;
      record.lockedUntil = null;
    } else {
      readRecord(key, finishedAt);
      record.failures += 1;
      record.lastFailedAt = finishedAt;

      if (record.failures >= MAX_FAILURES) {
        record.lockedUntil = finishedAt + LOCK_MS;
      }
    }

    release(key, record);

    return matched;
  };

  return { attempt };
};
