import * as pointService from './point.service.js';

export const getMyPointHistories = async (req, res) => {
  const { pointHistories, meta } = await pointService.getMyPointHistories(
    req.user.id,
    req.validatedQuery,
  );

  res.status(200).json({ success: true, data: pointHistories, meta });
};
