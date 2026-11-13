import { Router } from 'express';

import { authMiddleware } from '../../common/middleware/auth.middleware.js';

import * as questionController from './question.controller.js';
import {
  validateCreateQuestion,
  validateGetQuestions,
  validateQuestionId,
  validateUpdateQuestion,
} from './question.validator.js';

const router = Router();

router.get('/', validateGetQuestions, questionController.getQuestions);
router.post('/', authMiddleware, validateCreateQuestion, questionController.createQuestion);
router.patch(
  '/:questionId',
  authMiddleware,
  validateQuestionId,
  validateUpdateQuestion,
  questionController.updateQuestion,
);
router.delete(
  '/:questionId',
  authMiddleware,
  validateQuestionId,
  questionController.deleteQuestion,
);
router.get(
  '/:questionId/edit-histories',
  validateQuestionId,
  questionController.getQuestionEditHistories,
);

export default router;
