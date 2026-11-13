import { Router } from 'express';

import { authMiddleware, sanctionMiddleware } from '../../common/middleware/auth.middleware.js';

import * as reportController from './report.controller.js';
import { validateCreateReport } from './report.validator.js';

const router = Router();

// 신고는 쓰기 API라 이용 정지는 막고, 글쓰기 제한은 막지 않는다 (API 명세 1.2)
router.post(
  '/',
  authMiddleware,
  sanctionMiddleware('suspend'),
  validateCreateReport,
  reportController.createReport,
);

export default router;
