import { escapeLikePattern } from '../../common/utils/sql.js';
import { getExecutor } from '../../config/database.js';

const AUTHOR_COLUMNS = `u.id AS author_id,
       u.nickname AS author_nickname,
       u.profile_image_url AS author_profile_image_url,
       u.status AS author_status`;

// 관리 목록은 콘텐츠 종류마다 조인과 계산 값만 다르다. 테이블 별칭은 모두 x (API 명세 10.3·10.4)
const LISTS = {
  question: {
    from: 'questions x JOIN users u ON u.id = x.author_id',
    // answerCount·isAccepted는 저장하지 않고 계산한다 (DB 설계서 5장)
    columns: `x.id, x.title, x.status, x.created_at,
       (SELECT COUNT(*) FROM answers a WHERE a.question_id = x.id AND a.status = 'active')
         AS answer_count,
       EXISTS (SELECT 1 FROM answers a WHERE a.question_id = x.id AND a.is_accepted = 1)
         AS is_accepted`,
    keywordColumns: ['x.title', 'u.nickname'],
  },
  answer: {
    from: `answers x
     JOIN questions q ON q.id = x.question_id
     JOIN users u ON u.id = x.author_id`,
    columns: `x.id, x.body, x.is_accepted, x.status, x.created_at,
       q.id AS question_id, q.title AS question_title`,
    keywordColumns: ['x.body', 'u.nickname'],
  },
  post: {
    from: 'posts x JOIN users u ON u.id = x.author_id',
    columns: `x.id, x.title, x.status, x.created_at,
       (SELECT COUNT(*) FROM comments c WHERE c.post_id = x.id AND c.status = 'active')
         AS comment_count`,
    keywordColumns: ['x.title', 'u.nickname'],
  },
  comment: {
    from: `comments x
     JOIN posts p ON p.id = x.post_id
     JOIN users u ON u.id = x.author_id`,
    columns: 'x.id, x.body, x.status, x.created_at, p.id AS post_id, p.title AS post_title',
    keywordColumns: ['x.body', 'u.nickname'],
  },
};

const TABLES = { question: 'questions', answer: 'answers', post: 'posts', comment: 'comments' };

const buildWhereClause = (type, filter) => {
  const conditions = [];
  const params = [];

  if (filter.id !== undefined) {
    conditions.push('x.id = ?');
    params.push(filter.id);
  } else if (filter.status === undefined) {
    // status를 보내지 않으면 삭제된 항목을 뺀 전체 (API 명세 10.3)
    conditions.push("x.status <> 'deleted'");
  } else {
    conditions.push('x.status = ?');
    params.push(filter.status);
  }

  if (filter.keyword !== undefined) {
    const { keywordColumns } = LISTS[type];
    conditions.push(`(${keywordColumns.map((column) => `${column} LIKE ?`).join(' OR ')})`);
    params.push(...keywordColumns.map(() => `%${escapeLikePattern(filter.keyword)}%`));
  }

  if (filter.authorId !== undefined) {
    conditions.push('x.author_id = ?');
    params.push(filter.authorId);
  }

  // 연결이 살아 있는 태그만 본다 (DB 설계서 4.11)
  if (filter.tag !== undefined) {
    conditions.push(`EXISTS (
      SELECT 1 FROM question_tags qt JOIN tags t ON t.id = qt.tag_id
      WHERE qt.question_id = x.id AND qt.deleted_at IS NULL AND t.name = ?
    )`);
    params.push(filter.tag);
  }

  return { sql: `WHERE ${conditions.join(' AND ')}`, params };
};

export const findContents = async (type, { filter, limit, offset }) => {
  const { from, columns } = LISTS[type];
  const where = buildWhereClause(type, filter);

  const [rows] = await getExecutor().query(
    `SELECT ${columns}, ${AUTHOR_COLUMNS}
     FROM ${from}
     ${where.sql}
     ORDER BY x.created_at DESC, x.id DESC
     LIMIT ? OFFSET ?`,
    [...where.params, limit, offset],
  );

  return rows;
};

