import React from 'react';
import { Route, Routes } from 'react-router-dom';
import { SiteLayout } from '../../shared/layout/SiteLayout';
import { App as BoardApp } from '../board/App';
import { App as QnaApp } from '../qna/App';

/**
 * 사용자 화면(Q&A·자유게시판)을 라우터 하나로 묶는다.
 * 공통 레이아웃(헤더·공지 롤링·푸터)은 여기 한 번만 두고, 탭을 옮기면 본문만 바뀐다.
 */
export const App: React.FC = () => (
  <Routes>
    <Route element={<SiteLayout />}>
      <Route path="qna/*" element={<QnaApp />} />
      <Route path="board/*" element={<BoardApp />} />
    </Route>
  </Routes>
);
