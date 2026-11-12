import React from 'react';
import { Icon } from '../common/Icon';

interface AnswerCountBadgeProps {
  readonly count: number;
  readonly accepted: boolean;
}

export const AnswerCountBadge: React.FC<AnswerCountBadgeProps> = ({ count, accepted }) => {
  if (accepted) {
    return (
      <span className="inline-flex items-center gap-1 min-w-[50px] px-2 py-0.5 rounded bg-semantic-success text-on-primary font-code-inline text-code-inline font-bold">
        <Icon name="check_circle" className="text-[13px]" />
        <span>{count}</span>
      </span>
    );
  }
  if (count === 0) {
    return (
      <span className="inline-flex items-center justify-center min-w-[42px] px-2 py-0.5 rounded bg-transparent font-code-inline text-code-inline text-ink-tertiary">
        {count}
      </span>
    );
  }
  return (
    <span
      className={`inline-flex items-center justify-center min-w-[42px] px-2 py-0.5 rounded bg-surface-2 border border-hairline font-code-inline text-code-inline text-ink ${
        count >= 100 ? 'font-semibold' : 'font-medium'
      }`}
    >
      {count}
    </span>
  );
};
