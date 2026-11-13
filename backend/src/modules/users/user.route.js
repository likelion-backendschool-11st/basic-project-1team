import { Router } from 'express';

import * as userController from './user.controller.js';
import { validateGetAvailability } from './user.validator.js';

const router = Router();

router.get('/availability', validateGetAvailability, userController.getAvailability);

export default router;
