import * as adminTagService from './admin-tag.service.js';

export const getTags = async (req, res) => {
  const { tags, meta } = await adminTagService.getTags(req.validatedQuery);

  res.status(200).json({ success: true, data: tags, meta });
};

export const createTag = async (req, res) => {
  const tag = await adminTagService.createTag(req.user.id, req.body);

  res.status(201).json({ success: true, data: tag });
};

export const updateTag = async (req, res) => {
  const tag = await adminTagService.updateTag(req.user.id, Number(req.params.tagId), req.body);

  res.status(200).json({ success: true, data: tag });
};

export const deleteTag = async (req, res) => {
  await adminTagService.deleteTag(req.user.id, Number(req.params.tagId));

  res.status(204).end();
};
