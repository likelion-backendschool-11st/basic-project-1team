import { Router } from 'express';

import { env } from '../../config/env.js';

import * as adminMaintenanceController from './admin-maintenance.controller.js';
import { validateCleanupPasswordResetTokens } from './admin-maintenance.validator.js';

// 관리자 라우터(/api/admin) 아래에 붙으므로 로그인·ADMIN 권한 검사는 거기서 한다
const router = Router();

// 재설정 토큰 정리 상태 (API 명세 10.9)
router.get(
  '/password-reset-tokens/cleanup',
  adminMaintenanceController.getPasswordResetTokenCleanupStatus,
);

// 정리를 바로 실행하는 테스트 API는 개발 환경에만 둔다. 운영에서는 경로가 없어 404 (API 명세 10.9)
if (env.nodeEnv !== 'production') {
  router.post(
    '/password-reset-tokens/cleanup',
    validateCleanupPasswordResetTokens,
    adminMaintenanceController.cleanupPasswordResetTokens,
  );
}

export default router;
