import { getExecutor } from '../../config/database.js';

// 대상·조회자별 1행을 두고, 마지막 조회가 intervalHours보다 오래됐을 때만 시각을 갱신한다.
// 새로 넣었거나 갱신했으면 true (DB 설계서 4.18)
export const createViewHistory = async ({ targetType, targetId, viewerKey, intervalHours }) => {
  const [result] = await getExecutor().query(
    `INSERT INTO view_histories (target_type, target_id, viewer_key, last_viewed_at)
     VALUES (?, ?, ?, NOW(3))
     ON DUPLICATE KEY UPDATE last_viewed_at = IF(
       last_viewed_at <= NOW(3) - INTERVAL ? HOUR, NOW(3), last_viewed_at
     )`,
    [targetType, targetId, viewerKey, intervalHours],
  );

  // mysql2는 FOUND_ROWS 플래그로 접속해 새로 넣은 경우와 그대로 둔 경우가 모두 affectedRows 1이다.
  // 새로 넣은 경우만 insertId가 있으므로 함께 본다. 갱신한 경우는 affectedRows 2
  return result.affectedRows === 2 || result.insertId !== 0;
};
