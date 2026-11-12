import React from 'react';
import { Icon } from './Icon';

interface PageHeaderProps {
  readonly title: string;
  readonly description?: string;
  readonly align?: 'left' | 'center';
  /** Small monospace label above the title. */
  readonly eyebrow?: { readonly icon: string; readonly label: string };
  readonly eyebrowTone?: 'muted' | 'primary';
  /** Icon rendered after the title text. */
  readonly titleIcon?: string;
  /** Visual (logo / badge) rendered above everything. */
  readonly media?: React.ReactNode;
  readonly className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  align = 'left',
  eyebrow,
  eyebrowTone = 'muted',
  titleIcon,
  media,
  className = '',
}) => {
  const centered = align === 'center';
  return (
    <header
      className={`flex flex-col gap-2 ${centered ? 'items-center text-center' : ''} ${className}`}
    >
      {media && <div className="mb-1">{media}</div>}
      {eyebrow && (
        <div
          className={`flex items-center gap-2 font-label-code text-label-code uppercase tracking-wider ${
            eyebrowTone === 'primary' ? 'text-primary' : 'text-ink-tertiary'
          }`}
        >
          <Icon name={eyebrow.icon} className="text-[20px] text-primary" />
          <span>{eyebrow.label}</span>
        </div>
      )}
      <h1 className="flex items-center gap-2 font-headline-md text-headline-md tracking-tight text-ink">
        <span>{title}</span>
        {titleIcon && <Icon name={titleIcon} className="text-[20px] text-primary" />}
      </h1>
      {description && (
        <p className={`font-body-md text-body-md text-ink-subtle ${centered ? 'max-w-sm' : ''}`}>
          {description}
        </p>
      )}
    </header>
  );
};
