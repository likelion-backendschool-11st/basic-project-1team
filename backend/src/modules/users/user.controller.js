import * as userService from './user.service.js';

export const getAvailability = async (req, res) => {
  const result = await userService.getAvailability(req.validatedQuery);

  res.status(200).json({ success: true, data: result });
};

export const changePassword = async (req, res) => {
  await userService.changePassword({ userId: req.user.id, ...req.body });

  res.status(204).send();
};

export const withdrawUser = async (req, res) => {
  await userService.withdrawUser(req.user.id);

  res.status(204).send();
};

export const getMe = async (req, res) => {
  const profile = await userService.getMyProfile(req.user.id);

  res.status(200).json({ success: true, data: profile });
};

export const updateMe = async (req, res) => {
  const profile = await userService.updateMyBio({ userId: req.user.id, bio: req.body.bio });

  res.status(200).json({ success: true, data: profile });
};

export const uploadProfileImage = async (req, res) => {
  const result = await userService.updateMyProfileImage({
    userId: req.user.id,
    file: req.body.file,
  });

  res.status(200).json({ success: true, data: result });
};

export const getUserProfile = async (req, res) => {
  const profile = await userService.getPublicProfile(Number(req.params.userId));

  res.status(200).json({ success: true, data: profile });
};
