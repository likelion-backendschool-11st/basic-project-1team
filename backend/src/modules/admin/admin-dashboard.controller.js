import * as adminDashboardService from './admin-dashboard.service.js';

export const getDashboardStats = async (_req, res) => {
  const stats = await adminDashboardService.getDashboardStats();

  res.status(200).json({ success: true, data: stats });
};
