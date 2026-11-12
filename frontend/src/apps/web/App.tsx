import React, { useEffect } from 'react';
import { Route, Routes } from 'react-router-dom';
import { ProfileProvider } from './hooks/useProfile';
import { HOME_PATH } from '../../shared/auth';
import { RequireLogin } from '../../shared/RequireLogin';
import { ROUTES } from './data/mockData';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { FindIdPage } from './pages/FindIdPage';
import { FindPasswordPage } from './pages/FindPasswordPage';
import { ChangePasswordPage } from './pages/ChangePasswordPage';
import { MyPage } from './pages/MyPage';
import { MyPageEditPage } from './pages/MyPageEditPage';
import { WithdrawPage } from './pages/WithdrawPage';
import { UserProfilePage } from './pages/UserProfilePage';

export interface AppProps {}

/** 기본 화면은 Q&A. 다른 모듈이라 전체 페이지 이동으로 보낸다. */
const RedirectToHome: React.FC = () => {
  useEffect(() => {
    window.location.replace(HOME_PATH);
  }, []);
  return null;
};

export const App: React.FC<AppProps> = () => (
  <ProfileProvider>
    <Routes>
      <Route path="/" element={<RedirectToHome />} />
      <Route path={ROUTES.login} element={<LoginPage />} />
      <Route path={ROUTES.signup} element={<SignupPage />} />
      <Route path={ROUTES.findId} element={<FindIdPage />} />
      <Route path={ROUTES.findPassword} element={<FindPasswordPage />} />
      <Route path={ROUTES.changePassword} element={<ChangePasswordPage />} />
      <Route path={ROUTES.mypage} element={<RequireLogin><MyPage /></RequireLogin>} />
      <Route path={ROUTES.mypageEdit} element={<RequireLogin><MyPageEditPage /></RequireLogin>} />
      <Route path={ROUTES.withdraw} element={<RequireLogin><WithdrawPage /></RequireLogin>} />
      <Route path={ROUTES.userProfile} element={<UserProfilePage />} />
      <Route path="*" element={<RedirectToHome />} />
    </Routes>
  </ProfileProvider>
);

export default App;
