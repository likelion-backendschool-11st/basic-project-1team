import { getExecutor } from '../../config/database.js';

const ORDER_BY = {
  latest: 'q.created_at DESC, q.id DESC',
  views: 'q.view_count DESC, q.created_at DESC, q.id DESC',
};

const HAS_ACTIVE_ANSWER = `EXISTS (
  SELECT 1 FROM answers a WHERE a.question_id = q.id AND a.status = 'active'
)`;

// 채택된 답변을 숨기거나 삭제하면 is_accepted가 0이 되므로 답변 상태는 따로 보지 않는다
const HAS_ACCEPTED_ANSWER = `EXISTS (
  SELECT 1 FROM answers a WHERE a.question_id = q.id AND a.is_accepted = 1
)`;

const tagNameMatches = (operator) => `EXISTS (
  SELECT 1
  FROM question_tags qt
  JOIN tags t ON t.id = qt.tag_id
  WHERE qt.question_id = q.id AND qt.deleted_at IS NULL AND t.name ${operator} ?
)`;

const escapeLike = (value) => `%${value.replace(/[\\%_]/g, '\\$&')}%`;

const buildKeywordCondition = (scope, keyword, tagKeyword) => {
  const conditions = {
    title: { sql: 'q.title LIKE ?', params: [escapeLike(keyword)] },
    tag: { sql: tagNameMatches('LIKE'), params: [escapeLike(tagKeyword)] },
    author: { sql: 'u.nickname LIKE ?', params: [escapeLike(keyword)] },
  };

  if (scope !== 'all') {
    return conditions[scope];
  }

  const all = Object.values(conditions);

  return {
    sql: `(${all.map((condition) => condition.sql).join(' OR ')})`,
    params: all.flatMap((condition) => condition.params),
  };
};

const buildWhereClause = (filter) => {
  const conditions = ["q.status = 'active'"];
  const params = [];

  if (filter.keyword !== undefined) {
    const condition = buildKeywordCondition(filter.scope, filter.keyword, filter.tagKeyword);
    conditions.push(condition.sql);
    params.push(...condition.params);
  }

  if (filter.tag !== undefined) {
    conditions.push(tagNameMatches('='));
    params.push(filter.tag);
  }

  if (filter.hasAnswer !== undefined) {
    conditions.push(filter.hasAnswer ? HAS_ACTIVE_ANSWER : `NOT ${HAS_ACTIVE_ANSWER}`);
  }

  if (filter.isAccepted !== undefined) {
    conditions.push(filter.isAccepted ? HAS_ACCEPTED_ANSWER : `NOT ${HAS_ACCEPTED_ANSWER}`);
  }

  if (filter.authorId !== undefined) {
    conditions.push('q.author_id = ?');
    params.push(filter.authorId);
  }

  if (filter.answerAuthorId !== undefined) {
    conditions.push(`EXISTS (
      SELECT 1 FROM answers a
      WHERE a.question_id = q.id AND a.author_id = ? AND a.status = 'active'
    )`);
    params.push(filter.answerAuthorId);
  }

  return { sql: `WHERE ${conditions.join(' AND ')}`, params };
};

export const findQuestions = async ({ filter, sort, limit, offset }) => {
  const where = buildWhereClause(filter);

  const [rows] = await getExecutor().query(
    `SELECT
       q.id,
       q.title,
       q.view_count,
       q.created_at,
       u.id AS author_id,
       u.nickname AS author_nickname,
       u.profile_image_url AS author_profile_image_url,
       u.status AS author_status,
       (SELECT COUNT(*) FROM answers a WHERE a.question_id = q.id AND a.status = 'active')
         AS answer_count,
       ${HAS_ACCEPTED_ANSWER} AS is_accepted
     FROM questions q
     JOIN users u ON u.id = q.author_id
     ${where.sql}
     ORDER BY ${ORDER_BY[sort]}
     LIMIT ? OFFSET ?`,
    [...where.params, limit, offset],
  );

  return rows;
};

export const countQuestions = async (filter) => {
  const where = buildWhereClause(filter);

  const [rows] = await getExecutor().query(
    `SELECT COUNT(*) AS total_count
     FROM questions q
     JOIN users u ON u.id = q.author_id
     ${where.sql}`,
    where.params,
  );

  return rows[0].total_count;
};

export const findTagNamesByQuestionIds = async (questionIds) => {
  if (questionIds.length === 0) {
    return [];
  }

  const [rows] = await getExecutor().query(
    `SELECT qt.question_id, t.name
     FROM question_tags qt
     JOIN tags t ON t.id = qt.tag_id
     WHERE qt.question_id IN (?) AND qt.deleted_at IS NULL
     ORDER BY qt.question_id, qt.id`,
    [questionIds],
  );

  return rows;
};

export const findQuestionById = async (questionId) => {
  const [rows] = await getExecutor().query(
    `SELECT
       q.id,
       q.title,
       q.body,
       q.view_count,
       q.edited_at,
       q.created_at,
       q.updated_at,
       u.id AS author_id,
       u.nickname AS author_nickname,
       u.profile_image_url AS author_profile_image_url,
       u.status AS author_status,
       (SELECT COUNT(*) FROM answers a WHERE a.question_id = q.id AND a.status = 'active')
         AS answer_count,
       ${HAS_ACCEPTED_ANSWER} AS is_accepted
     FROM questions q
     JOIN users u ON u.id = q.author_id
     WHERE q.id = ? AND q.status = 'active'`,
    [questionId],
  );

  return rows[0] ?? null;
};

