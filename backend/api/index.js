import express from 'express';

import app from '../src/app.js';
import { logger } from '../src/common/utils/logger.js';
import { env } from '../src/config/env.js';
import { expireActivityLogs } from '../src/modules/admin/activity-log.service.js';
import { cleanupUnlinkedAttachments } from '../src/modules/attachments/attachment.service.js';
import { refreshRankingsIfStale } from '../src/modules/points/point.service.js';
import { cleanupPasswordResetTokens } from '../src/modules/users/user.service.js';

// Vercel 함수 진입점. 로컬·일반 서버는 src/server.js를 쓴다.
// 서버리스에는 계속 도는 타이머가 없으므로 server.js의 주기 작업을 아래처럼 나눠 돌린다
const vercelApp = express();

vercelApp.set('trust proxy', env.trustProxy);

// 정리 작업 3개는 Vercel Cron이 하루 한 번 부른다 (vercel.json). CRON_SECRET이 맞는 요청만 받는다
vercelApp.get('/cron/daily', async (req, res) => {
  if (!env.cronSecret || req.get('authorization') !== `Bearer ${env.cronSecret}`) {
    res.status(401).end();
    return;
  }

  const result = {
    attachments: await cleanupUnlinkedAttachments(),
    passwordResetTokens: await cleanupPasswordResetTokens(),
    activityLogs: await expireActivityLogs(),
  };

  logger.info('[cron-daily]', result);
  res.status(200).json({ success: true, data: result });
});

// Grandmaster·Challenger 순위는 요청이 올 때 주기가 지났으면 다시 계산한다 (API 명세 11.2)
vercelApp.use(async (_req, _res, next) => {
  try {
    await refreshRankingsIfStale();
  } catch (error) {
    logger.error('[point-ranking] 실패', error);
  }

  next();
});

vercelApp.use(app);

export default vercelApp;
