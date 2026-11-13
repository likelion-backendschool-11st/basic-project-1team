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
