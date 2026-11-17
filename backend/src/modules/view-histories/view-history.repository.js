import { getExecutor } from '../../config/database.js';

// 대상·조회자별 1행을 두고, 마지막 조회가 intervalHours보다 오래됐을 때만 시각을 갱신한다.
// 새로 넣었거나 갱신했으면 true (DB 설계서 4.18).
// ON DUPLICATE KEY UPDATE의 insertId는 운영 DB(TiDB)가 기존 행에도 채워 주므로 결과 판단에 쓰지 않고,
// 갱신 → 새로 넣기 두 문장으로 나눈다. 각 문장이 한 행에만 적용되므로 동시에 조회해도 한 번만 센다
export const createViewHistory = async ({ targetType, targetId, viewerKey, intervalHours }) => {
  const [updated] = await getExecutor().query(
    `UPDATE view_histories SET last_viewed_at = NOW(3)
     WHERE target_type = ? AND target_id = ? AND viewer_key = ?
       AND last_viewed_at <= NOW(3) - INTERVAL ? HOUR`,
    [targetType, targetId, viewerKey, intervalHours],
  );

  if (updated.affectedRows === 1) {
    return true;
  }

  try {
    await getExecutor().query(
      `INSERT INTO view_histories (target_type, target_id, viewer_key, last_viewed_at)
       VALUES (?, ?, ?, NOW(3))`,
      [targetType, targetId, viewerKey],
    );

    return true;
  } catch (error) {
    // 이미 기록이 있으면 intervalHours 안에 다시 본 것이다
    if (error.code === 'ER_DUP_ENTRY') {
      return false;
    }

    throw error;
  }
};
