import { Router } from 'express';

import * as questionController from './question.controller.js';
import { validateGetQuestions } from './question.validator.js';

const router = Router();

router.get('/', validateGetQuestions, questionController.getQuestions);

export default router;
