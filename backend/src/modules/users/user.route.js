import { Router } from 'express';

import { authMiddleware, sanctionMiddleware } from '../../common/middleware/auth.middleware.js';

import * as userController from './user.controller.js';
import {
  parseProfileImageUpload,
  validateChangePassword,
  validateGetAvailability,
  validateUpdateMe,
  validateUploadProfileImage,
  validateUserId,
  validateWithdrawUser,
} from './user.validator.js';

const router = Router();

router.get('/availability', validateGetAvailability, userController.getAvailability);

// 내 프로필. /:userId보다 먼저 등록해야 'me'가 회원 id로 읽히지 않는다
router.get('/me', authMiddleware, userController.getMe);
// 소개글·프로필 사진은 다른 회원에게 보이는 쓰기라 이용 정지는 막는다 (API 명세 1.2)
router.patch(
  '/me',
  authMiddleware,
  sanctionMiddleware('suspend'),
  validateUpdateMe,
  userController.updateMe,
);
// 인증을 먼저 확인해 로그인하지 않은 요청의 파일은 읽지 않는다
router.post(
  '/me/profile-image',
  authMiddleware,
  sanctionMiddleware('suspend'),
  parseProfileImageUpload,
  validateUploadProfileImage,
  userController.uploadProfileImage,
);
router.patch('/me/password', authMiddleware, validateChangePassword, userController.changePassword);
router.delete('/me', authMiddleware, validateWithdrawUser, userController.withdrawUser);

router.get('/:userId', validateUserId, userController.getUserProfile);

export default router;
