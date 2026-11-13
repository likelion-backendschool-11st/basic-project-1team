import * as adminUserService from './admin-user.service.js';

export const getUsers = async (req, res) => {
  const { users, meta } = await adminUserService.getUsers(req.validatedQuery);

  res.status(200).json({ success: true, data: users, meta });
};

export const getUserById = async (req, res) => {
  const user = await adminUserService.getUserById(Number(req.params.userId));

  res.status(200).json({ success: true, data: user });
};

export const updateUser = async (req, res) => {
  const user = await adminUserService.updateUserSanction(
    req.user.id,
    Number(req.params.userId),
    req.body,
  );

  res.status(200).json({ success: true, data: user });
};
