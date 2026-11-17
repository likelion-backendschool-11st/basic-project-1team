import { getExecutor } from '../../config/database.js';

// 채택된 답변은 맨 위에 고정하고, 나머지는 정렬 기준대로 (REQ-QNA-005)
const ORDER_BY = {
  latest: 'a.is_accepted DESC, a.created_at DESC, a.id DESC',
  votes: 'a.is_accepted DESC, vote_count DESC, a.created_at DESC, a.id DESC',
};

// 답변 응답(Answer 객체)에 필요한 값. viewerId가 null이면 is_voted는 0이다
const ANSWER_COLUMNS = `
  a.id,
  a.question_id,
  a.body,
  a.is_accepted,
  a.edited_at,
  a.created_at,
  a.updated_at,
  a.author_id,
  u.nickname AS author_nickname,
  u.profile_image_url AS author_profile_image_url,
  u.status AS author_status,
  u.role AS author_role,
  u.points AS author_points,
  q.author_id AS question_author_id,
  (SELECT COUNT(*) FROM answer_votes v WHERE v.answer_id = a.id AND v.status = 'active')
    AS vote_count,
  EXISTS (
    SELECT 1 FROM answer_votes v
    WHERE v.answer_id = a.id AND v.user_id = ? AND v.status = 'active'
  ) AS is_voted,
  EXISTS (
    SELECT 1 FROM answers accepted
    WHERE accepted.question_id = a.question_id AND accepted.is_accepted = 1
  ) AS question_has_accepted_answer`;

// 숨김·삭제된 답변과, 숨김·삭제된 질문에 달린 답변은 보이지 않는다 (API 명세 2장, 1.7)
const VISIBLE_ANSWER = "a.status = 'active' AND q.status = 'active'";

export const findAnswersByQuestionId = async (questionId, viewerId, sort) => {
  const [rows] = await getExecutor().query(
    `SELECT ${ANSWER_COLUMNS}
     FROM answers a
     JOIN users u ON u.id = a.author_id
     JOIN questions q ON q.id = a.question_id
     WHERE a.question_id = ? AND ${VISIBLE_ANSWER}
     ORDER BY ${ORDER_BY[sort]}`,
    [viewerId, questionId],
  );

  return rows;
};

export const findAnswerById = async (answerId, viewerId) => {
  const [rows] = await getExecutor().query(
    `SELECT ${ANSWER_COLUMNS}
     FROM answers a
     JOIN users u ON u.id = a.author_id
     JOIN questions q ON q.id = a.question_id
     WHERE a.id = ? AND ${VISIBLE_ANSWER}`,
    [viewerId, answerId],
  );

  return rows[0] ?? null;
};

// 수정·삭제는 답변 행만 잠그고 상태·작성자·채택 여부를 확인한 뒤 진행한다.
// 운영 DB(TiDB)가 FOR UPDATE OF를 지원하지 않아 답변 행을 먼저 잠그고 질문 상태는 따로 읽는다
export const findAnswerByIdForUpdate = async (answerId) => {
  const [rows] = await getExecutor().query(
    'SELECT id, question_id, author_id, status, is_accepted FROM answers WHERE id = ? FOR UPDATE',
    [answerId],
  );

  if (rows.length === 0) {
    return null;
  }

  const [questions] = await getExecutor().query('SELECT status FROM questions WHERE id = ?', [
    rows[0].question_id,
  ]);

  return { ...rows[0], question_status: questions[0].status };
};

// 채택된 답변은 숨기거나 삭제하면 is_accepted가 0으로 풀리므로 상태는 따로 보지 않는다 (API 명세 1.10)
export const hasAcceptedAnswerByQuestionId = async (questionId) => {
  const [rows] = await getExecutor().query(
    'SELECT EXISTS (SELECT 1 FROM answers WHERE question_id = ? AND is_accepted = 1) AS has_accepted',
    [questionId],
  );

  return rows[0].has_accepted === 1;
};

export const createAnswer = async ({ questionId, authorId, body }) => {
  const [result] = await getExecutor().query(
    'INSERT INTO answers (question_id, author_id, body) VALUES (?, ?, ?)',
    [questionId, authorId, body],
  );

  return result.insertId;
};

export const updateAnswer = async (answerId, { body, editedAt }) => {
  await getExecutor().query('UPDATE answers SET body = ?, edited_at = ? WHERE id = ?', [
    body,
    editedAt,
    answerId,
  ]);
};

