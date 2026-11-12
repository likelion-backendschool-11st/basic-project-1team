import React from 'react';
import { ProfileView } from '../components/profile/ProfileView';
import { useProfile } from '../hooks/useProfile';
import { mypageContent as c } from '../data/mockData';

export const MyPage: React.FC = () => {
  const { profile } = useProfile();

  return <ProfileView title={c.title} profile={profile} privateInfo={{ handle: profile.handle }} />;
};
