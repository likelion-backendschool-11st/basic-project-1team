import { Router } from 'express';

import * as adminReportController from './admin-report.controller.js';
import {
  validateGetReports,
  validateProcessReport,
  validateReportId,
} from './admin-report.validator.js';

// 관리자 라우터(/api/admin) 아래에 붙으므로 로그인·ADMIN 권한 검사는 거기서 한다
const router = Router();

// 신고 관리 (API 명세 10.6)
router.get('/', validateGetReports, adminReportController.getReports);
router.get('/:reportId', validateReportId, adminReportController.getReportById);
router.patch(
  '/:reportId',
  validateReportId,
  validateProcessReport,
  adminReportController.processReport,
);

export default router;
