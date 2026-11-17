import { Router } from 'express';

import { authMiddleware, sanctionMiddleware } from '../../common/middleware/auth.middleware.js';

import * as reportController from './report.controller.js';
import {
  validateCreateReport,
  validateGetMyReports,
  validateReportId,
} from './report.validator.js';

const router = Router();

// 조회 API라 이용 정지 중에도 볼 수 있다 (API 명세 1.2)
router.get('/me', authMiddleware, validateGetMyReports, reportController.getMyReports);

// 신고·접수 취소는 쓰기 API라 이용 정지는 막고, 글쓰기 제한은 막지 않는다 (API 명세 1.2)
router.post(
  '/',
  authMiddleware,
  sanctionMiddleware('suspend'),
  validateCreateReport,
  reportController.createReport,
);
router.delete(
  '/:reportId',
  authMiddleware,
  sanctionMiddleware('suspend'),
  validateReportId,
  reportController.cancelReport,
);

export default router;
