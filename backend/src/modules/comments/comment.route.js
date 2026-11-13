import { Router } from 'express';

import { authMiddleware, optionalAuthMiddleware } from '../../common/middleware/auth.middleware.js';

import * as commentController from './comment.controller.js';
import { validateCreateComment } from './comment.validator.js';

/** /api/posts/:postId/comments */
export const postCommentRouter = Router({ mergeParams: true });

postCommentRouter.get('/', optionalAuthMiddleware, commentController.getCommentsByPostId);
postCommentRouter.post('/', authMiddleware, validateCreateComment, commentController.createComment);

/** /api/comments */
export const commentRouter = Router();

commentRouter.delete('/:commentId', authMiddleware, commentController.deleteComment);
