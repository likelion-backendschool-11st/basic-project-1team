import React from 'react';
import { BrandLogo } from '../ui/BrandLogo';
import { StatusPill } from '../ui/StatusPill';

interface ProfileHeaderBarProps {
  readonly title: string;
  /** 본인 프로필에서만 넘긴다. */
  readonly userCode?: string;
  readonly onlineLabel: string;
  readonly level: string;
}

export const ProfileHeaderBar: React.FC<ProfileHeaderBarProps> = ({ title, userCode, onlineLabel, level }) => (
  <div className="flex items-center justify-between bg-surface-2 px-6 py-4">
    <div className="flex items-center gap-3">
      <BrandLogo size="sm" />
      <div className="flex flex-col">
        <h1 className="font-label-md text-label-md font-semibold text-ink">{title}</h1>
        {userCode && <span className="font-label-code text-label-code text-ink-subtle">{userCode}</span>}
      </div>
    </div>
    <div className="flex items-center gap-2">
      <StatusPill label={onlineLabel} dot="success" pulse textTone="success" background="surface-1" />
      <StatusPill label={level} textTone="primary" background="surface-3" />
    </div>
  </div>
);
