import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import ThemeToggle from './components/ThemeToggle';
import BoardListPage from './pages/BoardListPage';
import MyPostsPage from './pages/MyPostsPage';
import PostDetailPage from './pages/PostDetailPage';
import PostWritePage from './pages/PostWritePage';

interface AppProps {
  readonly className?: string;
}

export const App: React.FC<AppProps> = () => (
  <>
    <ThemeToggle />
    <Routes>
      <Route path="/" element={<BoardListPage />} />
      <Route path="/posts/:id" element={<PostDetailPage />} />
      <Route path="/my-posts" element={<MyPostsPage />} />
      <Route path="/write" element={<PostWritePage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </>
);

export default App;
