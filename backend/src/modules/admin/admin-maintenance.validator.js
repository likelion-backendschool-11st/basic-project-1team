import { readBodyObject, throwValidationError } from '../../common/utils/validation.js';

// 정리 테스트 API의 보관 기간. 생략하면 Service의 기본 보관 기간(7일)을 쓴다 (API 명세 10.9)
export const validateCleanupPasswordResetTokens = (req, _res, next) => {
  const { retentionMinutes } = readBodyObject(req.body);

  if (
    retentionMinutes !== undefined &&
    !(Number.isInteger(retentionMinutes) && retentionMinutes >= 0)
  ) {
    throwValidationError('retentionMinutes는 0 이상의 정수여야 합니다.');
  }

  req.body = retentionMinutes === undefined ? {} : { retentionMinutes };

  next();
};
