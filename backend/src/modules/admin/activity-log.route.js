import { Router } from 'express';

import * as activityLogController from './activity-log.controller.js';
import { validateGetActivityLogs } from './activity-log.validator.js';

// 관리자 라우터(/api/admin) 아래에 붙으므로 로그인·ADMIN 권한 검사는 거기서 한다
const router = Router();

router.get('/', validateGetActivityLogs, activityLogController.getActivityLogs);

export default router;
