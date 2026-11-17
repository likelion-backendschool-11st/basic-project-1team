import { Router } from 'express';

import {
  authMiddleware,
  optionalAuthMiddleware,
  sanctionMiddleware,
} from '../../common/middleware/auth.middleware.js';

import * as tagController from './tag.controller.js';
import { validateGetTags, validateTagName, validateUpdateTagDescription } from './tag.validator.js';

const router = Router();

router.get('/', validateGetTags, tagController.getTags);
// 로그인한 회원이면 설명을 수정할 수 있는지(canEdit)를 함께 준다
router.get('/:tagName', optionalAuthMiddleware, validateTagName, tagController.getTagByName);
// 설명 수정은 글쓰기라 글쓰기 제한·이용 정지면 막는다 (API 명세 5장, 1.2)
router.patch(
  '/:tagName',
  authMiddleware,
  sanctionMiddleware('suspend', 'write_ban'),
  validateTagName,
  validateUpdateTagDescription,
  tagController.updateTagDescription,
);

export default router;
