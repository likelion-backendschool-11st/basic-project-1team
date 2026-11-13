import * as reportService from './report.service.js';

export const createReport = async (req, res) => {
  const report = await reportService.createReport(req.user.id, req.body);

  res.status(201).json({ success: true, data: report });
};

export const getMyReports = async (req, res) => {
  const { reports, meta } = await reportService.getMyReports(req.user.id, req.validatedQuery);

  res.status(200).json({ success: true, data: reports, meta });
};

export const cancelReport = async (req, res) => {
  await reportService.cancelReport(req.user.id, Number(req.params.reportId));

  res.status(204).end();
};
