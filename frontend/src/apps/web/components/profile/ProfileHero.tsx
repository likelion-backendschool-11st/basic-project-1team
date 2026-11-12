import React from 'react';
import { Icon } from '../ui/Icon';

interface ProfileHeroProps {
  readonly imageUrl: string;
  readonly imageAlt: string;
  readonly rank: string;
  readonly verifiedLabel: string;
  readonly since: string;
}

export const ProfileHero: React.FC<ProfileHeroProps> = ({ imageUrl, imageAlt, rank, verifiedLabel, since }) => (
  <div className="group relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-surface-2">
    <img
      src={imageUrl}
      alt={imageAlt}
      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
    />
    <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-canvas via-transparent to-transparent opacity-80" />
    <div className="absolute right-4 top-4 flex items-center gap-1 rounded-full bg-surface-1/80 px-2.5 py-1 font-label-code text-label-code text-primary backdrop-blur">
      <Icon name="military_tech" filled className="text-[14px]" />
      {rank}
    </div>
    <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
      <div className="flex items-center gap-2">
        <Icon name="verified" filled className="text-[20px] text-primary" />
        <span className="font-body-sm text-body-sm text-ink-muted">{verifiedLabel}</span>
      </div>
      <span className="font-label-code text-label-code text-ink-subtle">{since}</span>
    </div>
  </div>
);
