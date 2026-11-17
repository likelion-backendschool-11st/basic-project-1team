import React from 'react';
import { Icon } from '../ui/Icon';

interface ProfileHeroProps {
  /** 프로필 사진. 없으면 기본 아이콘을 보여 준다 */
  readonly imageUrl: string | null;
  readonly imageAlt: string;
  /** 가입 연월 (예: SINCE 2022.03) */
  readonly since: string;
}

export const ProfileHero: React.FC<ProfileHeroProps> = ({ imageUrl, imageAlt, since }) => (
  <div className="group relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-surface-2">
    {imageUrl ? (
      <img
        src={imageUrl}
        alt={imageAlt}
        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
    ) : (
      <div
        role="img"
        aria-label={imageAlt}
        className="flex h-full w-full items-center justify-center"
      >
        <Icon name="person" className="text-[96px] text-ink-tertiary" />
      </div>
    )}
    <div
      aria-hidden="true"
      className="absolute inset-0 bg-gradient-to-t from-canvas via-transparent to-transparent opacity-80"
    />
    <div className="absolute bottom-4 right-4">
      <span className="font-label-code text-label-code text-ink-subtle">{since}</span>
    </div>
  </div>
);
