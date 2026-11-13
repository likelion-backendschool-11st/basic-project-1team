import multer from 'multer';

import { BadRequestError } from '../../common/error/http-errors.js';
import { throwValidationError, validateIdParam } from '../../common/utils/validation.js';

const PURPOSES = ['editor_image', 'report_evidence'];
// 파일당 최대 10MB (API 명세 6장)
const MAX_FILE_SIZE = 10 * 1024 * 1024;

const upload = multer({
  storage: multer.memoryStorage(),
  // 한글 파일명이 깨지지 않게 multipart 헤더를 UTF-8로 읽는다
  defParamCharset: 'utf8',
  limits: { fileSize: MAX_FILE_SIZE, files: 1, fields: 5 },
}).single('file');

export const validateAttachmentId = validateIdParam('attachmentId');

// multipart/form-data의 file 필드를 메모리로 읽는다. multer 오류는 API 에러 코드로 바꾼다
export const parseAttachmentUpload = (req, res, next) => {
  upload(req, res, (error) => {
    if (error === undefined) {
      next();
      return;
    }

    if (error.code === 'LIMIT_FILE_SIZE') {
      next(new BadRequestError('FILE_TOO_LARGE', '파일은 10MB 이하만 올릴 수 있습니다.'));
      return;
    }

    if (error instanceof multer.MulterError) {
      next(new BadRequestError('VALIDATION_ERROR', '파일은 file 필드에 1개만 올릴 수 있습니다.'));
      return;
    }

    next(new BadRequestError('VALIDATION_ERROR', '파일 업로드 요청 형식이 올바르지 않습니다.'));
  });
};

export const validateUploadAttachment = (req, _res, next) => {
  if (req.file === undefined) {
    throwValidationError('file은 필수입니다. multipart/form-data로 파일 1개를 보내 주세요.');
  }

  const purpose = req.body?.purpose;

  if (!PURPOSES.includes(purpose)) {
    throwValidationError(`purpose는 ${PURPOSES.join(', ')} 중 하나여야 합니다.`);
  }

  req.body = { purpose, file: req.file };

  next();
};
