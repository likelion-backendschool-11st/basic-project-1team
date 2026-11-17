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

// 병합 취소인지 미리 본다. 잠그지 않으므로 잠근 뒤 findTagsByIdsForUpdate로 다시 확인한다
export const findTagMergeState = async (tagId) => {
  const [rows] = await getExecutor().query('SELECT status, merged_into_id FROM tags WHERE id = ?', [
    tagId,
  ]);

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

// 이 태그 말고 살아 있는 태그 연결이 없는 질문. 차단·병합된 태그는 연결이 끊겨 있으므로 남은 연결은 사용 중 태그다
const HAS_NO_OTHER_TAG = `NOT EXISTS (
  SELECT 1 FROM question_tags other
  WHERE other.question_id = qt.question_id AND other.tag_id <> qt.tag_id AND other.deleted_at IS NULL
)`;

// 차단 영향 (API 명세 10.5 block-impact). 삭제된 질문은 대체 태그를 붙이지 않으므로 세지 않는다
export const countBlockImpactByTagId = async (tagId) => {
  const [rows] = await getExecutor().query(
    `SELECT COUNT(*) AS question_count, COALESCE(SUM(${HAS_NO_OTHER_TAG}), 0) AS untagged_question_count
     FROM question_tags qt
     JOIN questions q ON q.id = qt.question_id
     WHERE qt.tag_id = ? AND qt.deleted_at IS NULL AND q.status IN ('active', 'hidden')`,
    [tagId],
  );

  return rows[0];
};

// 이 태그를 빼면 태그가 0개가 되는 사용 중·숨김 질문 id (API 명세 10.5 DELETE replaceWith)
export const findUntaggedQuestionIdsByTagId = async (tagId) => {
  const [rows] = await getExecutor().query(
    `SELECT qt.question_id
     FROM question_tags qt
     JOIN questions q ON q.id = qt.question_id
     WHERE qt.tag_id = ? AND qt.deleted_at IS NULL AND q.status IN ('active', 'hidden')
       AND ${HAS_NO_OTHER_TAG}`,
    [tagId],
  );

  return rows.map((row) => row.question_id);
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
    'SELECT id, name, status, merged_into_id FROM tags WHERE id IN (?) ORDER BY id FOR UPDATE',
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

// 병합 이력 1행 (DB 설계서 4.22). 병합 취소에 쓴다
export const createTagMerge = async ({ sourceTagId, targetTagId, mergedBy }) => {
  const [result] = await getExecutor().query(
    'INSERT INTO tag_merges (source_tag_id, target_tag_id, merged_by) VALUES (?, ?, ?)',
    [sourceTagId, targetTagId, mergedBy],
  );

  return result.insertId;
};

// 원본 연결을 끊기 전에 옮길 질문과, 대상 태그를 새로 붙이는지를 남긴다 (DB 설계서 4.23)
export const createTagMergeQuestions = async (mergeId, sourceTagId, targetTagId) => {
  await getExecutor().query(
    `INSERT INTO tag_merge_questions (merge_id, question_id, is_target_added)
     SELECT ?, qt.question_id, NOT EXISTS (
       SELECT 1 FROM question_tags target
       WHERE target.question_id = qt.question_id AND target.tag_id = ? AND target.deleted_at IS NULL
     )
     FROM question_tags qt
     WHERE qt.tag_id = ? AND qt.deleted_at IS NULL`,
    [mergeId, targetTagId, sourceTagId],
  );
};

// 원본 태그에 active 병합은 최대 1건이다 (병합된 태그는 다시 병합할 수 없음)
export const findActiveTagMerge = async (sourceTagId) => {
  const [rows] = await getExecutor().query(
    `SELECT id, target_tag_id FROM tag_merges
     WHERE source_tag_id = ? AND status = 'active'
     ORDER BY id DESC
     LIMIT 1`,
    [sourceTagId],
  );

  return rows[0] ?? null;
};

// 병합 때 옮긴 질문 중 대상 태그 연결이 아직 살아 있는 질문. 병합 뒤 대상 태그를 뺀 질문은 되돌리지 않는다
export const findRestorableMergeQuestions = async (mergeId, targetTagId) => {
  const [rows] = await getExecutor().query(
    `SELECT mq.question_id, mq.is_target_added
     FROM tag_merge_questions mq
     JOIN question_tags qt
       ON qt.question_id = mq.question_id AND qt.tag_id = ? AND qt.deleted_at IS NULL
     WHERE mq.merge_id = ?`,
    [targetTagId, mergeId],
  );

  return rows;
};

// 병합 때 끊은 원본 연결은 행이 남아 있으므로 되돌린다 (DB 설계서 4.11)
export const linkTagToQuestions = async (tagId, questionIds) => {
  await getExecutor().query(
    `INSERT INTO question_tags (question_id, tag_id) VALUES ?
     ON DUPLICATE KEY UPDATE deleted_at = NULL`,
    [questionIds.map((questionId) => [questionId, tagId])],
  );
};

export const unlinkTagFromQuestions = async (tagId, questionIds) => {
  await getExecutor().query(
    `UPDATE question_tags SET deleted_at = CURRENT_TIMESTAMP(3)
     WHERE tag_id = ? AND question_id IN (?) AND deleted_at IS NULL`,
    [tagId, questionIds],
  );
};

export const unmergeTag = async (tagId) => {
  await getExecutor().query(
    "UPDATE tags SET status = 'active', merged_into_id = NULL, merged_at = NULL WHERE id = ?",
    [tagId],
  );
};

// 원본으로 병합돼 있다가 이 병합 때 대상 태그를 가리키게 바뀐 태그를 다시 원본으로 돌린다.
// 그 태그들의 active 병합 이력은 대상이 원본으로 남아 있다 (DB 설계서 4.22)
export const restoreRedirectedTags = async (sourceTagId, targetTagId) => {
  await getExecutor().query(
    `UPDATE tags t
     JOIN tag_merges m ON m.source_tag_id = t.id AND m.status = 'active'
     SET t.merged_into_id = ?
     WHERE t.status = 'merged' AND t.merged_into_id = ? AND m.target_tag_id = ?`,
    [sourceTagId, targetTagId, sourceTagId],
  );
};

export const markTagMergeUndone = async (mergeId, undoneBy) => {
  await getExecutor().query(
    `UPDATE tag_merges SET status = 'undone', undone_by = ?, undone_at = CURRENT_TIMESTAMP(3)
     WHERE id = ?`,
    [undoneBy, mergeId],
  );
};
