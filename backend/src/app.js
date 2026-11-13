import express from 'express';

import { errorHandler } from './common/middleware/error-handler.middleware.js';
import { notFoundHandler } from './common/middleware/not-found.middleware.js';
import questionRouter from './modules/questions/question.route.js';

const app = express();

app.use(express.json());

app.get('/health', (_req, res) => {
  res.status(200).json({ success: true, data: { status: 'ok' } });
});

app.use('/api/questions', questionRouter);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
