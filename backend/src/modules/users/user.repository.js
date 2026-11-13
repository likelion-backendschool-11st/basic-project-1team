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
export const findActiveUserPasswordHashById = async (userId) => {
  const [rows] = await getExecutor().query(
    "SELECT password_hash FROM users WHERE id = ? AND status = 'active'",
    [userId],
  );

  return rows[0] ?? null;
};

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

// 프로필 사진을 바꾸거나 탈퇴할 때, 동시에 온 요청이 이전 파일을 서로 다르게 보지 않도록 행을 잠그고 읽는다
export const findActiveUserProfileImageUrlByIdForUpdate = async (userId) => {
  const [rows] = await getExecutor().query(
    "SELECT profile_image_url FROM users WHERE id = ? AND status = 'active' FOR UPDATE",
    [userId],
  );

  return rows[0] ?? null;
};

// 행은 남기고 상태만 바꾼 뒤 개인정보를 비운다. 아이디·이메일·닉네임이 NULL이 되어 같은 값으로 다시 가입할 수 있다
// (API 명세 2장 회원 탈퇴, 1.7 삭제 정책)
export const updateUserWithdrawn = async (userId) => {
  const [result] = await getExecutor().query(
    `UPDATE users
     SET status = 'withdrawn',
         withdrawn_at = CURRENT_TIMESTAMP(3),
         username = NULL,
         email = NULL,
         nickname = NULL,
         name = NULL,
         password_hash = NULL,
         profile_image_url = NULL,
         bio = NULL
     WHERE id = ? AND status = 'active'`,
    [userId],
  );

  return result.affectedRows > 0;
};

export const findActiveUserProfileById = async (userId) => {
  const [rows] = await getExecutor().query(
    `SELECT id, username, name, nickname, email, role, profile_image_url, bio, created_at
     FROM users
     WHERE id = ? AND status = 'active'`,
    [userId],
  );

  return rows[0] ?? null;
};

// 숨김·삭제된 글은 뺀다. 답변은 숨김·삭제된 질문에 달린 것도 뺀다 (API 명세 2장 GET /api/users/me)
export const findActivityCountsByUserId = async (userId) => {
  const [rows] = await getExecutor().query(
    `SELECT
       (SELECT COUNT(*) FROM questions
        WHERE author_id = ? AND status = 'active') AS question_count,
       (SELECT COUNT(*) FROM answers a
        JOIN questions q ON q.id = a.question_id
        WHERE a.author_id = ? AND a.status = 'active' AND q.status = 'active') AS answer_count,
       (SELECT COUNT(*) FROM posts
        WHERE author_id = ? AND status = 'active') AS post_count`,
    [userId, userId, userId],
  );

  return rows[0];
};

// 내가 쓴 질문에 가장 많이 쓴 태그. 횟수가 같으면 최근에 쓴 태그를 앞에 둔다 (DB 설계 5장 interestTags)
export const findInterestTagNamesByUserId = async (userId, limit) => {
  const [rows] = await getExecutor().query(
    `SELECT t.name
     FROM questions q
     JOIN question_tags qt ON qt.question_id = q.id AND qt.deleted_at IS NULL
     JOIN tags t ON t.id = qt.tag_id AND t.status = 'active'
     WHERE q.author_id = ? AND q.status = 'active'
     GROUP BY t.id, t.name
     ORDER BY COUNT(*) DESC, MAX(q.created_at) DESC, t.name
     LIMIT ?`,
    [userId, limit],
  );

  return rows.map((row) => row.name);
};

export const updateActiveUserBio = async (userId, bio) => {
  const [result] = await getExecutor().query(
    "UPDATE users SET bio = ? WHERE id = ? AND status = 'active'",
    [bio, userId],
  );

  return result.affectedRows > 0;
};

export const updateActiveUserProfileImageUrl = async (userId, profileImageUrl) => {
  await getExecutor().query(
    "UPDATE users SET profile_image_url = ? WHERE id = ? AND status = 'active'",
    [profileImageUrl, userId],
  );
};
