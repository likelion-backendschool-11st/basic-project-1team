import { Router } from 'express';

import { authMiddleware } from '../../common/middleware/auth.middleware.js';

import * as pointController from './point.controller.js';
import { validateGetMyPointHistories } from './point.validator.js';

const router = Router();

// app.js에서 /api/users/me/point-histories 로 등록한다 (API 명세 11장)
router.get('/', authMiddleware, validateGetMyPointHistories, pointController.getMyPointHistories);

export default router;
