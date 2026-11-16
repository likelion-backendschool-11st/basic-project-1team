import * as userService from './user.service.js';

export const getAvailability = async (req, res) => {
  const result = await userService.getAvailability(req.validatedQuery);

  res.status(200).json({ success: true, data: result });
};

export const changePassword = async (req, res) => {
  await userService.changePassword({ userId: req.user.id, ...req.body });

  res.status(204).end();
};

export const withdrawUser = async (req, res) => {
  await userService.withdrawUser({ userId: req.user.id, password: req.body.password });

  res.status(204).end();
};

export const getMe = async (req, res) => {
  const profile = await userService.getMyProfile(req.user.id, { isVisit: true });

  res.status(200).json({ success: true, data: profile });
};

export const updateMe = async (req, res) => {
  const profile = await userService.updateMyProfile({ userId: req.user.id, ...req.body });

  res.status(200).json({ success: true, data: profile });
};

export const uploadProfileImage = async (req, res) => {
  const result = await userService.updateMyProfileImage({
    userId: req.user.id,
    file: req.body.file,
  });

  res.status(200).json({ success: true, data: result });
};

export const deleteProfileImage = async (req, res) => {
  await userService.deleteMyProfileImage(req.user.id);

  res.status(204).send();
};

export const getUserProfile = async (req, res) => {
  const profile = await userService.getPublicProfile(Number(req.params.userId));

  res.status(200).json({ success: true, data: profile });
};
