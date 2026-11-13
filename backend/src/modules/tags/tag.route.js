import { Router } from 'express';

import * as tagController from './tag.controller.js';
import { validateGetTags } from './tag.validator.js';

const router = Router();

router.get('/', validateGetTags, tagController.getTags);

export default router;
