import * as noticeService from './notice.service.js';

export const getNotices = async (req, res) => {
  const { notices, meta } = await noticeService.getNotices(req.validatedQuery);

  res.status(200).json({ success: true, data: notices, meta });
};

export const getNoticeById = async (req, res) => {
  const notice = await noticeService.getNoticeById(Number(req.params.noticeId));

  res.status(200).json({ success: true, data: notice });
};
