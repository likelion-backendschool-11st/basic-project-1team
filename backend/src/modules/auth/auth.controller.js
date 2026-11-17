import * as userService from '../users/user.service.js';

import * as authService from './auth.service.js';

export const login = async (req, res) => {
  const result = await authService.login({ ...req.body, clientIp: req.ip });

  res.status(200).json({ success: true, data: result });
};

export const findUsername = async (req, res) => {
  const result = await userService.getMaskedUsername({ ...req.body, clientIp: req.ip });

  res.status(200).json({ success: true, data: result });
};

export const verifyPasswordReset = async (req, res) => {
  const result = await userService.createPasswordResetToken({
    ...req.body,
    clientIp: req.ip,
  });

  res.status(200).json({ success: true, data: result });
};

export const resetPassword = async (req, res) => {
  await userService.resetPassword(req.body);

  res.status(204).end();
};

export const signup = async (req, res) => {
  const user = await userService.createUser(req.body);

  res.status(201).json({ success: true, data: user });
};
