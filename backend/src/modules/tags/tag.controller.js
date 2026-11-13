import * as tagService from './tag.service.js';

export const getTags = async (req, res) => {
  const tags = await tagService.getTags(req.validatedQuery);

  res.status(200).json({ success: true, data: tags });
};
