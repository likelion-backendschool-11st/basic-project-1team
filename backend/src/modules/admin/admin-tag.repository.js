import { escapeLikePattern } from '../../common/utils/sql.js';
import { getExecutor } from '../../config/database.js';

// questionCount: 연결이 살아 있고 숨김·삭제되지 않은 질문 수 (API 명세 10.5, DB 설계서 5장).
// 차단·병합하면 연결을 끊으므로 자연히 0이 된다
const QUESTION_COUNT = `(
  SELECT COUNT(*)
  FROM question_tags qt
  JOIN questions q ON q.id = qt.question_id
  WHERE qt.tag_id = t.id AND qt.deleted_at IS NULL AND q.status = 'active'
)`;

const ORDER_BY = {
  usage_desc: 'question_count DESC, t.name ASC',
  name_asc: 't.name ASC',
  recent: 't.created_at DESC, t.id DESC',
};

const buildWhereClause = (filter) => {
  const conditions = [];
  const params = [];

  if (filter.id !== undefined) {
    conditions.push('t.id = ?');
    params.push(filter.id);
  }

  if (filter.keyword !== undefined) {
    conditions.push('t.name LIKE ?');
    params.push(`%${escapeLikePattern(filter.keyword)}%`);
  }

  if (filter.status !== undefined) {
    conditions.push('t.status = ?');
    params.push(filter.status);
  }

  return {
    sql: conditions.length === 0 ? '' : `WHERE ${conditions.join(' AND ')}`,
    params,
  };
};

export const findTags = async ({ filter, sort = 'usage_desc', limit, offset }) => {
  const where = buildWhereClause(filter);

  const [rows] = await getExecutor().query(
    `SELECT t.id, t.name, t.description, t.status, t.blocked_at, t.created_at,
       ${QUESTION_COUNT} AS question_count,
       m.id AS merged_into_id, m.name AS merged_into_name
     FROM tags t
     LEFT JOIN tags m ON m.id = t.merged_into_id
     ${where.sql}
     ORDER BY ${ORDER_BY[sort]}
     LIMIT ? OFFSET ?`,
    [...where.params, limit, offset],
  );

  return rows;
};

export const countTags = async (filter) => {
  const where = buildWhereClause(filter);

  const [rows] = await getExecutor().query(
    `SELECT COUNT(*) AS total_count FROM tags t ${where.sql}`,
    where.params,
  );

  return rows[0].total_count;
};

// 이름은 상태와 관계없이 1개다 (DB 설계서 4.10 uk_tags_name)
export const findTagByName = async (name) => {
  const [rows] = await getExecutor().query('SELECT id, status FROM tags WHERE name = ?', [name]);

  return rows[0] ?? null;
};

// 다른 관리자의 수정·삭제와 겹치지 않도록 태그 행을 잠그고 읽는다
export const findTagByIdForUpdate = async (tagId) => {
  const [rows] = await getExecutor().query(
    'SELECT id, name, description, status FROM tags WHERE id = ? FOR UPDATE',
    [tagId],
  );

  return rows[0] ?? null;
};

export const createTag = async ({ name, description, createdBy }) => {
  const [result] = await getExecutor().query(
    'INSERT INTO tags (name, description, created_by) VALUES (?, ?, ?)',
    [name, description, createdBy],
  );

  return result.insertId;
};

export const updateTag = async (tagId, { name, description }) => {
  await getExecutor().query('UPDATE tags SET name = ?, description = ? WHERE id = ?', [
    name,
    description,
    tagId,
  ]);
};

// 삭제 = 차단. 행은 남겨 같은 이름을 다시 만들지 못하게 한다 (REQ-ADMIN-010)
export const blockTag = async (tagId) => {
  await getExecutor().query(
    "UPDATE tags SET status = 'blocked', blocked_at = CURRENT_TIMESTAMP(3) WHERE id = ?",
    [tagId],
  );
};

export const unblockTag = async (tagId) => {
  await getExecutor().query("UPDATE tags SET status = 'active', blocked_at = NULL WHERE id = ?", [
    tagId,
  ]);
};

// 질문은 남기고 태그 연결만 끊는다. 끊은 연결 수를 돌려준다 (API 명세 10.5 DELETE)
export const deleteQuestionTagsByTagId = async (tagId) => {
  const [result] = await getExecutor().query(
    `UPDATE question_tags SET deleted_at = CURRENT_TIMESTAMP(3)
     WHERE tag_id = ? AND deleted_at IS NULL`,
    [tagId],
  );

  return result.affectedRows;
};

// 병합할 두 태그를 id 순서로 잠근다. 같은 두 태그를 반대로 병합하는 요청이 동시에 와도 교착되지 않게 한다
export const findTagsByIdsForUpdate = async (tagIds) => {
  const [rows] = await getExecutor().query(
    'SELECT id, name, status FROM tags WHERE id IN (?) ORDER BY id FOR UPDATE',
    [tagIds],
  );

  return rows;
};

// 원본 태그가 붙은 질문에 대상 태그를 붙인다. 이미 붙어 있으면 그대로 두고, 예전에 끊긴 대상 태그 행이
// 있으면 새로 만들지 않고 되돌린다 (DB 설계서 4.11 병합). 원본 연결은 deleteQuestionTagsByTagId로 끊는다
export const linkQuestionsOfTagToTag = async (sourceTagId, targetTagId) => {
  await getExecutor().query(
    `INSERT INTO question_tags (question_id, tag_id)
     SELECT qt.question_id, ? FROM question_tags qt
     WHERE qt.tag_id = ? AND qt.deleted_at IS NULL
     ON DUPLICATE KEY UPDATE deleted_at = NULL`,
    [targetTagId, sourceTagId],
  );
};

// 원본은 지우지 않고 merged로 남겨, 이후 이 이름을 쓰면 대상 태그로 저장되게 한다 (API 명세 10.5)
export const mergeTagInto = async (sourceTagId, targetTagId) => {
  await getExecutor().query(
    `UPDATE tags SET status = 'merged', merged_into_id = ?, merged_at = CURRENT_TIMESTAMP(3)
     WHERE id = ?`,
    [targetTagId, sourceTagId],
  );
};

// 원본으로 이미 병합돼 있던 태그들도 새 대상을 바로 가리키게 해 병합 단계를 1번으로 유지한다
export const updateMergedIntoId = async (fromTagId, toTagId) => {
  await getExecutor().query(
    "UPDATE tags SET merged_into_id = ? WHERE merged_into_id = ? AND status = 'merged'",
    [toTagId, fromTagId],
  );
};
