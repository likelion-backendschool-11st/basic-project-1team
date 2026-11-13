import { Router } from 'express';

import {
  authMiddleware,
  optionalAuthMiddleware,
  sanctionMiddleware,
} from '../../common/middleware/auth.middleware.js';

import * as commentController from './comment.controller.js';
import { validateCreateComment } from './comment.validator.js';

/** /api/posts/:postId/comments */
export const postCommentRouter = Router({ mergeParams: true });

// 댓글 작성은 이용 정지·댓글 제한, 삭제는 이용 정지만 막는다 (API_SPEC 1.2)
postCommentRouter.get('/', optionalAuthMiddleware, commentController.getCommentsByPostId);
postCommentRouter.post(
  '/',
  authMiddleware,
  sanctionMiddleware('suspend', 'comment_ban'),
  validateCreateComment,
  commentController.createComment,
);

/** /api/comments */
export const commentRouter = Router();

commentRouter.delete(
  '/:commentId',
  authMiddleware,
  sanctionMiddleware('suspend'),
  commentController.deleteComment,
);
