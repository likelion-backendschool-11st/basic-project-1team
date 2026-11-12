import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/Button';
import { LinkButton } from '../ui/LinkButton';
import { SectionHeader } from '../ui/SectionHeader';
import { StatusPill } from '../ui/StatusPill';
import { useProfileActivity, type ActivityList } from '../../hooks/useProfileActivity';
import { BioPanel } from './BioPanel';
import { GameTag } from './GameTag';
import { ProfileActivity } from './ProfileActivity';
import { ProfileHero } from './ProfileHero';
import { ProfileIdentityCard } from './ProfileIdentityCard';
import { mypageContent as c, ROUTES } from '../../data/mockData';
import type { PublicProfile } from '../../data/mockData';

interface ProfileViewProps {
  readonly title: string;
  readonly profile: PublicProfile;
  /** 본인 프로필일 때만 넘긴다. 없으면 아이디·회원 코드·수정하기 버튼을 숨긴다. */
  readonly privateInfo?: { readonly handle: string };
}

/** 마이페이지와 회원 공개 프로필이 함께 쓰는 프로필 본문. */
export const ProfileView: React.FC<ProfileViewProps> = ({ title, profile, privateInfo }) => {
  const navigate = useNavigate();
  const activity = useProfileActivity(profile.id);
  const sectionRefs = {
    questions: useRef<HTMLElement>(null),
    answers: useRef<HTMLElement>(null),
    posts: useRef<HTMLElement>(null),
  };
  const counts = {
    questions: profile.questionCount,
    answers: profile.answerCount,
    posts: profile.postCount,
  };

  // "질문 보기" 등을 누르면 해당 작성 목록으로 스크롤
  const showActivity = (list: ActivityList) =>
    sectionRefs[list].current?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  const actionButtons = (
    <div className="flex flex-col gap-3">
      {privateInfo && (
        <LinkButton
          to={ROUTES.mypageEdit}
          variant="primary"
          size="lg"
          icon="edit_note"
          className="font-semibold"
        >
          {c.edit}
        </LinkButton>
      )}
      <Button
        variant="secondary"
        size="lg"
        icon="arrow_back"
        iconPosition="left"
        onClick={() => navigate(-1)}
        className="font-semibold"
      >
        {c.back}
      </Button>
      {privateInfo && (
        <span className="text-center font-body-sm text-body-sm text-ink-tertiary">{c.note}</span>
      )}
    </div>
  );

  // 데스크톱: 왼쪽에 프로필 카드, 오른쪽에 소개글·작성 목록. 모바일은 한 줄로 쌓는다
  return (
    <div className="flex flex-col gap-space-lg pt-space-lg pb-space-2xl">
      <div className="flex flex-wrap items-end justify-between gap-space-sm border-b border-hairline pb-space-md">
        <h1 className="font-headline-lg text-headline-lg font-semibold tracking-tight text-ink">
          {title}
        </h1>
        <div className="flex items-center gap-2">
          <StatusPill
            label={c.online}
            dot="success"
            pulse
            textTone="success"
            background="surface-1"
          />
          <StatusPill label={profile.level} textTone="primary" background="surface-3" />
        </div>
      </div>

      <div className="grid grid-cols-1 items-start gap-space-lg lg:grid-cols-12">
        <aside className="flex flex-col gap-6 lg:sticky lg:top-[108px] lg:col-span-4">
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
              {
                ...c.actions.questions,
                count: counts.questions,
                onClick: () => showActivity('questions'),
              },
              {
                ...c.actions.answers,
                count: counts.answers,
                onClick: () => showActivity('answers'),
              },
              { ...c.actions.posts, count: counts.posts, onClick: () => showActivity('posts') },
            ]}
          />
          <div className="hidden lg:block">{actionButtons}</div>
        </aside>

        <div className="flex min-w-0 flex-col gap-6 lg:col-span-8">
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

          <ProfileActivity activity={activity} counts={counts} sectionRefs={sectionRefs} />

          <div className="lg:hidden">{actionButtons}</div>
        </div>
      </div>
    </div>
  );
};
