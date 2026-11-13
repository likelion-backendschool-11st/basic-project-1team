import {
  readBodyObject,
  readPageQuery,
  readQueryEnum,
  readQueryPositiveInteger,
  throwValidationError,
  validateIdParam,
} from '../../common/utils/validation.js';

const STATUSES = ['pending', 'resolved', 'rejected'];
const TARGET_TYPES = ['question', 'answer', 'post', 'comment'];
const REASONS = ['spam', 'abuse', 'illegal', 'spoiler', 'misinformation', 'privacy', 'etc'];
const SANCTION_TYPES = ['suspend', 'write_ban', 'comment_ban'];
const SANCTION_DAYS = [3, 7, 30];

export const validateReportId = validateIdParam('reportId');

// Express 5의 req.query는 읽기 전용이라 검증·변환한 값을 req.validatedQuery에 담는다
export const validateGetReports = (req, _res, next) => {
  req.validatedQuery = {
    ...readPageQuery(req.query),
    // 상태를 보내지 않으면 처리 대기 (API 명세 10.6)
    status: readQueryEnum(req.query, 'status', STATUSES, 'pending'),
    targetType: readQueryEnum(req.query, 'targetType', TARGET_TYPES, undefined),
    reason: readQueryEnum(req.query, 'reason', REASONS, undefined),
    targetAuthorId: readQueryPositiveInteger(req.query, 'targetAuthorId'),
  };

  next();
};

const isPlainObject = (value) =>
  value !== null && typeof value === 'object' && !Array.isArray(value);

// 제재하지 않으면 null, 하면 { type, days } (days: null 은 영구)
const readSanction = (sanction) => {
  if (sanction === null) {
    return null;
  }

  if (!isPlainObject(sanction)) {
    throwValidationError('sanction은 { type, days } 객체 또는 null이어야 합니다.');
  }

  if (!SANCTION_TYPES.includes(sanction.type)) {
    throwValidationError(`sanction.type은 ${SANCTION_TYPES.join(', ')} 중 하나여야 합니다.`);
  }

  if (!('days' in sanction) || (sanction.days !== null && !SANCTION_DAYS.includes(sanction.days))) {
    throwValidationError(
      `sanction.days는 ${SANCTION_DAYS.join(', ')} 또는 null(영구)이어야 합니다.`,
    );
  }

  return { type: sanction.type, days: sanction.days };
};

// 처리(resolved)는 hideTarget·sanction이 필수, 반려(rejected)는 status만 본다 (API 명세 10.6 PATCH)
export const validateProcessReport = (req, _res, next) => {
  const body = readBodyObject(req.body);

  if (body.status === 'rejected') {
    req.body = { status: 'rejected' };
    next();
    return;
  }

  if (body.status !== 'resolved') {
    throwValidationError('status는 resolved 또는 rejected여야 합니다.');
  }

  if (typeof body.hideTarget !== 'boolean') {
    throwValidationError('처리(resolved)할 때 hideTarget은 true 또는 false여야 합니다.');
  }

  if (body.sanction === undefined) {
    throwValidationError(
      '처리(resolved)할 때 sanction을 보내야 합니다. 제재하지 않으면 null입니다.',
    );
  }

  req.body = {
    status: 'resolved',
    hideTarget: body.hideTarget,
    sanction: readSanction(body.sanction),
  };

  next();
};
