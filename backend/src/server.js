import app from './app.js';
import { logger } from './common/utils/logger.js';
import { pool } from './config/database.js';
import { env } from './config/env.js';

const server = app.listen(env.port, () => {
  logger.info(`Server listening on port ${env.port} (${env.nodeEnv})`);
});

const shutdown = (signal) => {
  logger.info(`${signal} received. Shutting down...`);
  server.close(async () => {
    await pool.end();
    process.exit(0);
  });
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
