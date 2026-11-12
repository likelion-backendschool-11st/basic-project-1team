import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { AnswerEditPage } from './pages/AnswerEditPage';
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
  <Routes>
    <Route element={<AppLayout />}>
      <Route index element={<Navigate to="/questions" replace />} />
      <Route path="questions" element={<QuestionListPage />} />
      <Route path="questions/new" element={<QuestionNewPage />} />
      <Route path="questions/:id" element={<QuestionDetailPage />} />
      <Route path="questions/:id/edit" element={<QuestionEditPage />} />
      <Route path="questions/:id/answers/:answerId/edit" element={<AnswerEditPage />} />
      <Route path="questions/:id/report" element={<ReportPage />} />
      <Route path="questions/:id/report/complete" element={<ReportCompletePage />} />
      <Route path="board" element={<ComingSoonPage />} />
      <Route path="guides" element={<ComingSoonPage />} />
      <Route path="rankings" element={<ComingSoonPage />} />
      <Route path="*" element={<Navigate to="/questions" replace />} />
    </Route>
  </Routes>
);

export default App;
