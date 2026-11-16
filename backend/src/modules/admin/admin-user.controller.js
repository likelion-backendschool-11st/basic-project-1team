import * as adminUserService from './admin-user.service.js';

export const getUsers = async (req, res) => {
  const { users, meta } = await adminUserService.getUsers(req.validatedQuery);

  res.status(200).json({ success: true, data: users, meta });
};

export const getUserById = async (req, res) => {
  const user = await adminUserService.getUserById(Number(req.params.userId));

  res.status(200).json({ success: true, data: user });
};

// Validator가 body를 { permissions, reason } 또는 { action, type, days, reason }으로 정리해 넘긴다
export const updateUser = async (req, res) => {
  const userId = Number(req.params.userId);

  const user =
    req.body.permissions !== undefined
      ? await adminUserService.updateUserPermissions(req.user.id, userId, req.body)
      : await adminUserService.updateUserSanction(req.user.id, userId, req.body);

  res.status(200).json({ success: true, data: user });
};
