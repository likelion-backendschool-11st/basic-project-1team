import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PageShell } from '../components/ui/PageShell';
import { SectionHeader } from '../components/ui/SectionHeader';
import { Button } from '../components/ui/Button';
import { LinkButton } from '../components/ui/LinkButton';
import { ProfileHeaderBar } from '../components/profile/ProfileHeaderBar';
import { ProfileHero } from '../components/profile/ProfileHero';
import { ProfileIdentityCard } from '../components/profile/ProfileIdentityCard';
import { BioPanel } from '../components/profile/BioPanel';
import { GameTag } from '../components/profile/GameTag';
import { useProfile } from '../hooks/useProfile';
import { mypageContent as c, ROUTES } from '../data/mockData';

export interface MyPageProps {}

export const MyPage: React.FC<MyPageProps> = () => {
  const navigate = useNavigate();
  const { profile } = useProfile();

  return (
    <PageShell>
      <div className="relative w-full overflow-hidden rounded-xl bg-surface-1 shadow-xl">
        <ProfileHeaderBar title={c.title} userCode={profile.userCode} onlineLabel={c.online} level={profile.level} />

        <div className="flex flex-col gap-6 p-6 md:p-8">
          <ProfileHero
            imageUrl={profile.avatarUrl}
            imageAlt={profile.avatarAlt}
            rank={profile.rank}
            verifiedLabel={c.verified}
            since={profile.since}
          />

          <ProfileIdentityCard
            nicknameLabel={c.nicknameLabel}
            nickname={profile.nickname}
            handle={profile.handle}
            actions={[
              { ...c.actions.questions, count: profile.questionCount },
              { ...c.actions.posts, count: profile.postCount },
            ]}
          />

          <section className="space-y-2">
            <SectionHeader icon={c.bio.icon} label={c.bio.label} meta={c.bio.meta} />
            <BioPanel text={profile.bio} stats={[profile.mannerTemp, profile.responseRate]} />
          </section>

          <section className="space-y-2">
            <SectionHeader
              icon={c.games.icon}
              label={c.games.label}
              meta={`${profile.games.length}${c.games.metaSuffix}`}
              metaTone="accent"
            />
            <div className="flex flex-wrap gap-2 rounded-xl bg-surface-2 p-4 shadow-sm">
              {profile.games.map((game) => (
                <GameTag key={game.name} name={game.name} tone={game.tone} />
              ))}
            </div>
          </section>

          <div className="flex flex-col items-center gap-3 pt-4">
            <div className="flex w-full max-w-xs flex-col gap-3">
              <LinkButton to={ROUTES.mypageEdit} variant="primary" size="lg" icon="edit_note" className="font-semibold">
                {c.edit}
              </LinkButton>
              <Button variant="secondary" size="lg" icon="arrow_back" iconPosition="left" onClick={() => navigate(-1)} className="font-semibold">
                {c.back}
              </Button>
            </div>
            <span className="text-center font-body-sm text-body-sm text-ink-tertiary">{c.note}</span>
          </div>
        </div>
      </div>
    </PageShell>
  );
};

export default MyPage;
