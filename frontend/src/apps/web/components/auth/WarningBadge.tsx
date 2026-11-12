import React from 'react';
import { Icon } from '../ui/Icon';

interface WarningBadgeProps {
  readonly icon?: string;
}

/** Large glowing danger icon (withdraw screen hero). */
export const WarningBadge: React.FC<WarningBadgeProps> = ({ icon = 'warning' }) => (
  <div className="relative flex items-center justify-center">
    <div aria-hidden="true" className="absolute inset-0 rounded-full bg-semantic-danger/20 blur-md" />
    <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-surface-2 text-semantic-danger shadow-inner">
      <Icon name={icon} filled className="text-[32px]" />
    </div>
  </div>
);