// 수정·삭제는 질문 행을 잠그고 상태와 작성자를 확인한 뒤 진행한다
export const findQuestionByIdForUpdate = async (questionId) => {
  const [rows] = await getExecutor().query(
    'SELECT id, author_id, status FROM questions WHERE id = ? FOR UPDATE',
    [questionId],
  );

  return rows[0] ?? null;
};

export const createQuestion = async ({ authorId, title, body }) => {
  const [result] = await getExecutor().query(
    'INSERT INTO questions (author_id, title, body) VALUES (?, ?, ?)',
    [authorId, title, body],
  );

  return result.insertId;
};

export const updateQuestion = async (questionId, { title, body, editedAt }) => {
  const columns = { title, body, edited_at: editedAt };
  const entries = Object.entries(columns).filter(([, value]) => value !== undefined);

  await getExecutor().query(
    `UPDATE questions SET ${entries.map(([column]) => `${column} = ?`).join(', ')} WHERE id = ?`,
    [...entries.map(([, value]) => value), questionId],
  );
};

export const deleteQuestion = async (questionId) => {
  await getExecutor().query(
    "UPDATE questions SET status = 'deleted', deleted_at = NOW(3) WHERE id = ?",
    [questionId],
  );
};

// 숨김 답변도 센다. 질문과 함께 사라지면 신고·제재 근거가 없어지기 때문이다 (API 명세 3장)
export const countUndeletedAnswersByQuestionId = async (questionId) => {
  const [rows] = await getExecutor().query(
    `SELECT COUNT(*) AS answer_count
     FROM answers
     WHERE question_id = ? AND status IN ('active', 'hidden')`,
    [questionId],
  );

  return rows[0].answer_count;
};

// 끊긴 연결도 unique에 포함되므로 같은 행을 되살린다 (DB 설계서 4.11)
export const createQuestionTags = async (questionId, tagIds) => {
  await getExecutor().query(
    `INSERT INTO question_tags (question_id, tag_id) VALUES ?
     ON DUPLICATE KEY UPDATE deleted_at = NULL`,
    [tagIds.map((tagId) => [questionId, tagId])],
  );
};

export const deleteQuestionTagsExceptTagIds = async (questionId, tagIds) => {
  await getExecutor().query(
    `UPDATE question_tags
     SET deleted_at = NOW(3)
     WHERE question_id = ? AND deleted_at IS NULL AND tag_id NOT IN (?)`,
    [questionId, tagIds],
  );
};

export const deleteQuestionTagsByQuestionId = async (questionId) => {
  await getExecutor().query(
    'UPDATE question_tags SET deleted_at = NOW(3) WHERE question_id = ? AND deleted_at IS NULL',
    [questionId],
  );
};

export const createQuestionEditHistory = async ({ questionId, editorId, editReason, editedAt }) => {
  await getExecutor().query(
    `INSERT INTO question_edit_histories (question_id, editor_id, edit_reason, edited_at)
     VALUES (?, ?, ?, ?)`,
    [questionId, editorId, editReason, editedAt],
  );
};

export const findQuestionEditHistoriesByQuestionId = async (questionId) => {
  const [rows] = await getExecutor().query(
    `SELECT
       h.id,
       h.edit_reason,
       h.edited_at,
       u.id AS editor_id,
       u.nickname AS editor_nickname,
       u.profile_image_url AS editor_profile_image_url,
       u.status AS editor_status
     FROM question_edit_histories h
     JOIN users u ON u.id = h.editor_id
     WHERE h.question_id = ?
     ORDER BY h.edited_at DESC, h.id DESC`,
    [questionId],
  );

  return rows;
};

export const updateQuestionViewCount = async (questionId) => {
  await getExecutor().query('UPDATE questions SET view_count = view_count + 1 WHERE id = ?', [
    questionId,
  ]);
};

// 태그가 하나 이상 겹치는 질문을 겹치는 태그 수가 많은 순으로 (API 명세 3장 관련 질문)
export const findRelatedQuestionsByQuestionId = async (questionId, limit) => {
  const [rows] = await getExecutor().query(
    `SELECT
       q.id,
       q.title,
       q.created_at,
       (SELECT COUNT(*) FROM answers a WHERE a.question_id = q.id AND a.status = 'active')
         AS answer_count,
       ${HAS_ACCEPTED_ANSWER} AS is_accepted,
       COUNT(*) AS shared_tag_count
     FROM question_tags base
     JOIN question_tags qt
       ON qt.tag_id = base.tag_id AND qt.question_id <> base.question_id AND qt.deleted_at IS NULL
     JOIN questions q ON q.id = qt.question_id AND q.status = 'active'
     WHERE base.question_id = ? AND base.deleted_at IS NULL
     GROUP BY q.id
     ORDER BY shared_tag_count DESC, q.created_at DESC, q.id DESC
     LIMIT ?`,
    [questionId, limit],
  );

  return rows;
};
