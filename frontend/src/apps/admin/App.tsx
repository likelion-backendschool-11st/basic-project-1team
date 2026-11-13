import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { logoutToAdminLogin } from './adminSite';
import { AppLayout } from './components/layout/AppLayout';
import { RequireAdmin } from './components/layout/RequireAdmin';
import { ActivityLogPage } from './pages/ActivityLogPage';
import { BoardPage } from './pages/BoardPage';
import { DashboardPage } from './pages/DashboardPage';
import { LoginPage } from './pages/LoginPage';
import { MemberDetailPage } from './pages/MemberDetailPage';
import { MembersPage } from './pages/MembersPage';
import { NoticesPage } from './pages/NoticesPage';
import { QnaPage } from './pages/QnaPage';
import { ReportsPage } from './pages/ReportsPage';
import { TagsPage } from './pages/TagsPage';

export const App: React.FC = () => {
  return (
    <BrowserRouter basename="/admin">
      <Routes>
        {/* 관리자 사이트는 사용자 사이트와 따로 로그인한다 */}
        <Route path="login" element={<LoginPage />} />
        <Route
          element={
            <RequireAdmin>
              <AppLayout onLogout={logoutToAdminLogin} />
            </RequireAdmin>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="members" element={<MembersPage />} />
          <Route path="members/:id" element={<MemberDetailPage />} />
          <Route path="qna" element={<QnaPage />} />
          <Route path="tags" element={<TagsPage />} />
          <Route path="board" element={<BoardPage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="notices" element={<NoticesPage />} />
          <Route path="logs" element={<ActivityLogPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};
