import { Router } from 'express';

import * as authController from './auth.controller.js';
import { validateLogin } from './auth.validator.js';

const router = Router();

router.post('/login', validateLogin, authController.login);

export default router;
