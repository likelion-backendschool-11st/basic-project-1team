import { getExecutor } from '../../config/database.js';

// 아이디에는 @가 들어갈 수 없어 아이디와 이메일이 같은 값일 수 없으므로 한 번에 찾는다 (API 명세 1.8)
export const findActiveUserByLoginId = async (loginId) => {
  const [rows] = await getExecutor().query(
    `SELECT id, username, nickname, role, password_hash
     FROM users
     WHERE status = 'active' AND (username = ? OR email = ?)
     LIMIT 1`,
    [loginId, loginId],
  );

  return rows[0] ?? null;
};

export const findActiveUserById = async (userId) => {
  const [rows] = await getExecutor().query(
    `SELECT id, username, nickname, role
     FROM users
     WHERE id = ? AND status = 'active'`,
    [userId],
  );

  return rows[0] ?? null;
};

export const findActivePermissionsByUserId = async (userId) => {
  const [rows] = await getExecutor().query(
    `SELECT permission
     FROM user_permissions
     WHERE user_id = ? AND status = 'active'`,
    [userId],
  );

  return rows;
};

// 기간이 지난 제재는 따로 처리하지 않고 요청 시점에 해제일과 비교해 뺀다 (API 명세 1.2, DB 설계 4.3)
export const findActiveSanctionsByUserId = async (userId) => {
  const [rows] = await getExecutor().query(
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
  const [rows] = await getExecutor().query(
    `SELECT id, username
     FROM users
     WHERE status = 'active' AND email = ? AND name = ?`,
    [email, name],
  );

  return rows[0] ?? null;
};

export const findActiveUserByUsernameAndEmail = async (username, email) => {
  const [rows] = await getExecutor().query(
    `SELECT id
     FROM users
     WHERE status = 'active' AND username = ? AND email = ?`,
    [username, email],
  );

  return rows[0] ?? null;
};

// 만료 시각은 DB 시계 기준으로 넣어, 사용할 때 비교하는 시계와 맞춘다
export const createPasswordResetToken = async ({ userId, tokenHash, expiresInSeconds }) => {
  await getExecutor().query(
    `INSERT INTO password_reset_tokens (user_id, token_hash, expires_at)
     VALUES (?, ?, CURRENT_TIMESTAMP(3) + INTERVAL ? SECOND)`,
    [userId, tokenHash, expiresInSeconds],
  );
};

// 같은 토큰으로 동시에 요청해도 한 번만 쓰이도록 토큰 행을 잠근다 (DB 설계 4.4)
export const findUsableResetTokenByHashForUpdate = async (tokenHash) => {
  const [rows] = await getExecutor().query(
    `SELECT id, user_id
     FROM password_reset_tokens
     WHERE token_hash = ? AND used_at IS NULL AND expires_at > CURRENT_TIMESTAMP(3)
     FOR UPDATE`,
    [tokenHash],
  );

  return rows[0] ?? null;
};

/** 탈퇴하지 않은 회원의 비밀번호를 바꾼다. 바꿨으면 true. */
export const updateActiveUserPassword = async (userId, passwordHash) => {
  const [result] = await getExecutor().query(
    "UPDATE users SET password_hash = ? WHERE id = ? AND status = 'active'",
    [passwordHash, userId],
  );

  return result.affectedRows > 0;
};

export const updateResetTokensUsedByUserId = async (userId) => {
  await getExecutor().query(
    `UPDATE password_reset_tokens
     SET used_at = CURRENT_TIMESTAMP(3)
     WHERE user_id = ? AND used_at IS NULL`,
    [userId],
  );
};

// 중복 검사는 탈퇴하지 않은 회원끼리만 한다. 대소문자는 연결의 정렬 규칙(utf8mb4_0900_as_cs)대로 구분한다 (API 명세 1.10)
export const findActiveUserByUsername = async (username) => {
  const [rows] = await getExecutor().query(
    "SELECT id FROM users WHERE status = 'active' AND username = ?",
    [username],
  );

  return rows[0] ?? null;
};

export const findActiveUserByNickname = async (nickname) => {
  const [rows] = await getExecutor().query(
    "SELECT id FROM users WHERE status = 'active' AND nickname = ?",
    [nickname],
  );

  return rows[0] ?? null;
};

export const findActiveUserByEmail = async (email) => {
  const [rows] = await getExecutor().query(
    "SELECT id FROM users WHERE status = 'active' AND email = ?",
    [email],
  );

  return rows[0] ?? null;
};

export const createUser = async ({ name, username, nickname, email, passwordHash }) => {
  const [result] = await getExecutor().query(
    `INSERT INTO users (name, username, nickname, email, password_hash)
     VALUES (?, ?, ?, ?, ?)`,
    [name, username, nickname, email, passwordHash],
  );

  return result.insertId;
};
