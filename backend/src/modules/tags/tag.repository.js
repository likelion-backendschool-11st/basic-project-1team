import { escapeLikePattern } from '../../common/utils/sql.js';
import { getExecutor } from '../../config/database.js';

export const findTagsByNames = async (names) => {
  const [rows] = await getExecutor().query(
    'SELECT id, name, status, merged_into_id FROM tags WHERE name IN (?)',
    [names],
  );

  return rows;
};

export const findTagsByIds = async (tagIds) => {
  const [rows] = await getExecutor().query(
    'SELECT id, name, status, merged_into_id FROM tags WHERE id IN (?)',
    [tagIds],
  );

  return rows;
};

// 다른 요청이 같은 이름을 먼저 만들었어도 실패하지 않도록 이름 중복은 무시한다
export const createTags = async (names, createdBy) => {
  await getExecutor().query(
    'INSERT INTO tags (name, created_by) VALUES ? ON DUPLICATE KEY UPDATE name = name',
    [names.map((name) => [name, createdBy])],
  );
};

const ORDER_BY = {
  popular: 'question_count DESC, t.name ASC',
  name: 't.name ASC',
};

// 회원 화면의 태그 목록·자동완성·인기 태그. 차단·병합된 태그는 빼고,
// questionCount는 연결이 살아 있는 사용 중인(active) 질문만 센다 (DB 설계서 5장)
export const findTags = async ({ namePrefix, sort, limit }) => {
  const nameCondition = namePrefix === undefined ? '' : 'AND t.name LIKE ?';

  const [rows] = await getExecutor().query(
    `SELECT t.id, t.name, COUNT(q.id) AS question_count
     FROM tags t
     LEFT JOIN question_tags qt ON qt.tag_id = t.id AND qt.deleted_at IS NULL
     LEFT JOIN questions q ON q.id = qt.question_id AND q.status = 'active'
     WHERE t.status = 'active' ${nameCondition}
     GROUP BY t.id
     ORDER BY ${ORDER_BY[sort]}
     LIMIT ?`,
    [...(namePrefix === undefined ? [] : [`${escapeLikePattern(namePrefix)}%`]), limit],
  );

  return rows;
};