export const acceptAnswer = async (answerId) => {
  await getExecutor().query(
    'UPDATE answers SET is_accepted = 1, accepted_at = NOW(3) WHERE id = ?',
    [answerId],
  );
};

export const deleteAnswer = async (answerId) => {
  await getExecutor().query(
    "UPDATE answers SET status = 'deleted', deleted_at = NOW(3) WHERE id = ?",
    [answerId],
  );
};

// 회원당 답변 1행. 취소했던 추천이면 같은 행을 active로 되돌린다 (API 명세 4장, DB 설계서 4.9)
// 새로 추천했으면 true, 이미 추천한 상태였으면 false.
// ON DUPLICATE KEY UPDATE의 insertId는 운영 DB(TiDB)가 기존 행에도 채워 주므로 결과 판단에 쓰지 않고,
// 되돌리기 → 새로 넣기 두 문장으로 나눈다
export const createAnswerVote = async (answerId, userId) => {
  const [restored] = await getExecutor().query(
    `UPDATE answer_votes SET status = 'active'
     WHERE answer_id = ? AND user_id = ? AND status = 'canceled'`,
    [answerId, userId],
  );

  if (restored.affectedRows === 1) {
    return true;
  }

  try {
    await getExecutor().query('INSERT INTO answer_votes (answer_id, user_id) VALUES (?, ?)', [
      answerId,
      userId,
    ]);

    return true;
  } catch (error) {
    // 행이 있는데 canceled가 아니면 이미 추천한 상태다
    if (error.code === 'ER_DUP_ENTRY') {
      return false;
    }

    throw error;
  }
};

// 추천 취소. 행을 지우지 않고 canceled로 바꾼다. 취소할 추천이 있었으면 true
export const deleteAnswerVote = async (answerId, userId) => {
  const [result] = await getExecutor().query(
    `UPDATE answer_votes SET status = 'canceled'
     WHERE answer_id = ? AND user_id = ? AND status = 'active'`,
    [answerId, userId],
  );

  return result.affectedRows === 1;
};

export const countAnswerVotes = async (answerId) => {
  const [rows] = await getExecutor().query(
    "SELECT COUNT(*) AS vote_count FROM answer_votes WHERE answer_id = ? AND status = 'active'",
    [answerId],
  );

  return rows[0].vote_count;
};

export const createAnswerEditHistory = async ({ answerId, editorId, editReason, editedAt }) => {
  await getExecutor().query(
    `INSERT INTO answer_edit_histories (answer_id, editor_id, edit_reason, edited_at)
     VALUES (?, ?, ?, ?)`,
    [answerId, editorId, editReason, editedAt],
  );
};

export const findAnswerEditHistoriesByAnswerId = async (answerId) => {
  const [rows] = await getExecutor().query(
    `SELECT
       h.id,
       h.edit_reason,
       h.edited_at,
       u.id AS editor_id,
       u.nickname AS editor_nickname,
       u.profile_image_url AS editor_profile_image_url,
       u.status AS editor_status
     FROM answer_edit_histories h
     JOIN users u ON u.id = h.editor_id
     WHERE h.answer_id = ?
     ORDER BY h.edited_at DESC, h.id DESC`,
    [answerId],
  );

  return rows;
};

// 회원이 쓴 답변 목록 (API_SPEC 4장 GET /api/answers). 숨김·삭제된 답변과 숨김·삭제된 질문의 답변은 뺀다.
// idx_answers_author_status_created 로 회원의 답변만 읽는다 (DB 설계서 4.7)
const AUTHOR_ANSWERS_FROM = `
  FROM answers a
  JOIN questions q ON q.id = a.question_id
  WHERE a.author_id = ? AND ${VISIBLE_ANSWER}`;

export const findAnswersByAuthorId = async (authorId, { limit, offset }) => {
  const [rows] = await getExecutor().query(
    `SELECT
       a.id,
       a.body,
       a.is_accepted,
       a.created_at,
       q.id AS question_id,
       q.title AS question_title,
       (SELECT COUNT(*) FROM answer_votes v WHERE v.answer_id = a.id AND v.status = 'active')
         AS vote_count
     ${AUTHOR_ANSWERS_FROM}
     ORDER BY a.created_at DESC, a.id DESC
     LIMIT ? OFFSET ?`,
    [authorId, limit, offset],
  );

  return rows;
};

export const countAnswersByAuthorId = async (authorId) => {
  const [rows] = await getExecutor().query(
    `SELECT COUNT(*) AS answer_count ${AUTHOR_ANSWERS_FROM}`,
    [authorId],
  );

  return rows[0].answer_count;
};
