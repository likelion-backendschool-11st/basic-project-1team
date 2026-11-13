import { BadRequestError } from '../../common/error/http-errors.js';
import { countCharacters } from '../../common/utils/html.js';
import { readBodyObject, throwValidationError } from '../../common/utils/validation.js';

// API 명세 8장 공통 Enum
const TARGET_TYPES = ['question', 'answer', 'post', 'comment'];
const REASONS = ['spam', 'abuse', 'illegal', 'spoiler', 'misinformation', 'privacy', 'etc'];
const DETAIL_MAX_LENGTH = 1000;
const ATTACHMENT_MAX_COUNT = 3;

const readRequiredEnum = (value, key, allowedValues) => {
  if (!allowedValues.includes(value)) {
    throwValidationError(`${key}는 ${allowedValues.join(', ')} 중 하나여야 합니다.`);
  }

  return value;
};

const isPositiveInteger = (value) => Number.isSafeInteger(value) && value >= 1;

const readTargetId = (targetId) => {
  if (!isPositiveInteger(targetId)) {
    throwValidationError('targetId는 1 이상의 정수여야 합니다.');
  }

  return targetId;
};

// 일반 텍스트 상세 사유. 빈 값이면 null로 저장하고, reason이 etc면 필수다
const readDetail = (detail, reason) => {
  if (detail !== undefined && detail !== null && typeof detail !== 'string') {
    throwValidationError('detail은 문자열이어야 합니다.');
  }

  const trimmedDetail = detail?.trim() ?? '';

  if (countCharacters(trimmedDetail) > DETAIL_MAX_LENGTH) {
    throwValidationError(`detail은 ${DETAIL_MAX_LENGTH}자 이하여야 합니다.`);
  }

  if (reason === 'etc' && trimmedDetail === '') {
    throwValidationError('기타 사유는 상세 사유를 입력해야 합니다.');
  }

  return trimmedDetail === '' ? null : trimmedDetail;
};

// 같은 파일을 여러 번 보내면 한 번만 연결한다
const readAttachmentIds = (attachmentIds) => {
  if (attachmentIds === undefined || attachmentIds === null) {
    return [];
  }

  if (!Array.isArray(attachmentIds) || !attachmentIds.every(isPositiveInteger)) {
    throwValidationError('attachmentIds는 1 이상의 정수 배열이어야 합니다.');
  }

  const uniqueAttachmentIds = [...new Set(attachmentIds)];

  if (uniqueAttachmentIds.length > ATTACHMENT_MAX_COUNT) {
    throw new BadRequestError(
      'ATTACHMENT_LIMIT_EXCEEDED',
      `증빙 파일은 ${ATTACHMENT_MAX_COUNT}개까지 첨부할 수 있습니다.`,
    );
  }

  return uniqueAttachmentIds;
};

export const validateCreateReport = (req, _res, next) => {
  const body = readBodyObject(req.body);
  const reason = readRequiredEnum(body.reason, 'reason', REASONS);

  req.body = {
    targetType: readRequiredEnum(body.targetType, 'targetType', TARGET_TYPES),
    targetId: readTargetId(body.targetId),
    reason,
    detail: readDetail(body.detail, reason),
    attachmentIds: readAttachmentIds(body.attachmentIds),
  };

  next();
};
