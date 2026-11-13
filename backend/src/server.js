import app from './app.js';
import { logger } from './common/utils/logger.js';
import { startPeriodicJob } from './common/utils/periodic-job.js';
import { pool } from './config/database.js';
import { seedDevelopmentData } from './config/dev-seed.js';
import { env } from './config/env.js';
import { cleanupUnlinkedAttachments } from './modules/attachments/attachment.service.js';

const HOUR_MS = 60 * 60 * 1000;

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

const shutdown = (signal) => {
  logger.info(`${signal} received. Shutting down...`);
  stopAttachmentCleanup();
  server.close(async () => {
    await pool.end();
    process.exit(0);
  });
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
