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

export const findActiveUserByNameAndEmail = async (name, email) => {
  const [rows] = await pool.query(
    `SELECT id, username
     FROM users
     WHERE status = 'active' AND email = ? AND name = ?`,
    [email, name],
  );

  return rows[0] ?? null;
};

export const findActiveUserByUsernameAndEmail = async (username, email) => {
  const [rows] = await pool.query(
    `SELECT id
     FROM users
     WHERE status = 'active' AND username = ? AND email = ?`,
    [username, email],
  );

  return rows[0] ?? null;
};

// 만료 시각은 DB 시계 기준으로 넣어, 사용할 때 비교하는 시계와 맞춘다
export const createPasswordResetToken = async ({ userId, tokenHash, expiresInSeconds }) => {
  await pool.query(
    `INSERT INTO password_reset_tokens (user_id, token_hash, expires_at)
     VALUES (?, ?, CURRENT_TIMESTAMP(3) + INTERVAL ? SECOND)`,
    [userId, tokenHash, expiresInSeconds],
  );
};

/**
 * 유효한 재설정 토큰이면 그 회원의 비밀번호를 바꾸고 토큰을 사용 처리한다. 바꿨으면 true.
 * 같은 토큰으로 동시에 요청해도 한 번만 바뀌도록 토큰 행을 잠그고 한 트랜잭션에서 처리한다 (DB 설계 4.4)
 */
export const updatePasswordByResetTokenHash = async (tokenHash, passwordHash) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [tokenRows] = await connection.query(
      `SELECT user_id
       FROM password_reset_tokens
       WHERE token_hash = ? AND used_at IS NULL AND expires_at > CURRENT_TIMESTAMP(3)
       FOR UPDATE`,
      [tokenHash],
    );
    const userId = tokenRows[0]?.user_id;

    // 토큰을 받은 뒤 탈퇴한 회원은 바꾸지 않는다
    const [userResult] =
      userId === undefined
        ? [{ affectedRows: 0 }]
        : await connection.query(
            "UPDATE users SET password_hash = ? WHERE id = ? AND status = 'active'",
            [passwordHash, userId],
          );

    if (userResult.affectedRows === 0) {
      await connection.rollback();
      return false;
    }

    // 이 토큰과 함께, 같은 회원이 전에 받아 둔 다른 토큰도 더는 못 쓰게 한다
    await connection.query(
      `UPDATE password_reset_tokens
       SET used_at = CURRENT_TIMESTAMP(3)
       WHERE user_id = ? AND used_at IS NULL`,
      [userId],
    );

    await connection.commit();
    return true;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};
