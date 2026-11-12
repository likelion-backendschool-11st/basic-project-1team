import React from 'react';
import { Card } from '../common/Card';
import { Icon } from '../common/Icon';

interface ReasonInputCardProps {
  readonly label: string;
  readonly optional: string;
  readonly hint: string;
  readonly placeholder: string;
  readonly value: string;
  readonly onChange: (v: string) => void;
  /** 'question' = compact edit-question style; 'answer' = bordered edit-answer style with history footnote */
  readonly variant?: 'question' | 'answer';
  readonly footnote?: string;
}

export const ReasonInputCard: React.FC<ReasonInputCardProps> = ({ label, optional, hint, placeholder, value, onChange, variant = 'question', footnote }) => {
  const answer = variant === 'answer';
  return (
    <Card as="section" bordered={answer} className={`p-space-md ${answer ? '' : 'flex flex-col gap-space-xs'}`}>
      <div className={`flex items-center justify-between gap-space-sm ${answer ? 'mb-space-xs' : ''}`}>
        <label
          htmlFor="edit-reason"
          className={`${answer ? 'font-headline-sm text-headline-sm gap-1.5' : 'font-label-md text-label-md gap-1'} text-ink font-semibold flex items-center`}
        >
          {label} <span className={`${answer ? 'font-caption text-caption' : ''} text-ink-tertiary font-normal`}>{optional}</span>
        </label>
        <span className={answer ? 'font-code-inline text-[11px] text-ink-tertiary' : 'font-caption text-caption text-ink-tertiary'}>{hint}</span>
      </div>
      <input
        id="edit-reason"
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full rounded-lg bg-surface-2 text-ink placeholder:text-ink-tertiary focus:outline-none focus:ring-1 focus:ring-primary-focus transition-colors px-space-sm py-2 ${
          answer ? 'border border-hairline focus:border-primary-focus font-body-md text-body-md' : 'font-body-sm text-body-sm'
        }`}
      />
      {footnote && (
        <p className="font-caption text-caption text-ink-tertiary mt-2 flex items-center gap-1">
          <Icon name="history" className="text-[14px]" />
          {footnote}
        </p>
      )}
    </Card>
  );
};

export default ReasonInputCard;
