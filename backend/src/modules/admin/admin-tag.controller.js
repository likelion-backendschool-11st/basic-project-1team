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

// DELETE는 ?mergeInto=가 있으면 병합(200, 대상 태그), 없으면 삭제(차단, 204)다 (API 명세 10.5)
export const deleteTag = async (req, res) => {
  const tagId = Number(req.params.tagId);
  const { mergeInto } = req.validatedQuery;

  if (mergeInto !== undefined) {
    const target = await adminTagService.mergeTag(req.user.id, tagId, mergeInto);

    res.status(200).json({ success: true, data: target });
    return;
  }

  await adminTagService.deleteTag(req.user.id, tagId);

  res.status(204).end();
};
