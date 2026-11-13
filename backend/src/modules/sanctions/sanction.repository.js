import { getExecutor } from '../../config/database.js';

// 걸려 있는 제재 = 해제되지 않았고 영구이거나 아직 끝나지 않은 제재 (docs/04-db-design.md 4.3)
export const findActiveSanctionsByUserId = async (userId, types) => {
  const [rows] = await getExecutor().query(
    `SELECT type, ends_at
     FROM user_sanctions
     WHERE user_id = ?
       AND type IN (?)
       AND released_at IS NULL
       AND (ends_at IS NULL OR ends_at > NOW(3))`,
    [userId, types],
  );

  return rows;
};
