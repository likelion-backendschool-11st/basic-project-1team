import React from 'react';
import { PageShell } from '../components/ui/PageShell';
import { ProfileView } from '../components/profile/ProfileView';
import { useProfile } from '../hooks/useProfile';
import { mypageContent as c } from '../data/mockData';

export interface MyPageProps {}

export const MyPage: React.FC<MyPageProps> = () => {
  const { profile } = useProfile();

  return (
    <PageShell>
      <ProfileView title={c.title} profile={profile} privateInfo={{ userCode: profile.userCode, handle: profile.handle }} />
    </PageShell>
  );
};

export default MyPage;
