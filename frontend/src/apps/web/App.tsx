import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
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

/** 기본 화면은 Q&A */
const RedirectToHome: React.FC = () => <Navigate to={HOME_PATH} replace />;

/** 회원·계정 화면. site 라우터 안에서 그려진다 (apps/site/App). */
export const App: React.FC = () => (
  <Routes>
    <Route path="/" element={<RedirectToHome />} />
    <Route path={ROUTES.login} element={<LoginPage />} />
    <Route path={ROUTES.signup} element={<SignupPage />} />
    <Route path={ROUTES.findId} element={<FindIdPage />} />
    <Route path={ROUTES.findPassword} element={<FindPasswordPage />} />
    <Route path={ROUTES.changePassword} element={<ChangePasswordPage />} />
    <Route
      path={ROUTES.mypage}
      element={
        <RequireLogin>
          <MyPage />
        </RequireLogin>
      }
    />
    <Route
      path={ROUTES.mypageEdit}
      element={
        <RequireLogin>
          <MyPageEditPage />
        </RequireLogin>
      }
    />
    <Route
      path={ROUTES.withdraw}
      element={
        <RequireLogin>
          <WithdrawPage />
        </RequireLogin>
      }
    />
    <Route path={ROUTES.userProfile} element={<UserProfilePage />} />
    <Route path="*" element={<RedirectToHome />} />
  </Routes>
);
