import { Router } from 'express';

import {
  authMiddleware,
  optionalAuthMiddleware,
  sanctionMiddleware,
} from '../../common/middleware/auth.middleware.js';

import * as postController from './post.controller.js';
import {
  validateCreatePost,
  validateGetPosts,
  validatePostId,
  validateUpdatePost,
} from './post.validator.js';

const router = Router();

// 목록의 isMine 을 채우려고 로그인은 선택으로 받는다
router.get('/', optionalAuthMiddleware, validateGetPosts, postController.getPosts);
router.get('/:postId', optionalAuthMiddleware, validatePostId, postController.getPostById);
// 글쓰기 제한은 작성·수정만, 이용 정지는 모든 쓰기 API를 막는다 (API 명세 1.2)
router.post(
  '/',
  authMiddleware,
  sanctionMiddleware('suspend', 'write_ban'),
  validateCreatePost,
  postController.createPost,
);
router.patch(
  '/:postId',
  authMiddleware,
  sanctionMiddleware('suspend', 'write_ban'),
  validatePostId,
  validateUpdatePost,
  postController.updatePost,
);
router.delete(
  '/:postId',
  authMiddleware,
  sanctionMiddleware('suspend'),
  validatePostId,
  postController.deletePost,
);

export default router;
