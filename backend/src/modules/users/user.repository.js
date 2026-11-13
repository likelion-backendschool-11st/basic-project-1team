import { pool } from '../../config/database.js';

// 아이디에는 @가 들어갈 수 없어 아이디와 이메일이 같은 값일 수 없으므로 한 번에 찾는다 (API 명세 1.8)
export const findActiveUserByLoginId = async (loginId) => {
  const [rows] = await pool.query(
    `SELECT id, username, nickname, role, password_hash
     FROM users
     WHERE status = 'active' AND (username = ? OR email = ?)
     LIMIT 1`,
    [loginId, loginId],
  );

  return rows[0] ?? null;
};

export const findActiveUserById = async (userId) => {
  const [rows] = await pool.query(
    `SELECT id, username, nickname, role
     FROM users
     WHERE id = ? AND status = 'active'`,
    [userId],
  );

  return rows[0] ?? null;
};

export const findActivePermissionsByUserId = async (userId) => {
  const [rows] = await pool.query(
    `SELECT permission
     FROM user_permissions
     WHERE user_id = ? AND status = 'active'`,
    [userId],
  );

  return rows;
};

// 기간이 지난 제재는 따로 처리하지 않고 요청 시점에 해제일과 비교해 뺀다 (API 명세 1.2, DB 설계 4.3)
export const findActiveSanctionsByUserId = async (userId) => {
  const [rows] = await pool.query(
    `SELECT type, ends_at
     FROM user_sanctions
     WHERE user_id = ?
       AND released_at IS NULL
       AND (ends_at IS NULL OR ends_at > CURRENT_TIMESTAMP(3))`,
    [userId],
  );

  return rows;
};
