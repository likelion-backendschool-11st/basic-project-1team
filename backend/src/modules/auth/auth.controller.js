import * as userService from '../users/user.service.js';

import * as authService from './auth.service.js';

export const login = async (req, res) => {
  const result = await authService.login(req.validatedBody);

  res.status(200).json({ success: true, data: result });
};

export const findUsername = async (req, res) => {
  const result = await userService.getMaskedUsername(req.validatedBody);

  res.status(200).json({ success: true, data: result });
};
