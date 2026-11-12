import React from 'react';
import { Icon } from '../ui/Icon';
import { CountButton } from './CountButton';

interface IdentityAction {
  readonly icon: string;
  readonly label: string;
  readonly count: number;
  readonly onClick?: () => void;
}

interface ProfileIdentityCardProps {
  readonly nicknameLabel: string;
  readonly nickname: string;
  /** 로그인 아이디. 본인 프로필에서만 넘긴다. */
  readonly handle?: string;
  readonly actions: readonly IdentityAction[];
}

export const ProfileIdentityCard: React.FC<ProfileIdentityCardProps> = ({
  nicknameLabel,
  nickname,
  handle,
  actions,
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
    <div className="grid w-full grid-cols-3 gap-3">
      {actions.map((action) => (
        <CountButton key={action.label} {...action} />
      ))}
    </div>
  </section>
);
