import { Router } from 'express';

import * as adminDashboardController from './admin-dashboard.controller.js';

// 관리자 라우터(/api/admin) 아래에 붙으므로 로그인·ADMIN 권한 검사는 거기서 한다
const router = Router();

// 대시보드 현황 (API 명세 10.1)
router.get('/', adminDashboardController.getDashboardStats);

export default router;
