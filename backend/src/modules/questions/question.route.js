import { Router } from 'express';

import {
  authMiddleware,
  optionalAuthMiddleware,
  sanctionMiddleware,
} from '../../common/middleware/auth.middleware.js';

import * as questionController from './question.controller.js';
import {
  validateCreateQuestion,
  validateGetQuestions,
  validateQuestionId,
  validateUpdateQuestion,
} from './question.validator.js';

const router = Router();

router.get('/', validateGetQuestions, questionController.getQuestions);
// '/:questionId'보다 먼저 둔다. 뒤에 두면 'stats'가 질문 id 형식 검사에 걸린다
router.get('/stats', questionController.getQuestionStats);
router.get(
  '/:questionId',
  optionalAuthMiddleware,
  validateQuestionId,
  questionController.getQuestionById,
);
router.get('/:questionId/related', validateQuestionId, questionController.getRelatedQuestions);
// 글쓰기 제한은 등록·수정만, 이용 정지는 모든 쓰기 API를 막는다 (API 명세 1.2)
router.post(
  '/',
  authMiddleware,
  sanctionMiddleware('suspend', 'write_ban'),
  validateCreateQuestion,
  questionController.createQuestion,
);
router.patch(
  '/:questionId',
  authMiddleware,
  sanctionMiddleware('suspend', 'write_ban'),
  validateQuestionId,
  validateUpdateQuestion,
  questionController.updateQuestion,
);
router.delete(
  '/:questionId',
  authMiddleware,
  sanctionMiddleware('suspend'),
  validateQuestionId,
  questionController.deleteQuestion,
);
router.get(
  '/:questionId/edit-histories',
  validateQuestionId,
  questionController.getQuestionEditHistories,
);

export default router;
