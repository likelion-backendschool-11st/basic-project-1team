import { Router } from 'express';

import * as tagController from './tag.controller.js';
import { validateGetTags, validateTagName } from './tag.validator.js';

const router = Router();

router.get('/', validateGetTags, tagController.getTags);
router.get('/:tagName', validateTagName, tagController.getTagByName);

export default router;
