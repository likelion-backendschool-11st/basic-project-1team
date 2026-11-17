import { Router } from 'express';

import { authMiddleware } from '../../common/middleware/auth.middleware.js';

import * as notificationController from './notification.controller.js';
import { validateGetNotifications, validateNotificationId } from './notification.validator.js';

const router = Router();

// 조회·읽음 처리라 이용 정지 중에도 쓸 수 있다 (API 명세 12장)
router.get(
  '/',
  authMiddleware,
  validateGetNotifications,
  notificationController.getMyNotifications,
);
router.get('/unread-count', authMiddleware, notificationController.getUnreadCount);
router.patch('/read-all', authMiddleware, notificationController.readAllNotifications);
router.patch(
  '/:notificationId/read',
  authMiddleware,
  validateNotificationId,
  notificationController.readNotification,
);

export default router;
