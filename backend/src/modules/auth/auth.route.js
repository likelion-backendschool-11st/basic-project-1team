import { Router } from 'express';

import * as authController from './auth.controller.js';
import { validateFindUsername, validateLogin } from './auth.validator.js';

const router = Router();

router.post('/login', validateLogin, authController.login);
router.post('/find-username', validateFindUsername, authController.findUsername);

export default router;
