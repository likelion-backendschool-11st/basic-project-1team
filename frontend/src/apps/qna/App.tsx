import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { LoginGateProvider } from '../../shared/LoginGate';
import { RequireLogin } from '../../shared/RequireLogin';
import { LoginRequiredModal } from './components/common/LoginRequiredModal';
import { AppLayout } from './components/layout/AppLayout';
import { AnswerEditPage } from './pages/AnswerEditPage';
import { NoticeDetailPage } from './pages/NoticeDetailPage';
import { NoticeListPage } from './pages/NoticeListPage';
import { ComingSoonPage } from './pages/ComingSoonPage';
import { QuestionDetailPage } from './pages/QuestionDetailPage';
import { QuestionEditPage } from './pages/QuestionEditPage';
import { QuestionListPage } from './pages/QuestionListPage';
import { QuestionNewPage } from './pages/QuestionNewPage';
import { ReportCompletePage } from './pages/ReportCompletePage';
import { ReportPage } from './pages/ReportPage';

interface AppProps {
  readonly className?: string;
}

export const App: React.FC<AppProps> = () => (
  <LoginGateProvider prompt={LoginRequiredModal}>
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<Navigate to="/questions" replace />} />
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
        <Route path="board" element={<ComingSoonPage />} />
        <Route path="guides" element={<ComingSoonPage />} />
        <Route path="rankings" element={<ComingSoonPage />} />
        <Route path="notices" element={<NoticeListPage />} />
        <Route path="notices/:id" element={<NoticeDetailPage />} />
        <Route path="*" element={<Navigate to="/questions" replace />} />
      </Route>
    </Routes>
  </LoginGateProvider>
);
