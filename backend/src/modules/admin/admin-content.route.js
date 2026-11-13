import { Router } from 'express';

import {
  answerController,
  commentController,
  postController,
  questionController,
} from './admin-content.controller.js';
import {
  validateAnswerId,
  validateCommentId,
  validateGetAnswers,
  validateGetBoardContents,
  validateGetQuestions,
  validatePostId,
  validateQuestionId,
  validateUpdateContentStatus as validateStatus,
} from './admin-content.validator.js';

// 관리자 라우터(/api/admin) 아래에 붙으므로 로그인·ADMIN 권한 검사는 거기서 한다
const router = Router();

// 질문/답변 관리 (API 명세 10.3)
router.get('/questions', validateGetQuestions, questionController.getContents);
router.patch(
  '/questions/:questionId',
  validateQuestionId,
  validateStatus,
  questionController.updateContentStatus,
);
router.delete('/questions/:questionId', validateQuestionId, questionController.deleteContent);

router.get('/answers', validateGetAnswers, answerController.getContents);
router.patch(
  '/answers/:answerId',
  validateAnswerId,
  validateStatus,
  answerController.updateContentStatus,
);
router.delete('/answers/:answerId', validateAnswerId, answerController.deleteContent);

// 자유게시판 관리 (API 명세 10.4)
router.get('/posts', validateGetBoardContents, postController.getContents);
router.patch('/posts/:postId', validatePostId, validateStatus, postController.updateContentStatus);
router.delete('/posts/:postId', validatePostId, postController.deleteContent);

router.get('/comments', validateGetBoardContents, commentController.getContents);
router.patch(
  '/comments/:commentId',
  validateCommentId,
  validateStatus,
  commentController.updateContentStatus,
);
router.delete('/comments/:commentId', validateCommentId, commentController.deleteContent);

export default router;
