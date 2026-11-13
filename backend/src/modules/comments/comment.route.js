import { Router } from 'express';

import {
  authMiddleware,
  optionalAuthMiddleware,
  sanctionMiddleware,
} from '../../common/middleware/auth.middleware.js';

import * as commentController from './comment.controller.js';
import {
  validateCommentId,
  validateCreateComment,
  validateGetComments,
  validatePostId,
} from './comment.validator.js';

/** /api/posts/:postId/comments */
export const postCommentRouter = Router({ mergeParams: true });

postCommentRouter.get(
  '/',
  optionalAuthMiddleware,
  validatePostId,
  validateGetComments,
  commentController.getCommentsByPostId,
);
// 댓글 제한은 작성만, 이용 정지는 모든 쓰기 API를 막는다 (API 명세 1.2)
postCommentRouter.post(
  '/',
  authMiddleware,
  sanctionMiddleware('suspend', 'comment_ban'),
  validatePostId,
  validateCreateComment,
  commentController.createComment,
);

/** /api/comments */
export const commentRouter = Router();

commentRouter.delete(
  '/:commentId',
  authMiddleware,
  sanctionMiddleware('suspend'),
  validateCommentId,
  commentController.deleteComment,
);
