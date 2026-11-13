import {
  readPageQuery,
  readQueryPositiveInteger,
  readQueryString,
  throwValidationError,
} from '../../common/utils/validation.js';

import { ACTIVITY_LOG_ACTION_GROUPS, ACTIVITY_LOG_ACTIONS } from './activity-log.service.js';

const ACTION_FILTERS = [
  ...Object.keys(ACTIVITY_LOG_ACTIONS),
  ...Object.keys(ACTIVITY_LOG_ACTION_GROUPS),
];
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
// 관리자가 고르는 날짜는 한국 날짜로 보고, DB의 UTC 시각과 비교할 범위로 바꾼다
const KST_OFFSET = '+09:00';
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

const readAction = (query) => {
  const value = readQueryString(query, 'action');

  if (value !== undefined && !ACTION_FILTERS.includes(value)) {
    throwValidationError(
      'action은 활동 로그 action 또는 HIDE, RESTORE, DELETE 중 하나여야 합니다.',
    );
  }

  return value;
};

// 'YYYY-MM-DD'를 그 날 0시(한국 시간)로 바꾼다. 2026-02-30처럼 없는 날짜는 막는다
const readDate = (query, key) => {
  const value = readQueryString(query, key);

  if (value === undefined) {
    return undefined;
  }

  const date = new Date(`${value}T00:00:00${KST_OFFSET}`);
  const isRealDate =
    DATE_PATTERN.test(value) &&
    !Number.isNaN(date.getTime()) &&
    new Date(date.getTime() + ONE_DAY_MS / 2).toISOString().slice(0, 10) === value;

  if (!isRealDate) {
    throwValidationError(`${key}는 YYYY-MM-DD 형식의 날짜여야 합니다.`);
  }

  return date;
};

// Express 5의 req.query는 읽기 전용이라 검증·변환한 값을 req.validatedQuery에 담는다
export const validateGetActivityLogs = (req, _res, next) => {
  const startDate = readDate(req.query, 'startDate');
  const endDate = readDate(req.query, 'endDate');

  if (startDate !== undefined && endDate !== undefined && startDate > endDate) {
    throwValidationError('startDate는 endDate보다 늦을 수 없습니다.');
  }

  req.validatedQuery = {
    ...readPageQuery(req.query),
    adminId: readQueryPositiveInteger(req.query, 'adminId'),
    action: readAction(req.query),
    startAt: startDate,
    // endDate는 그 날 끝까지 포함하므로 다음 날 0시 전까지로 바꾼다
    endAt: endDate === undefined ? undefined : new Date(endDate.getTime() + ONE_DAY_MS),
  };

  next();
};
