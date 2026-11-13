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

// 수정·삭제는 답변 행만 잠그고 상태·작성자·채택 여부를 확인한 뒤 진행한다
export const findAnswerByIdForUpdate = async (answerId) => {
  const [rows] = await getExecutor().query(
    `SELECT a.id, a.author_id, a.status, a.is_accepted, q.status AS question_status
     FROM answers a
     JOIN questions q ON q.id = a.question_id
     WHERE a.id = ?
     FOR UPDATE OF a`,
    [answerId],
  );

  return rows[0] ?? null;
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

export const deleteAnswer = async (answerId) => {
  await getExecutor().query(
    "UPDATE answers SET status = 'deleted', deleted_at = NOW(3) WHERE id = ?",
    [answerId],
  );
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
