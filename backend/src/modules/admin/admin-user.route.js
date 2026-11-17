import { Router } from 'express';

import * as adminUserController from './admin-user.controller.js';
import { validateGetUsers, validateUpdateUser, validateUserId } from './admin-user.validator.js';

// 관리자 라우터(/api/admin) 아래에 붙으므로 로그인·ADMIN 권한 검사는 거기서 한다
const router = Router();

router.get('/', validateGetUsers, adminUserController.getUsers);
router.get('/:userId', validateUserId, adminUserController.getUserById);
router.patch('/:userId', validateUserId, validateUpdateUser, adminUserController.updateUser);

export default router;
