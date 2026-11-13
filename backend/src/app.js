import express from 'express';

import { errorHandler } from './common/middleware/error-handler.middleware.js';
import { notFoundHandler } from './common/middleware/not-found.middleware.js';
import { commentRouter, postCommentRouter } from './modules/comments/comment.route.js';
import postRouter from './modules/posts/post.route.js';
import questionRouter from './modules/questions/question.route.js';

const app = express();

app.use(express.json());

app.get('/health', (_req, res) => {
  res.status(200).json({ success: true, data: { status: 'ok' } });
});

// API 는 모두 /api 아래에 둔다 (API_SPEC 1.1)
app.use('/api/questions', questionRouter);
app.use('/api/posts/:postId/comments', postCommentRouter);
app.use('/api/posts', postRouter);
app.use('/api/comments', commentRouter);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
