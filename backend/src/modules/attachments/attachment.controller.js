import * as attachmentService from './attachment.service.js';

export const uploadAttachment = async (req, res) => {
  const attachment = await attachmentService.uploadAttachment(req.user.id, req.body);

  res.status(201).json({ success: true, data: attachment });
};

export const deleteAttachment = async (req, res) => {
  await attachmentService.deleteAttachment(req.user.id, Number(req.params.attachmentId));

  res.status(204).end();
};
