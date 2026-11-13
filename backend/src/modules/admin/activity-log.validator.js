import { POSITIVE_INTEGER_PATTERN, throwValidationError } from '../../common/utils/validation.js';

import { ACTIVITY_LOG_ACTION_GROUPS, ACTIVITY_LOG_ACTIONS } from './activity-log.service.js';

const DEFAULT_PAGE = 1;
const DEFAULT_SIZE = 20;
const MAX_SIZE = 100;
const ACTION_FILTERS = [
  ...Object.keys(ACTIVITY_LOG_ACTIONS),
  ...Object.keys(ACTIVITY_LOG_ACTION_GROUPS),
];
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
// 관리자가 고르는 날짜는 한국 날짜로 보고, DB의 UTC 시각과 비교할 범위로 바꾼다
const KST_OFFSET = '+09:00';
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

// 같은 키를 여러 번 보내면 배열이 되므로 문자열 하나만 받는다
const readString = (query, key) => {
  const value = query[key];

  if (value === undefined) {
    return undefined;
  }

  if (typeof value !== 'string') {
    throwValidationError(`${key}는 한 번만 입력할 수 있습니다.`);
  }

  const trimmedValue = value.trim();

  return trimmedValue === '' ? undefined : trimmedValue;
};

const readPositiveInteger = (query, key) => {
  const value = readString(query, key);

  if (value === undefined) {
    return undefined;
  }

  if (!POSITIVE_INTEGER_PATTERN.test(value) || !Number.isSafeInteger(Number(value))) {
    throwValidationError(`${key}는 1 이상의 정수여야 합니다.`);
  }

  return Number(value);
};

const readAction = (query) => {
  const value = readString(query, 'action');

  if (value !== undefined && !ACTION_FILTERS.includes(value)) {
    throwValidationError(
      'action은 활동 로그 action 또는 HIDE, RESTORE, DELETE 중 하나여야 합니다.',
    );
  }

  return value;
};

// 'YYYY-MM-DD'를 그 날 0시(한국 시간)로 바꾼다. 2026-02-30처럼 없는 날짜는 막는다
const readDate = (query, key) => {
  const value = readString(query, key);

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
  const size = readPositiveInteger(req.query, 'size') ?? DEFAULT_SIZE;

  if (size > MAX_SIZE) {
    throwValidationError(`size는 ${MAX_SIZE} 이하여야 합니다.`);
  }

  const startDate = readDate(req.query, 'startDate');
  const endDate = readDate(req.query, 'endDate');

  if (startDate !== undefined && endDate !== undefined && startDate > endDate) {
    throwValidationError('startDate는 endDate보다 늦을 수 없습니다.');
  }

  req.validatedQuery = {
    page: readPositiveInteger(req.query, 'page') ?? DEFAULT_PAGE,
    size,
    adminId: readPositiveInteger(req.query, 'adminId'),
    action: readAction(req.query),
    startAt: startDate,
    // endDate는 그 날 끝까지 포함하므로 다음 날 0시 전까지로 바꾼다
    endAt: endDate === undefined ? undefined : new Date(endDate.getTime() + ONE_DAY_MS),
  };

  next();
};
