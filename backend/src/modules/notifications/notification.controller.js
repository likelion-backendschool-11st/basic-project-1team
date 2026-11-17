import * as notificationService from './notification.service.js';

export const getMyNotifications = async (req, res) => {
  const { notifications, meta } = await notificationService.getMyNotifications(
    req.user.id,
    req.validatedQuery,
  );

  res.status(200).json({ success: true, data: notifications, meta });
};

export const getUnreadCount = async (req, res) => {
  const result = await notificationService.getUnreadCount(req.user.id);

  res.status(200).json({ success: true, data: result });
};

export const readNotification = async (req, res) => {
  await notificationService.readNotification(req.user.id, Number(req.params.notificationId));

  res.status(204).end();
};

export const readAllNotifications = async (req, res) => {
  await notificationService.readAllNotifications(req.user.id);

  res.status(204).end();
};
