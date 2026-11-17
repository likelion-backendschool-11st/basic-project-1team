import { Router } from 'express';

import * as authController from './auth.controller.js';
import {
  validateFindUsername,
  validateLogin,
  validateResetPassword,
  validateSignup,
  validateVerifyPasswordReset,
} from './auth.validator.js';

const router = Router();

router.post('/signup', validateSignup, authController.signup);
router.post('/login', validateLogin, authController.login);
router.post('/find-username', validateFindUsername, authController.findUsername);
router.post(
  '/password-reset/verify',
  validateVerifyPasswordReset,
  authController.verifyPasswordReset,
);
router.post('/password-reset', validateResetPassword, authController.resetPassword);

export default router;
