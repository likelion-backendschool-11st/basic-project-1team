import { Router } from 'express';

import * as noticeController from './notice.controller.js';
import { validateGetNotices, validateNoticeId } from './notice.validator.js';

const router = Router();

// 공지 조회는 로그인 없이 볼 수 있다 (API 명세 9장). 작성·수정·삭제는 관리자 API(10.7)
router.get('/', validateGetNotices, noticeController.getNotices);
router.get('/:noticeId', validateNoticeId, noticeController.getNoticeById);

export default router;
