import { Router } from 'express';

import { authMiddleware, sanctionMiddleware } from '../../common/middleware/auth.middleware.js';

import * as attachmentController from './attachment.controller.js';
import {
  parseAttachmentUpload,
  validateAttachmentId,
  validateUploadAttachment,
} from './attachment.validator.js';

const router = Router();

// 업로드·삭제는 쓰기 API라 이용 정지는 막고, 글쓰기 제한은 막지 않는다 (신고 증빙은 제한 중에도 올림, API 명세 1.2)
// 인증을 먼저 확인해 로그인하지 않은 요청의 파일은 읽지 않는다
router.post(
  '/',
  authMiddleware,
  sanctionMiddleware('suspend'),
  parseAttachmentUpload,
  validateUploadAttachment,
  attachmentController.uploadAttachment,
);
router.delete(
  '/:attachmentId',
  authMiddleware,
  sanctionMiddleware('suspend'),
  validateAttachmentId,
  attachmentController.deleteAttachment,
);

export default router;
