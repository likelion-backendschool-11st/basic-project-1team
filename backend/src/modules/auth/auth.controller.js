import * as authService from './auth.service.js';

export const login = async (req, res) => {
  const result = await authService.login(req.validatedBody);

  res.status(200).json({ success: true, data: result });
};
