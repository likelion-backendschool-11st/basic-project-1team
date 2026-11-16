import { getExecutor } from '../../config/database.js';

// 지급·차감 전에 회원 행을 잠가 같은 회원의 포인트 변경을 한 건씩 처리한다 (DB 설계서 4.20)
export const findUserPointsByIdForUpdate = async (userId) => {
  const [rows] = await getExecutor().query(
    `SELECT id, role, status, points
     FROM users
     WHERE id = ?
     FOR UPDATE`,
    [userId],
  );

  return rows[0] ?? null;
};

// 회원 행을 잠근 뒤 확인하므로 같은 grant_key를 동시에 넣는 일은 없다 (DB 설계서 4.20)
export const existsPointHistory = async (userId, grantKey) => {
  const [rows] = await getExecutor().query(
    'SELECT 1 FROM point_histories WHERE user_id = ? AND grant_key = ? LIMIT 1',
    [userId, grantKey],
  );

  return rows.length > 0;
};

export const createPointHistory = async ({
  userId,
  reason,
  amount,
  targetType,
  targetId,
  grantKey,
  detail,
}) => {
  await getExecutor().query(
    `INSERT INTO point_histories (user_id, reason, amount, target_type, target_id, grant_key, detail)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [userId, reason, amount, targetType, targetId, grantKey, detail],
  );
};

export const updateUserPoints = async (userId, points) => {
  await getExecutor().query('UPDATE users SET points = ? WHERE id = ?', [points, userId]);
};

export const countPointHistoriesSince = async (userId, reason, since) => {
  const [rows] = await getExecutor().query(
    `SELECT COUNT(*) AS count
     FROM point_histories
     WHERE user_id = ? AND reason = ? AND created_at >= ?`,
    [userId, reason, since],
  );

  return Number(rows[0].count);
};

export const countPointHistoriesByReason = async (userId, reason) => {
  const [rows] = await getExecutor().query(
    `SELECT COUNT(*) AS count
     FROM point_histories
     WHERE user_id = ? AND reason = ?`,
    [userId, reason],
  );

  return Number(rows[0].count);
};

export const findPointHistoriesByUserId = async (userId, { limit, offset }) => {
  const [rows] = await getExecutor().query(
    `SELECT id, reason, amount, target_type, target_id, detail, created_at
     FROM point_histories
     WHERE user_id = ?
     ORDER BY created_at DESC, id DESC
     LIMIT ? OFFSET ?`,
    [userId, limit, offset],
  );

  return rows;
};

export const countPointHistoriesByUserId = async (userId) => {
  const [rows] = await getExecutor().query(
    'SELECT COUNT(*) AS count FROM point_histories WHERE user_id = ?',
    [userId],
  );

  return Number(rows[0].count);
};

// Grandmaster·Challenger 순위 후보: Master 레벨 이상인 일반 회원과 답변 채택률 (API 명세 11.2)
export const findRankingCandidates = async (minPoints) => {
  const [rows] = await getExecutor().query(
    `SELECT
       u.id,
       u.points,
       u.created_at,
       COUNT(a.id) AS answer_count,
       COALESCE(SUM(a.is_accepted), 0) AS accepted_count
     FROM users u
     LEFT JOIN answers a ON a.author_id = u.id AND a.status = 'active'
     WHERE u.points >= ? AND u.role = 'USER' AND u.status = 'active'
     GROUP BY u.id`,
    [minPoints],
  );

  return rows;
};
