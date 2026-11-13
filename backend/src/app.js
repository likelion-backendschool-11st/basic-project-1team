import express from 'express';

import { errorHandler } from './common/middleware/error-handler.middleware.js';
import { notFoundHandler } from './common/middleware/not-found.middleware.js';
import adminRouter from './modules/admin/admin.route.js';
import answerRouter from './modules/answers/answer.route.js';
import authRouter from './modules/auth/auth.route.js';
import postRouter from './modules/posts/post.route.js';
import questionRouter from './modules/questions/question.route.js';
import tagRouter from './modules/tags/tag.route.js';
import userRouter from './modules/users/user.route.js';

const app = express();

// 본문 HTML은 최대 100,000자라 한글이면 기본 제한(100KB)을 넘을 수 있다 (API 명세 1.9)
app.use(express.json({ limit: '1mb' }));

app.get('/health', (_req, res) => {
  res.status(200).json({ success: true, data: { status: 'ok' } });
});

app.use('/api/auth', authRouter);
app.use('/api/questions', questionRouter);
app.use('/api/tags', tagRouter);
app.use('/api/posts', postRouter);
app.use('/api/admin', adminRouter);
app.use('/api/users', userRouter);
app.use('/api', answerRouter);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
