import React from 'react';
import { Icon } from './Icon';
import { common } from '../../data/mockData';

interface AlertProps {
  readonly tone?: 'danger' | 'neutral';
  readonly icon?: string;
  readonly title?: string;
  readonly children: React.ReactNode;
  readonly onDismiss?: () => void;
}

/** Boxed feedback: login auth error, account-not-found, find-id result. */
export const Alert: React.FC<AlertProps> = ({ tone = 'danger', icon, title, children, onDismiss }) => {
  const isDanger = tone === 'danger';
  const box = isDanger && !title
    ? 'border border-semantic-danger/30 bg-semantic-danger/10 text-semantic-danger'
    : 'bg-surface-2 text-ink-muted';

  return (
    <div
      role={isDanger ? 'alert' : 'status'}
      className={`flex animate-fadeIn items-start gap-2.5 rounded-lg px-3.5 py-3 font-body-sm text-body-sm shadow-sm ${box}`}
    >
      <Icon
        name={icon ?? (isDanger ? 'error' : 'check_circle')}
        filled={isDanger}
        className={`mt-0.5 shrink-0 text-[18px] ${isDanger ? 'text-semantic-danger' : 'text-semantic-success'}`}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        {title && <span className="font-label-md text-label-md font-medium text-ink">{title}</span>}
        <div className={title ? 'mt-0.5 text-error/90' : ''}>{children}</div>
      </div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label={common.dismissLabel}
          className="rounded p-0.5 text-ink-tertiary transition-colors hover:text-ink"
        >
          <Icon name="close" className="text-[16px]" />
        </button>
      )}
    </div>
  );
};
