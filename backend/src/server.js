import app from './app.js';
import { logger } from './common/utils/logger.js';
import { startPeriodicJob } from './common/utils/periodic-job.js';
import { pool } from './config/database.js';
import { seedDevelopmentData } from './config/dev-seed.js';
import { env } from './config/env.js';
import { expireActivityLogs } from './modules/admin/activity-log.service.js';
import { cleanupUnlinkedAttachments } from './modules/attachments/attachment.service.js';
import { refreshRankings } from './modules/points/point.service.js';
import { cleanupPasswordResetTokens } from './modules/users/user.service.js';

const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;
const MINUTE_MS = 60 * 1000;

if (env.devSeed) {
  await seedDevelopmentData();
}

const server = app.listen(env.port, () => {
  logger.info(`Server listening on port ${env.port} (${env.nodeEnv})`);
});

// 연결된 글이 없는 첨부파일 정리 (API 명세 6장)
const stopAttachmentCleanup = startPeriodicJob('attachment-cleanup', HOUR_MS, async () => {
  const cleanedCount = await cleanupUnlinkedAttachments();

  if (cleanedCount > 0) {
    logger.info(`[attachment-cleanup] 첨부파일 ${cleanedCount}개 정리`);
  }
});

// 쓸 수 없게 된 지 7일 지난 비밀번호 재설정 토큰 정리 (API 명세 1.7 예외, 10.9)
const stopPasswordResetTokenCleanup = startPeriodicJob(
  'password-reset-token-cleanup',
  HOUR_MS,
  async () => {
    const deletedCount = await cleanupPasswordResetTokens();

    if (deletedCount > 0) {
      logger.info(`[password-reset-token-cleanup] 재설정 토큰 ${deletedCount}개 정리`);
    }
  },
);

// 작성 후 5년 지난 활동 로그 만료 (API 명세 10.8, DB 설계서 4.19)
const stopActivityLogExpiry = startPeriodicJob('activity-log-expiry', DAY_MS, async () => {
  const expiredCount = await expireActivityLogs();

  if (expiredCount > 0) {
    logger.info(`[activity-log-expiry] 활동 로그 ${expiredCount}개 만료`);
  }
});

// Master 레벨 회원의 Grandmaster·Challenger 순위 (API 명세 11.2)
const stopRankingRefresh = startPeriodicJob(
  'point-ranking',
  env.rankingIntervalMinutes * MINUTE_MS,
  refreshRankings,
);

const shutdown = (signal) => {
  logger.info(`${signal} received. Shutting down...`);
  stopAttachmentCleanup();
  stopPasswordResetTokenCleanup();
  stopActivityLogExpiry();
  stopRankingRefresh();
  server.close(async () => {
    await pool.end();
    process.exit(0);
  });
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

// 요청 밖(주기 작업·이벤트 콜백 등)에서 놓친 Promise 거부는 로그를 남기고 서버는 계속 돈다
process.on('unhandledRejection', (reason) => {
  logger.error('[unhandledRejection]', reason);
});

// 잡지 못한 예외 뒤에는 상태를 믿을 수 없으므로 로그를 남기고 종료한다 (프로세스 관리자가 다시 띄움)
process.on('uncaughtException', (error) => {
  logger.error('[uncaughtException]', error);
  process.exit(1);
});
