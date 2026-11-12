import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { LoginGateProvider } from '../../shared/LoginGate';
import { RequireLogin } from '../../shared/RequireLogin';
import { LoginRequiredModal } from './components/common/LoginRequiredModal';
import { AnswerEditPage } from './pages/AnswerEditPage';
import { NoticeDetailPage } from './pages/NoticeDetailPage';
import { NoticeListPage } from './pages/NoticeListPage';
import { QuestionDetailPage } from './pages/QuestionDetailPage';
import { QuestionEditPage } from './pages/QuestionEditPage';
import { QuestionListPage } from './pages/QuestionListPage';
import { QuestionNewPage } from './pages/QuestionNewPage';
import { ReportCompletePage } from './pages/ReportCompletePage';
import { ReportPage } from './pages/ReportPage';
import { routes } from './routes';

/** Q&A 화면. site 모듈의 `/qna/*` 아래에 들어가므로 경로는 /qna 기준 상대 경로다 */
export const App: React.FC = () => (
  <LoginGateProvider prompt={LoginRequiredModal}>
    <Routes>
      <Route index element={<Navigate to={routes.questions()} replace />} />
      <Route path="questions" element={<QuestionListPage />} />
      <Route
        path="questions/new"
        element={
          <RequireLogin>
            <QuestionNewPage />
          </RequireLogin>
        }
      />
      <Route path="questions/:id" element={<QuestionDetailPage />} />
      <Route
        path="questions/:id/edit"
        element={
          <RequireLogin>
            <QuestionEditPage />
          </RequireLogin>
        }
      />
      <Route
        path="questions/:id/answers/:answerId/edit"
        element={
          <RequireLogin>
            <AnswerEditPage />
          </RequireLogin>
        }
      />
      <Route
        path="questions/:id/report"
        element={
          <RequireLogin>
            <ReportPage />
          </RequireLogin>
        }
      />
      <Route
        path="questions/:id/report/complete"
        element={
          <RequireLogin>
            <ReportCompletePage />
          </RequireLogin>
        }
      />
      <Route
        path="report/:targetType/:targetId"
        element={
          <RequireLogin>
            <ReportPage />
          </RequireLogin>
        }
      />
      <Route
        path="report/:targetType/:targetId/complete"
        element={
          <RequireLogin>
            <ReportCompletePage />
          </RequireLogin>
        }
      />
      <Route path="notices" element={<NoticeListPage />} />
      <Route path="notices/:id" element={<NoticeDetailPage />} />
      <Route path="*" element={<Navigate to={routes.questions()} replace />} />
    </Routes>
  </LoginGateProvider>
);
