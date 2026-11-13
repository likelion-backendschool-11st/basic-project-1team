import { Router } from 'express';

import { authMiddleware, optionalAuthMiddleware } from '../../common/middleware/auth.middleware.js';

import * as postController from './post.controller.js';
import { validateCreatePost, validateUpdatePost } from './post.validator.js';

const router = Router();

router.get('/', optionalAuthMiddleware, postController.getPosts);
router.post('/', authMiddleware, validateCreatePost, postController.createPost);
router.get('/:postId', optionalAuthMiddleware, postController.getPostById);
router.patch('/:postId', authMiddleware, validateUpdatePost, postController.updatePost);
router.delete('/:postId', authMiddleware, postController.deletePost);

export default router;
