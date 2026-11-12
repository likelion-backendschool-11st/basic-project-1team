import React, { type ReactNode } from 'react';
import { Icon } from './Icon';

interface CardHeaderProps {
  readonly title: ReactNode;
  readonly icon?: string;
  readonly subtitle?: ReactNode;
  readonly aside?: ReactNode;
  readonly className?: string;
}

export const CardHeader: React.FC<CardHeaderProps> = ({ title, icon, subtitle, aside, className = '' }) => {
  return (
    <div className={`flex items-center justify-between gap-4 border-b border-hairline pb-3 ${className}`}>
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          {icon && <Icon name={icon} className="!text-[20px] text-primary" />}
          <h2 className="text-headline-sm font-semibold text-ink">{title}</h2>
        </div>
        {subtitle && <p className="mt-0.5 text-body-sm text-ink-subtle">{subtitle}</p>}
      </div>
      {aside && <div className="flex shrink-0 items-center gap-3">{aside}</div>}
    </div>
  );
};
