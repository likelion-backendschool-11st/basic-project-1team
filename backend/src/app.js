import express from 'express';

import { errorHandler } from './common/middleware/error-handler.middleware.js';
import { notFoundHandler } from './common/middleware/not-found.middleware.js';

const app = express();

app.use(express.json());

app.get('/health', (_req, res) => {
  res.status(200).json({ success: true, data: { status: 'ok' } });
});

// TODO: 도메인 router 등록 (예: app.use('/questions', questionRouter))

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
