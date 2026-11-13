import { BadRequestError } from '../../common/error/http-errors.js';

export const COMMENT_MAX_LENGTH = 500;

/** 댓글은 에디터 없는 일반 텍스트, 1~500자 (API_SPEC 1.9) */
export const validateCreateComment = (req, _res, next) => {
  const body = req.body?.body;

  if (typeof body !== 'string') {
    throw new BadRequestError('VALIDATION_ERROR', '댓글 내용을 입력해주세요.');
  }

  const length = [...body.trim()].length;

  if (length < 1 || length > COMMENT_MAX_LENGTH) {
    throw new BadRequestError(
      'VALIDATION_ERROR',
      `댓글은 1~${COMMENT_MAX_LENGTH}자로 입력해주세요.`,
    );
  }

  next();
};
