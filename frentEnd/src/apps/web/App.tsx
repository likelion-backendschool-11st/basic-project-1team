import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { ProfileProvider } from './hooks/useProfile';
import { ROUTES } from './data/mockData';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { FindIdPage } from './pages/FindIdPage';
import { FindPasswordPage } from './pages/FindPasswordPage';
import { ChangePasswordPage } from './pages/ChangePasswordPage';
import { MyPage } from './pages/MyPage';
import { MyPageEditPage } from './pages/MyPageEditPage';
import { WithdrawPage } from './pages/WithdrawPage';

export interface AppProps {}

export const App: React.FC<AppProps> = () => (
  <ProfileProvider>
    <Routes>
      <Route path="/" element={<Navigate to={ROUTES.login} replace />} />
      <Route path={ROUTES.login} element={<LoginPage />} />
      <Route path={ROUTES.signup} element={<SignupPage />} />
      <Route path={ROUTES.findId} element={<FindIdPage />} />
      <Route path={ROUTES.findPassword} element={<FindPasswordPage />} />
      <Route path={ROUTES.changePassword} element={<ChangePasswordPage />} />
      <Route path={ROUTES.mypage} element={<MyPage />} />
      <Route path={ROUTES.mypageEdit} element={<MyPageEditPage />} />
      <Route path={ROUTES.withdraw} element={<WithdrawPage />} />
      <Route path="*" element={<Navigate to={ROUTES.login} replace />} />
    </Routes>
  </ProfileProvider>
);

export default App;
