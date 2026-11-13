import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert } from '../ui/Alert';
import { Button } from '../ui/Button';
import { GlowCard } from '../ui/GlowCard';
import { PageShell } from '../ui/PageShell';
import { mypageContent as c } from '../../data/mockData';

interface ProfileStatusProps {
  /** 불러오는 중이면 true. 아니면 message 를 오류로 보여 준다 */
  readonly loading: boolean;
  readonly message: string | null;
}

/** 프로필을 불러오는 중이거나 불러오지 못했을 때 보여 주는 화면 */
export const ProfileStatus: React.FC<ProfileStatusProps> = ({ loading, message }) => {
  const navigate = useNavigate();
  return (
    <PageShell>
      <GlowCard className="space-y-6 p-6 sm:p-8">
        {loading ? (
          <p role="status" className="text-center font-body-md text-body-md text-ink-muted">
            {c.loading}
          </p>
        ) : (
          <Alert icon="person_off">{message ?? c.notFound}</Alert>
        )}
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
