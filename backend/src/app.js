import express from 'express';

import { errorHandler } from './common/middleware/error-handler.middleware.js';
import { notFoundHandler } from './common/middleware/not-found.middleware.js';
import { serveUploadedFiles, UPLOAD_ROUTE } from './common/utils/file-storage.js';
import { env } from './config/env.js';
import adminRouter from './modules/admin/admin.route.js';
import answerRouter from './modules/answers/answer.route.js';
import attachmentRouter from './modules/attachments/attachment.route.js';
import authRouter from './modules/auth/auth.route.js';
import { commentRouter, postCommentRouter } from './modules/comments/comment.route.js';
import noticeRouter from './modules/notices/notice.route.js';
import notificationRouter from './modules/notifications/notification.route.js';
import pointRouter from './modules/points/point.route.js';
import postRouter from './modules/posts/post.route.js';
import questionRouter from './modules/questions/question.route.js';
import reportRouter from './modules/reports/report.route.js';
import tagRouter from './modules/tags/tag.route.js';
import userRouter from './modules/users/user.route.js';

const app = express();

// 운영에서는 Vercel·호스팅 프록시를 거쳐 들어오므로 회원 IP를 X-Forwarded-For에서 읽는다 (비회원 조회수, 로그인 IP)
app.set('trust proxy', env.trustProxy);

// 본문 HTML은 최대 100,000자라 한글이면 기본 제한(100KB)을 넘을 수 있다 (API 명세 1.9)
app.use(express.json({ limit: '1mb' }));

app.get('/health', (_req, res) => {
  res.status(200).json({ success: true, data: { status: 'ok' } });
});

app.use(UPLOAD_ROUTE, serveUploadedFiles);

app.use('/api/attachments', attachmentRouter);
app.use('/api/auth', authRouter);
app.use('/api/notices', noticeRouter);
app.use('/api/notifications', notificationRouter);
app.use('/api/questions', questionRouter);
app.use('/api/reports', reportRouter);
app.use('/api/tags', tagRouter);
app.use('/api/posts/:postId/comments', postCommentRouter);
app.use('/api/posts', postRouter);
app.use('/api/comments', commentRouter);
app.use('/api/admin', adminRouter);
app.use('/api/users/me/point-histories', pointRouter);
app.use('/api/users', userRouter);
app.use('/api', answerRouter);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
