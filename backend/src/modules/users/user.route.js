import { Router } from 'express';

import { authMiddleware } from '../../common/middleware/auth.middleware.js';

import * as userController from './user.controller.js';
import { validateChangePassword, validateGetAvailability } from './user.validator.js';

const router = Router();

router.get('/availability', validateGetAvailability, userController.getAvailability);
router.patch('/me/password', authMiddleware, validateChangePassword, userController.changePassword);

export default router;
