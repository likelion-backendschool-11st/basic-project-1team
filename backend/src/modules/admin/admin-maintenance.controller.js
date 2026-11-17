import * as userService from '../users/user.service.js';

export const getPasswordResetTokenCleanupStatus = async (_req, res) => {
  const status = await userService.getPasswordResetTokenCleanupStatus();

  res.status(200).json({ success: true, data: status });
};

export const cleanupPasswordResetTokens = async (req, res) => {
  const retentionMinutes =
    req.body.retentionMinutes ?? userService.PASSWORD_RESET_RETENTION_MINUTES;
  const deletedCount = await userService.cleanupPasswordResetTokens({
    retentionMinutes,
    trigger: 'manual',
  });

  res.status(200).json({ success: true, data: { retentionMinutes, deletedCount } });
};
