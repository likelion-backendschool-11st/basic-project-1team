import * as userService from './user.service.js';

export const getAvailability = async (req, res) => {
  const result = await userService.getAvailability(req.validatedQuery);

  res.status(200).json({ success: true, data: result });
};
