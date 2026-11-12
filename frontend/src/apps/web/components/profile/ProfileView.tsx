import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/Button';
import { LinkButton } from '../ui/LinkButton';
import { SectionHeader } from '../ui/SectionHeader';
import { useProfileActivity, type ActivityTab } from '../../hooks/useProfileActivity';
import { BioPanel } from './BioPanel';
import { GameTag } from './GameTag';
import { ProfileActivity } from './ProfileActivity';
import { ProfileHeaderBar } from './ProfileHeaderBar';
import { ProfileHero } from './ProfileHero';
import { ProfileIdentityCard } from './ProfileIdentityCard';
import { mypageContent as c, ROUTES } from '../../data/mockData';
import type { PublicProfile } from '../../data/mockData';

interface ProfileViewProps {
  readonly title: string;
  readonly profile: PublicProfile;
  /** 본인 프로필일 때만 넘긴다. 없으면 아이디·회원 코드·수정하기 버튼을 숨긴다. */
  readonly privateInfo?: { readonly userCode: string; readonly handle: string };
}

/** 마이페이지와 회원 공개 프로필이 함께 쓰는 프로필 본문. */
export const ProfileView: React.FC<ProfileViewProps> = ({ title, profile, privateInfo }) => {
  const navigate = useNavigate();
  const activity = useProfileActivity(profile.id);
  const activityRef = useRef<HTMLElement>(null);
  const counts = { questions: profile.questionCount, answers: profile.answerCount, posts: profile.postCount };

  // "질문 보기" 등을 누르면 작성 목록의 해당 탭으로 이동
  const showActivity = (tab: ActivityTab) => {
    activity.setTab(tab);
    activityRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="relative w-full overflow-hidden rounded-xl bg-surface-1 shadow-xl">
      <ProfileHeaderBar title={title} userCode={privateInfo?.userCode} onlineLabel={c.online} level={profile.level} />

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
          handle={privateInfo?.handle}
          actions={[
            { ...c.actions.questions, count: counts.questions, onClick: () => showActivity('questions') },
            { ...c.actions.answers, count: counts.answers, onClick: () => showActivity('answers') },
            { ...c.actions.posts, count: counts.posts, onClick: () => showActivity('posts') },
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

        <section ref={activityRef} className="scroll-mt-6 space-y-2">
          <SectionHeader icon={c.activity.icon} label={c.activity.label} />
          <ProfileActivity activity={activity} counts={counts} />
        </section>

        <div className="flex flex-col items-center gap-3 pt-4">
          <div className="flex w-full max-w-xs flex-col gap-3">
            {privateInfo && (
              <LinkButton to={ROUTES.mypageEdit} variant="primary" size="lg" icon="edit_note" className="font-semibold">
                {c.edit}
              </LinkButton>
            )}
            <Button variant="secondary" size="lg" icon="arrow_back" iconPosition="left" onClick={() => navigate(-1)} className="font-semibold">
              {c.back}
            </Button>
          </div>
          {privateInfo && <span className="text-center font-body-sm text-body-sm text-ink-tertiary">{c.note}</span>}
        </div>
      </div>
    </div>
  );
};

export default ProfileView;
