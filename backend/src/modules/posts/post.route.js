import { Router } from 'express';

import {
  authMiddleware,
  optionalAuthMiddleware,
  sanctionMiddleware,
} from '../../common/middleware/auth.middleware.js';

import * as postController from './post.controller.js';
import { validateCreatePost, validateUpdatePost } from './post.validator.js';

const router = Router();

// 게시글 작성·수정은 이용 정지·글쓰기 제한, 삭제는 이용 정지만 막는다 (API_SPEC 1.2)
const blockWriteSanctions = sanctionMiddleware('suspend', 'write_ban');
const blockSuspended = sanctionMiddleware('suspend');

router.get('/', optionalAuthMiddleware, postController.getPosts);
router.post(
  '/',
  authMiddleware,
  blockWriteSanctions,
  validateCreatePost,
  postController.createPost,
);
router.get('/:postId', optionalAuthMiddleware, postController.getPostById);
router.patch(
  '/:postId',
  authMiddleware,
  blockWriteSanctions,
  validateUpdatePost,
  postController.updatePost,
);
router.delete('/:postId', authMiddleware, blockSuspended, postController.deletePost);

export default router;
