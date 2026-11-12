import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { LoginGateProvider } from '../../shared/LoginGate';
import { RequireLogin } from '../../shared/RequireLogin';
import { LoginRequiredModal } from './components/LoginRequiredModal';
import { ThemeToggle } from './components/ThemeToggle';
import { BoardListPage } from './pages/BoardListPage';
import { MyPostsPage } from './pages/MyPostsPage';
import { PostDetailPage } from './pages/PostDetailPage';
import { PostWritePage } from './pages/PostWritePage';

interface AppProps {
  readonly className?: string;
}

export const App: React.FC<AppProps> = () => (
  <LoginGateProvider prompt={LoginRequiredModal}>
    <ThemeToggle />
    <Routes>
      <Route path="/" element={<BoardListPage />} />
      <Route path="/posts/:id" element={<PostDetailPage />} />
      <Route path="/my-posts" element={<RequireLogin><MyPostsPage /></RequireLogin>} />
      <Route path="/write" element={<RequireLogin><PostWritePage /></RequireLogin>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </LoginGateProvider>
);
