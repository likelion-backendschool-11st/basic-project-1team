import express from 'express';

import { errorHandler } from './common/middleware/error-handler.middleware.js';
import { notFoundHandler } from './common/middleware/not-found.middleware.js';
import adminRouter from './modules/admin/admin.route.js';
import authRouter from './modules/auth/auth.route.js';
import { commentRouter, postCommentRouter } from './modules/comments/comment.route.js';
import postRouter from './modules/posts/post.route.js';
import questionRouter from './modules/questions/question.route.js';

const app = express();

app.use(express.json());

app.get('/health', (_req, res) => {
  res.status(200).json({ success: true, data: { status: 'ok' } });
});

app.use('/api/auth', authRouter);
app.use('/api/questions', questionRouter);
app.use('/api/posts/:postId/comments', postCommentRouter);
app.use('/api/posts', postRouter);
app.use('/api/comments', commentRouter);
app.use('/api/admin', adminRouter);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
