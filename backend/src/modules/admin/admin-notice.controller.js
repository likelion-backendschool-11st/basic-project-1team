import * as adminNoticeService from './admin-notice.service.js';

export const getNotices = async (req, res) => {
  const { notices, meta } = await adminNoticeService.getNotices(req.validatedQuery);

  res.status(200).json({ success: true, data: notices, meta });
};

export const createNotice = async (req, res) => {
  const notice = await adminNoticeService.createNotice(req.user.id, req.body);

  res.status(201).json({ success: true, data: notice });
};

export const updateNotice = async (req, res) => {
  const notice = await adminNoticeService.updateNotice(
    req.user.id,
    Number(req.params.noticeId),
    req.body,
  );

  res.status(200).json({ success: true, data: notice });
};

export const deleteNotice = async (req, res) => {
  await adminNoticeService.deleteNotice(req.user.id, Number(req.params.noticeId));

  res.status(204).end();
};
