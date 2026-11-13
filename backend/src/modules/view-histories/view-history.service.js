import * as viewHistoryRepository from './view-history.repository.js';

// 같은 회원(비회원은 IP)이 24시간 안에 다시 조회하면 조회수를 올리지 않는다 (REQ-QNA-015, REQ-BOARD-011)
const VIEW_COUNT_INTERVAL_HOURS = 24;

// 회원 id와 IP를 한 컬럼에 담는다. 나누면 한쪽이 NULL이라 unique 제약이 동작하지 않는다 (DB 설계서 4.18)
const toViewerKey = ({ userId, ip }) => (userId === undefined ? `ip:${ip}` : `u:${userId}`);

// 조회를 기록하고, 조회수를 올려야 하면 true를 돌려준다
export const recordView = async (targetType, targetId, viewer) =>
  viewHistoryRepository.createViewHistory({
    targetType,
    targetId,
    viewerKey: toViewerKey(viewer),
    intervalHours: VIEW_COUNT_INTERVAL_HOURS,
  });
