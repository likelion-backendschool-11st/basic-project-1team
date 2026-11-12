import React from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { isLoggedIn } from '../../../shared/auth';
import { Alert } from '../components/ui/Alert';
import { Button } from '../components/ui/Button';
import { GlowCard } from '../components/ui/GlowCard';
import { PageShell } from '../components/ui/PageShell';
import { ProfileView } from '../components/profile/ProfileView';
import { useProfile } from '../hooks/useProfile';
import { findPublicProfile, mypageContent as c, ROUTES } from '../data/mockData';

/** 회원 공개 프로필. 다른 회원·비회원에게는 아이디·회원 코드 등 개인정보를 보여 주지 않는다. */
export const UserProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { userId } = useParams();
  const { profile: me } = useProfile();
  const id = Number(userId);

  if (isLoggedIn() && id === me.id) return <Navigate to={ROUTES.mypage} replace />;

  // TODO: GET /api/users/:userId 연동
  const profile = findPublicProfile(id);

  if (profile) return <ProfileView title={c.publicTitle} profile={profile} />;

  return (
    <PageShell>
      <GlowCard className="space-y-6 p-6 sm:p-8">
        <Alert icon="person_off">{c.notFound}</Alert>
        <Button
          variant="secondary"
          icon="arrow_back"
          iconPosition="left"
          onClick={() => navigate(-1)}
          className="w-full"
        >
          {c.back}
        </Button>
      </GlowCard>
    </PageShell>
  );
};
