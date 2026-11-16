import React from 'react';
import { Route, Routes } from 'react-router-dom';
import { HOME_PATH } from '../../shared/auth';
import { NotFoundPage } from '../../shared/layout/NotFoundPage';
import { RequireLogin } from '../../shared/RequireLogin';
import { BoardListPage } from './pages/BoardListPage';
import { MyPostsPage } from './pages/MyPostsPage';
import { PostDetailPage } from './pages/PostDetailPage';
import { PostWritePage } from './pages/PostWritePage';

/**
 * 자유게시판 화면. site 모듈의 `/board/*` 아래에 들어가므로 경로는 /board 기준 상대 경로다.
 * board-app: 게시판 화면에만 적용하는 글자·아이콘 기본값 (site/index.css)
 */
export const App: React.FC = () => (
  <div className="board-app">
    <Routes>
      <Route index element={<BoardListPage />} />
      <Route path="posts/:id" element={<PostDetailPage />} />
      <Route
        path="my-posts"
        element={
          <RequireLogin>
            <MyPostsPage />
          </RequireLogin>
        }
      />
      <Route
        path="write"
        element={
          <RequireLogin>
            <PostWritePage />
          </RequireLogin>
        }
      />
      <Route
        path="posts/:id/edit"
        element={
          <RequireLogin>
            <PostWritePage />
          </RequireLogin>
        }
      />
      <Route path="*" element={<NotFoundPage homePath={HOME_PATH} />} />
    </Routes>
  </div>
);
