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
    `SELECT id, username, nickname, role, password_changed_at
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
    // 바꾼 시각보다 먼저 발급된 토큰은 인증에서 거절한다 (API 명세 1.2)
    `UPDATE users
     SET password_hash = ?, password_changed_at = CURRENT_TIMESTAMP(3)
     WHERE id = ? AND status = 'active'`,
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

// 토큰을 더는 쓸 수 없게 된 시각. 재설정에 성공하면 이미 만료된 토큰에도 used_at을 기록하므로 만료 시각과 비교해 이른 쪽을 쓴다 (DB 설계 4.4)
const RESET_TOKEN_UNUSABLE_SINCE = 'LEAST(COALESCE(used_at, expires_at), expires_at)';

export const countPasswordResetTokens = async (retentionMinutes) => {
  const [rows] = await getExecutor().query(
    `SELECT
       COUNT(*) AS total_count,
       COALESCE(SUM(used_at IS NULL AND expires_at > CURRENT_TIMESTAMP(3)), 0) AS usable_count,
       COALESCE(
         SUM(${RESET_TOKEN_UNUSABLE_SINCE} < CURRENT_TIMESTAMP(3) - INTERVAL ? MINUTE),
         0
       ) AS cleanup_target_count
     FROM password_reset_tokens`,
    [retentionMinutes],
  );

  return rows[0];
};

/** 쓸 수 없게 된 지 retentionMinutes가 지난 재설정 토큰 행을 지운다 (명세 1.7 예외). 지운 행 수를 돌려준다 */
export const deleteUnusablePasswordResetTokens = async (retentionMinutes) => {
  const [result] = await getExecutor().query(
    `DELETE FROM password_reset_tokens
     WHERE ${RESET_TOKEN_UNUSABLE_SINCE} < CURRENT_TIMESTAMP(3) - INTERVAL ? MINUTE`,
    [retentionMinutes],
  );

  return result.affectedRows;
};

// 중복 검사는 탈퇴하지 않은 회원끼리만 한다. 대소문자는 연결의 정렬 규칙(utf8mb4_0900_bin)대로 구분한다 (API 명세 1.10)
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
    `SELECT id, username, name, nickname, email, role, profile_image_url, bio, points, created_at
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

// ---------------------------------------------------------------------
// 주력 게임 (DB 설계 4.24)
// ---------------------------------------------------------------------

// 고른 순서대로. 병합된 태그는 병합 대상으로 바꾸고, 차단된 태그는 뺀다 (API 명세 2장 mainGames)
export const findMainGameTagsByUserId = async (userId) => {
  const [rows] = await getExecutor().query(
    `SELECT t.id, t.name
     FROM user_main_games g
     JOIN tags picked ON picked.id = g.tag_id
     JOIN tags t ON t.id = IF(picked.status = 'merged', picked.merged_into_id, picked.id)
     WHERE g.user_id = ? AND g.deleted_at IS NULL AND t.status = 'active'
     ORDER BY g.sort_order, g.id`,
    [userId],
  );

  return rows;
};

// 태그별로 그 태그가 붙은 질문에 회원이 단 답변 수와 채택된 수 (DB 설계 5장 mainGames)
export const countAnswersByUserIdAndTagIds = async (userId, tagIds) => {
  const [rows] = await getExecutor().query(
    `SELECT qt.tag_id,
            COUNT(*) AS answer_count,
            SUM(a.is_accepted = 1) AS accepted_count
     FROM answers a
     JOIN questions q ON q.id = a.question_id AND q.status = 'active'
     JOIN question_tags qt ON qt.question_id = q.id AND qt.deleted_at IS NULL
     WHERE a.author_id = ? AND a.status = 'active' AND qt.tag_id IN (?)
     GROUP BY qt.tag_id`,
    [userId, tagIds],
  );

  return rows;
};

export const countActiveTagsByIds = async (tagIds) => {
  const [rows] = await getExecutor().query(
    "SELECT COUNT(*) AS count FROM tags WHERE id IN (?) AND status = 'active'",
    [tagIds],
  );

  return Number(rows[0].count);
};

// 목록에 없는 주력 게임은 행을 지우지 않고 뺀 시각을 남긴다 (API 명세 1.7)
export const removeMainGamesExcept = async (userId, keepTagIds) => {
  const exceptCondition = keepTagIds.length > 0 ? 'AND tag_id NOT IN (?)' : '';

  await getExecutor().query(
    `UPDATE user_main_games SET deleted_at = NOW(3)
     WHERE user_id = ? AND deleted_at IS NULL ${exceptCondition}`,
    keepTagIds.length > 0 ? [userId, keepTagIds] : [userId],
  );
};

// 전에 뺀 태그를 다시 고르면 같은 행을 되살린다
export const upsertMainGames = async (userId, tagIds) => {
  await getExecutor().query(
    `INSERT INTO user_main_games (user_id, tag_id, sort_order) VALUES ? AS picked
     ON DUPLICATE KEY UPDATE deleted_at = NULL, sort_order = picked.sort_order`,
    [tagIds.map((tagId, index) => [userId, tagId, index])],
  );
};

// 활동 배지를 계산할 값 (API 명세 2장 badges). 질문·답변 수는 활동 수(findActivityCountsByUserId)를 쓴다.
// 매너인: 가입일, 마지막 제재가 끝난 때(해제 시각 또는 기간 만료), 내 글 신고가 마지막으로 처리된 때 중 늦은 때부터 지난 일수
export const findBadgeCountsByUserId = async (userId) => {
  const [rows] = await getExecutor().query(
    `SELECT
       (SELECT COUNT(*) FROM answers a
        JOIN questions q ON q.id = a.question_id AND q.status = 'active'
        WHERE a.author_id = u.id AND a.status = 'active' AND a.is_accepted = 1) AS accepted_count,
       (SELECT COUNT(*) FROM answer_votes v
        JOIN answers a ON a.id = v.answer_id AND a.status = 'active'
        JOIN questions q ON q.id = a.question_id AND q.status = 'active'
        WHERE a.author_id = u.id AND v.status = 'active') AS vote_count,
       (SELECT COUNT(*) FROM point_histories
        WHERE user_id = u.id AND reason = 'daily_visit') AS visit_days,
       (SELECT COUNT(*) FROM user_sanctions
        WHERE user_id = u.id
          AND released_at IS NULL
          AND (ends_at IS NULL OR ends_at > CURRENT_TIMESTAMP(3))) AS active_sanction_count,
       TIMESTAMPDIFF(
         DAY,
         GREATEST(
           u.created_at,
           COALESCE(
             (SELECT MAX(IF(released_at IS NULL, ends_at, LEAST(released_at, COALESCE(ends_at, released_at))))
              FROM user_sanctions WHERE user_id = u.id),
             u.created_at
           ),
           COALESCE(
             (SELECT MAX(processed_at) FROM reports
              WHERE target_author_id = u.id AND status = 'resolved'),
             u.created_at
           )
         ),
         CURRENT_TIMESTAMP(3)
       ) AS manner_days
     FROM users u
     WHERE u.id = ?`,
    [userId],
  );

  return rows[0];
};
