import { Router } from 'express';

import * as adminTagController from './admin-tag.controller.js';
import {
  validateCreateTag,
  validateDeleteTag,
  validateGetTags,
  validateTagId,
  validateUpdateTag,
} from './admin-tag.validator.js';

// 관리자 라우터(/api/admin) 아래에 붙으므로 로그인·ADMIN 권한 검사는 거기서 한다
const router = Router();

// 태그 관리 (API 명세 10.5)
router.get('/', validateGetTags, adminTagController.getTags);
router.post('/', validateCreateTag, adminTagController.createTag);
router.patch('/:tagId', validateTagId, validateUpdateTag, adminTagController.updateTag);
router.delete('/:tagId', validateTagId, validateDeleteTag, adminTagController.deleteTag);

export default router;
