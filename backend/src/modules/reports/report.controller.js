import * as reportService from './report.service.js';

export const createReport = async (req, res) => {
  const report = await reportService.createReport(req.user.id, req.body);

  res.status(201).json({ success: true, data: report });
};
