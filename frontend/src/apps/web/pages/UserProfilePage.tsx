import React from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { ProfileStatus } from '../components/profile/ProfileStatus';
import { ProfileView } from '../components/profile/ProfileView';
import { useProfile } from '../hooks/useProfile';
import { useUserProfile } from '../hooks/useUserProfile';
import { mypageContent as c, ROUTES } from '../data/mockData';

/** 회원 공개 프로필. 다른 회원·비회원에게는 아이디 등 개인정보를 보여 주지 않는다. */
export const UserProfilePage: React.FC = () => {
  const { userId } = useParams();
  const id = Number(userId);
  const { profile: me } = useProfile();
  const { profile, loading, errorMessage } = useUserProfile(id);

  // 본인이면 마이페이지로 보낸다 (API_SPEC 2장 GET /api/users/:userId)
  if (me && id === me.id) return <Navigate to={ROUTES.mypage} replace />;

  if (profile) return <ProfileView title={c.publicTitle} profile={profile} />;

  return <ProfileStatus loading={loading} message={errorMessage} />;
};
