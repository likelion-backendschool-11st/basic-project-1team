import { Router } from 'express';

import { adminMiddleware, authMiddleware } from '../../common/middleware/auth.middleware.js';

import activityLogRouter from './activity-log.route.js';

const router = Router();

// 이 라우터의 모든 관리자 API 는 로그인 + ADMIN 권한이 필요하다 (REQ-ADMIN-001, API_SPEC 1.2·10장)
router.use(authMiddleware, adminMiddleware);

router.use('/activity-logs', activityLogRouter);

// TODO: 관리자 API 를 기능별로 등록한다 (#56 ~ #62)

export default router;
