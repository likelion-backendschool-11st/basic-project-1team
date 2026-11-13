import { Router } from 'express';

import * as adminNoticeController from './admin-notice.controller.js';
import {
  validateCreateNotice,
  validateGetNotices,
  validateNoticeId,
  validateUpdateNotice,
} from './admin-notice.validator.js';

// 관리자 라우터(/api/admin) 아래에 붙으므로 로그인·ADMIN 권한 검사는 거기서 한다
const router = Router();

// 공지 관리 (API 명세 10.7)
router.get('/', validateGetNotices, adminNoticeController.getNotices);
router.post('/', validateCreateNotice, adminNoticeController.createNotice);
router.patch(
  '/:noticeId',
  validateNoticeId,
  validateUpdateNotice,
  adminNoticeController.updateNotice,
);
router.delete('/:noticeId', validateNoticeId, adminNoticeController.deleteNotice);

export default router;
