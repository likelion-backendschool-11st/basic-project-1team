import React from 'react';
import { HOME_PATH } from '../../../shared/auth';
import { ProfileView } from '../components/profile/ProfileView';
import { useProfile } from '../hooks/useProfile';
import { mypageContent as c } from '../data/mockData';

export const MyPage: React.FC = () => {
  const { profile } = useProfile();

  // 돌아가기는 이전 페이지가 아니라 질문게시판으로 이동한다 (REQ-MYPAGE-006)
  return (
    <ProfileView
      title={c.title}
      profile={profile}
      privateInfo={{ handle: profile.handle }}
      backTo={HOME_PATH}
    />
  );
};
