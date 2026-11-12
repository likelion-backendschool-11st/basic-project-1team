import React from 'react';
import { Route, Routes } from 'react-router-dom';
import { SiteLayout } from '../../shared/layout/SiteLayout';
import { App as BoardApp } from '../board/App';
import { App as QnaApp } from '../qna/App';
import { App as AccountApp } from '../web/App';
import { ProfileProvider } from '../web/hooks/useProfile';

/**
 * 사용자 화면(Q&A·자유게시판·회원)을 라우터 하나로 묶는다.
 * 공통 레이아웃(헤더·공지 롤링·푸터)은 여기 한 번만 두고, 탭을 옮기면 본문만 바뀐다.
 * 내 정보(ProfileProvider)는 헤더 프로필 메뉴와 마이페이지가 함께 쓴다.
 */
export const App: React.FC = () => (
  <ProfileProvider>
    <Routes>
      <Route element={<SiteLayout />}>
        <Route path="qna/*" element={<QnaApp />} />
        <Route path="board/*" element={<BoardApp />} />
        {/* 로그인·회원가입·마이페이지·회원 프로필 등 */}
        <Route path="*" element={<AccountApp />} />
      </Route>
    </Routes>
  </ProfileProvider>
);
