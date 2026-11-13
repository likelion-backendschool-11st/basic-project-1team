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
