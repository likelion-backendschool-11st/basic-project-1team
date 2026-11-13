import React from 'react';
import { HOME_PATH } from '../../../shared/auth';
import { ProfileStatus } from '../components/profile/ProfileStatus';
import { ProfileView } from '../components/profile/ProfileView';
import { useProfile } from '../hooks/useProfile';
import { mypageContent as c } from '../data/mockData';

export const MyPage: React.FC = () => {
  const { profile, loading, errorMessage } = useProfile();

  if (!profile) return <ProfileStatus loading={loading} message={errorMessage} />;

  // 돌아가기는 이전 페이지가 아니라 질문게시판으로 이동한다 (REQ-MYPAGE-006)
  return (
    <ProfileView
      title={c.title}
      profile={profile}
      privateInfo={{ handle: `@${profile.username}` }}
      backTo={HOME_PATH}
    />
  );
};
