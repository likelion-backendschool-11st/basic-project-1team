import * as activityLogService from './activity-log.service.js';

export const getActivityLogs = async (req, res) => {
  const { activityLogs, meta } = await activityLogService.getActivityLogs(req.validatedQuery);

  res.status(200).json({ success: true, data: activityLogs, meta });
};
