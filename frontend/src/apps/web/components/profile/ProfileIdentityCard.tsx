import React from 'react';
import { Icon } from '../ui/Icon';

interface ActivityStat {
  readonly label: string;
  readonly count: number;
}

interface ProfileIdentityCardProps {
  readonly nicknameLabel: string;
  readonly nickname: string;
  /** 로그인 아이디. 본인 프로필에서만 넘긴다. */
  readonly handle?: string;
  /** 활동 통계: 작성한 질문·답변·게시글 수 (questionCount·answerCount·postCount) */
  readonly stats: readonly ActivityStat[];
}

export const ProfileIdentityCard: React.FC<ProfileIdentityCardProps> = ({
  nicknameLabel,
  nickname,
  handle,
  stats,
}) => (
  <section className="flex flex-col gap-4 rounded-xl bg-surface-2 p-4">
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface-3 text-primary">
        <Icon name="badge" />
      </div>
      <div>
        <div className="flex items-center gap-2">
          <span className="font-label-md text-label-md text-ink-subtle">{nicknameLabel}</span>
          <span className="font-headline-sm text-headline-sm font-bold text-ink">{nickname}</span>
        </div>
        {handle && <p className="font-label-code text-label-code text-primary">{handle}</p>}
      </div>
    </div>
    <dl className="grid w-full grid-cols-3 divide-x divide-hairline rounded-lg bg-surface-3/60">
      {stats.map((stat) => (
        <div key={stat.label} className="flex flex-col items-center gap-0.5 py-3">
          <dt className="font-caption text-caption text-ink-tertiary">{stat.label}</dt>
          <dd className="font-headline-sm text-headline-sm font-bold text-ink">
            {stat.count.toLocaleString()}
          </dd>
        </div>
      ))}
    </dl>
  </section>
);
