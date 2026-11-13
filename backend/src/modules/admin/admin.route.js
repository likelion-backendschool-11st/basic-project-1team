import { Router } from 'express';

import { adminOnly } from './admin.middleware.js';

const router = Router();

// 이 라우터의 모든 관리자 API 는 ADMIN 권한이 필요하다 (API_SPEC 10장)
router.use(adminOnly);

// TODO: 관리자 API 를 기능별로 등록한다 (#56 ~ #63)

export default router;
