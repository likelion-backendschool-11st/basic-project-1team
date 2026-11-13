import { Router } from 'express';

import {
  authMiddleware,
  optionalAuthMiddleware,
  sanctionMiddleware,
} from '../../common/middleware/auth.middleware.js';

import * as answerController from './answer.controller.js';
import {
  validateAnswerId,
  validateCreateAnswer,
  validateGetAnswers,
  validateQuestionId,
  validateUpdateAnswer,
} from './answer.validator.js';

// 질문 하위 경로(/questions/:questionId/answers)와 답변 경로(/answers/:answerId)를 함께 두므로
// app.js에서 '/api'에 등록한다
const router = Router();

router.get(
  '/questions/:questionId/answers',
  optionalAuthMiddleware,
  validateQuestionId,
  validateGetAnswers,
  answerController.getAnswersByQuestionId,
);
// 글쓰기 제한은 등록·수정만, 이용 정지는 모든 쓰기 API를 막는다 (API 명세 1.2)
router.post(
  '/questions/:questionId/answers',
  authMiddleware,
  sanctionMiddleware('suspend', 'write_ban'),
  validateQuestionId,
  validateCreateAnswer,
  answerController.createAnswer,
);
router.get(
  '/answers/:answerId',
  optionalAuthMiddleware,
  validateAnswerId,
  answerController.getAnswerById,
);
router.patch(
  '/answers/:answerId',
  authMiddleware,
  sanctionMiddleware('suspend', 'write_ban'),
  validateAnswerId,
  validateUpdateAnswer,
  answerController.updateAnswer,
);
router.delete(
  '/answers/:answerId',
  authMiddleware,
  sanctionMiddleware('suspend'),
  validateAnswerId,
  answerController.deleteAnswer,
);
// 채택은 쓰기 API라 이용 정지는 막고, 글쓰기 제한(작성·수정만 막음)은 막지 않는다 (API 명세 1.2)
router.post(
  '/answers/:answerId/accept',
  authMiddleware,
  sanctionMiddleware('suspend'),
  validateAnswerId,
  answerController.acceptAnswer,
);
router.get(
  '/answers/:answerId/edit-histories',
  validateAnswerId,
  answerController.getAnswerEditHistories,
);

export default router;
