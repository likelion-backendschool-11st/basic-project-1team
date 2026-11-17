import { getExecutor } from '../../config/database.js';

// 잠금이 풀렸거나, 잠기지 않은 채 마지막 시도 뒤 정해진 시간이 지난 기록인지 (DB 설계서 4.26)
const IS_STALE = `CASE
  WHEN locked_until IS NOT NULL THEN locked_until <= CURRENT_TIMESTAMP(3)
  ELSE last_attempt_at <= CURRENT_TIMESTAMP(3) - INTERVAL ? SECOND
END`;

// 행이 없을 때만 만든다. 이미 있으면 아무것도 하지 않는다.
// INSERT ... ON DUPLICATE KEY UPDATE는 같은 키로 동시에 여러 요청이 오면 공유 잠금을 배타 잠금으로
// 올리다 교착이 날 수 있어, 공유 잠금만 잡는 INSERT IGNORE를 쓴다
export const createAuthAttemptIfAbsent = async ({ scope, keyHash }) => {
  await getExecutor().query(
    `INSERT IGNORE INTO auth_attempts (scope, key_hash, last_attempt_at)
     VALUES (?, ?, CURRENT_TIMESTAMP(3))`,
    [scope, keyHash],
  );
};

// 시각 비교는 인스턴스 시계가 아니라 DB 시각으로 한다. 없으면 null
export const findAuthAttemptForUpdate = async ({ scope, keyHash, staleAfterSeconds }) => {
  const [rows] = await getExecutor().query(
    `SELECT attempt_count,
            (locked_until IS NOT NULL AND locked_until > CURRENT_TIMESTAMP(3)) AS is_locked,
            ${IS_STALE} AS is_stale,
            GREATEST(0, TIMESTAMPDIFF(MICROSECOND, CURRENT_TIMESTAMP(3), locked_until)) DIV 1000
              AS lock_remaining_ms
     FROM auth_attempts
     WHERE scope = ? AND key_hash = ?
     FOR UPDATE`,
    [staleAfterSeconds, scope, keyHash],
  );

  return rows[0] ?? null;
};

export const updateAuthAttemptCount = async ({ scope, keyHash, attemptCount }) => {
  await getExecutor().query(
    `UPDATE auth_attempts
     SET attempt_count = ?, last_attempt_at = CURRENT_TIMESTAMP(3), locked_until = NULL
     WHERE scope = ? AND key_hash = ?`,
    [attemptCount, scope, keyHash],
  );
};

// 실패는 시도 전에 이미 셌으므로 시각만 갱신하고, 횟수가 다 찼으면 잠근다
export const updateAuthAttemptFailed = async ({ scope, keyHash, maxFailures, lockSeconds }) => {
  await getExecutor().query(
    `UPDATE auth_attempts
     SET locked_until = IF(attempt_count >= ?, CURRENT_TIMESTAMP(3) + INTERVAL ? SECOND, locked_until),
         last_attempt_at = CURRENT_TIMESTAMP(3)
     WHERE scope = ? AND key_hash = ?`,
    [maxFailures, lockSeconds, scope, keyHash],
  );
};

// 성공·실패로 셀 수 없는 오류였으면 미리 센 1회를 되돌린다
export const decrementAuthAttemptCount = async ({ scope, keyHash }) => {
  await getExecutor().query(
    `UPDATE auth_attempts SET attempt_count = attempt_count - 1
     WHERE scope = ? AND key_hash = ? AND attempt_count > 0`,
    [scope, keyHash],
  );
};

export const deleteAuthAttempt = async ({ scope, keyHash }) => {
  await getExecutor().query('DELETE FROM auth_attempts WHERE scope = ? AND key_hash = ?', [
    scope,
    keyHash,
  ]);
};

// 확인 중인 요청이 있는 행은 마지막 시도 시각이 방금이라 지우지 않는다
export const deleteStaleAuthAttempts = async (staleAfterSeconds) => {
  const [result] = await getExecutor().query(`DELETE FROM auth_attempts WHERE ${IS_STALE}`, [
    staleAfterSeconds,
  ]);

  return result.affectedRows;
};
