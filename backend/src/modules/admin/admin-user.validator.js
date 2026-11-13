import {
  readBodyObject,
  readPageQuery,
  readQueryEnum,
  readQueryString,
  throwValidationError,
  validateIdParam,
} from '../../common/utils/validation.js';

const STATUSES = ['active', 'restricted', 'suspended', 'withdrawn'];
const ROLES = ['USER', 'ADMIN'];
const SORTS = ['newest', 'oldest'];
// 요청 본문은 camelCase, DB·응답의 제재 type은 snake_case (API 명세 1.2, 10.2)
const SANCTION_TYPES = { suspend: 'suspend', writeBan: 'write_ban', commentBan: 'comment_ban' };
const SANCTION_DAYS = [3, 7, 30];
const REASON_MAX_LENGTH = 200;

export const validateUserId = validateIdParam('userId');

// Express 5의 req.query는 읽기 전용이라 검증·변환한 값을 req.validatedQuery에 담는다
export const validateGetUsers = (req, _res, next) => {
  req.validatedQuery = {
    ...readPageQuery(req.query),
    keyword: readQueryString(req.query, 'keyword'),
    status: readQueryEnum(req.query, 'status', STATUSES, undefined),
    role: readQueryEnum(req.query, 'role', ROLES, undefined),
    sort: readQueryEnum(req.query, 'sort', SORTS, 'newest'),
  };

  next();
};

const isPlainObject = (value) =>
  value !== null && typeof value === 'object' && !Array.isArray(value);

const readReason = (reason) => {
  if (typeof reason !== 'string') {
    throwValidationError('reason은 문자열이어야 합니다.');
  }

  const trimmedReason = reason.trim();
  const length = Array.from(trimmedReason).length;

  if (length < 1 || length > REASON_MAX_LENGTH) {
    throwValidationError(`reason은 1~${REASON_MAX_LENGTH}자여야 합니다.`);
  }

  return trimmedReason;
};

// { suspend | writeBan | commentBan: { days } | null } 중 정확히 1종류 (API 명세 10.2)
const readSanction = (sanctions) => {
  if (!isPlainObject(sanctions)) {
    throwValidationError('sanctions는 객체여야 합니다.');
  }

  const keys = Object.keys(sanctions);

  if (keys.length !== 1 || SANCTION_TYPES[keys[0]] === undefined) {
    throwValidationError(
      `sanctions에는 ${Object.keys(SANCTION_TYPES).join(', ')} 중 1종류만 넣어야 합니다.`,
    );
  }

  const [key] = keys;
  const value = sanctions[key];
  const type = SANCTION_TYPES[key];

  if (value === null) {
    return { action: 'release', type };
  }

  if (!isPlainObject(value) || !('days' in value)) {
    throwValidationError(`sanctions.${key}는 { days } 객체 또는 null이어야 합니다.`);
  }

  if (value.days !== null && !SANCTION_DAYS.includes(value.days)) {
    throwValidationError(
      `sanctions.${key}.days는 ${SANCTION_DAYS.join(', ')} 또는 null(영구)이어야 합니다.`,
    );
  }

  return { action: 'apply', type, days: value.days };
};

// 한 번에 sanctions와 permissions 중 하나만 보낸다 (API 명세 10.2 PATCH)
export const validateUpdateUser = (req, _res, next) => {
  const body = readBodyObject(req.body);
  const hasSanctions = body.sanctions !== undefined;
  const hasPermissions = body.permissions !== undefined;

  if (hasSanctions && hasPermissions) {
    throwValidationError('sanctions와 permissions는 함께 보낼 수 없습니다.');
  }

  if (hasPermissions) {
    // TODO: 게시물·댓글 관리 권한 부여·회수 (선택·후순위, REQ-ADMIN-004) (#57)
    throwValidationError('관리 권한 변경(permissions)은 아직 지원하지 않습니다.');
  }

  if (!hasSanctions) {
    throwValidationError('sanctions를 보내야 합니다.');
  }

  req.body = { ...readSanction(body.sanctions), reason: readReason(body.reason) };

  next();
};