export const countContents = async (type, filter) => {
  const { from } = LISTS[type];
  const where = buildWhereClause(type, filter);

  const [rows] = await getExecutor().query(
    `SELECT COUNT(*) AS total_count FROM ${from} ${where.sql}`,
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

// 관리자 상세: 목록에는 없는 본문 (API 명세 10.3·10.4)
export const findContentBodyById = async (type, id) => {
  const [rows] = await getExecutor().query(`SELECT body FROM ${TABLES[type]} WHERE id = ?`, [id]);

  return rows[0]?.body ?? null;
};

// 관리자 질문 상세의 답변: 숨김·삭제 포함, 오래된 순
export const findAnswersByQuestionId = async (questionId) => {
  const [rows] = await getExecutor().query(
    `SELECT x.id, x.body, x.is_accepted, x.status, x.created_at, ${AUTHOR_COLUMNS}
     FROM answers x
     JOIN users u ON u.id = x.author_id
     WHERE x.question_id = ?
     ORDER BY x.created_at ASC, x.id ASC`,
    [questionId],
  );

  return rows;
};

// 관리자 게시글 상세의 댓글: 숨김·삭제 포함, 오래된 순
export const findCommentsByPostId = async (postId) => {
  const [rows] = await getExecutor().query(
    `SELECT x.id, x.body, x.status, x.created_at, ${AUTHOR_COLUMNS}
     FROM comments x
     JOIN users u ON u.id = x.author_id
     WHERE x.post_id = ?
     ORDER BY x.created_at ASC, x.id ASC`,
    [postId],
  );

  return rows;
};

// 다른 관리자의 처리와 겹치지 않도록 대상 행을 잠그고 읽는다
export const findContentByIdForUpdate = async (type, id) => {
  const extraColumns = type === 'answer' ? ', is_accepted' : '';

  const [rows] = await getExecutor().query(
    `SELECT id, status${extraColumns} FROM ${TABLES[type]} WHERE id = ? FOR UPDATE`,
    [id],
  );

  return rows[0] ?? null;
};

// 숨김은 숨긴 시각을 남기고, 복구하면 지운다 (DB 설계서 1.1)
export const updateContentStatus = async (type, id, status) => {
  await getExecutor().query(
    `UPDATE ${TABLES[type]}
     SET status = ?, hidden_at = IF(? = 'hidden', CURRENT_TIMESTAMP(3), NULL)
     WHERE id = ?`,
    [status, status, id],
  );
};

export const deleteContent = async (type, id) => {
  await getExecutor().query(
    `UPDATE ${TABLES[type]} SET status = 'deleted', deleted_at = CURRENT_TIMESTAMP(3) WHERE id = ?`,
    [id],
  );
};

// 채택된 답변을 숨기거나 삭제하면 질문의 채택을 푼다. accepted_at은 기록으로 남긴다 (DB 설계서 4.7)
export const releaseAnswerAcceptance = async (answerId) => {
  await getExecutor().query('UPDATE answers SET is_accepted = 0 WHERE id = ?', [answerId]);
};

export const findUndeletedAnswerIdsByQuestionId = async (questionId) => {
  const [rows] = await getExecutor().query(
    "SELECT id FROM answers WHERE question_id = ? AND status <> 'deleted' FOR UPDATE",
    [questionId],
  );

  return rows.map((row) => row.id);
};

export const deleteAnswersByQuestionId = async (questionId) => {
  await getExecutor().query(
    `UPDATE answers
     SET status = 'deleted', deleted_at = CURRENT_TIMESTAMP(3), is_accepted = 0
     WHERE question_id = ? AND status <> 'deleted'`,
    [questionId],
  );
};

export const deleteQuestionTagsByQuestionId = async (questionId) => {
  await getExecutor().query(
    `UPDATE question_tags SET deleted_at = CURRENT_TIMESTAMP(3)
     WHERE question_id = ? AND deleted_at IS NULL`,
    [questionId],
  );
};

// 함께 삭제한 댓글 수를 돌려준다
export const deleteCommentsByPostId = async (postId) => {
  const [result] = await getExecutor().query(
    `UPDATE comments SET status = 'deleted', deleted_at = CURRENT_TIMESTAMP(3)
     WHERE post_id = ? AND status <> 'deleted'`,
    [postId],
  );

  return result.affectedRows;
};
