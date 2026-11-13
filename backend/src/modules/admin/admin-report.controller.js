import * as adminReportService from './admin-report.service.js';

export const getReports = async (req, res) => {
  const { reports, meta } = await adminReportService.getReports(req.validatedQuery);

  res.status(200).json({ success: true, data: reports, meta });
};

export const getReportById = async (req, res) => {
  const report = await adminReportService.getReportById(Number(req.params.reportId));

  res.status(200).json({ success: true, data: report });
};

export const processReport = async (req, res) => {
  const report = await adminReportService.processReport(
    req.user.id,
    Number(req.params.reportId),
    req.body,
  );

  res.status(200).json({ success: true, data: report });
};
