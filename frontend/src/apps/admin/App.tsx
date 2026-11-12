import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { logout } from '../../shared/auth';
import { AppLayout } from './components/layout/AppLayout';
import { ActivityLogPage } from './pages/ActivityLogPage';
import { BoardPage } from './pages/BoardPage';
import { DashboardPage } from './pages/DashboardPage';
import { MemberDetailPage } from './pages/MemberDetailPage';
import { MembersPage } from './pages/MembersPage';
import { NoticesPage } from './pages/NoticesPage';
import { QnaPage } from './pages/QnaPage';
import { ReportsPage } from './pages/ReportsPage';
import { TagsPage } from './pages/TagsPage';

export function App() {
  return (
    <BrowserRouter basename="/admin">
      <Routes>
        <Route element={<AppLayout onLogout={logout} />}>
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
}

export default App;
