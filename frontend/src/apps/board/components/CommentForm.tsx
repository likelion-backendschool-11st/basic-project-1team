import React, { type KeyboardEvent } from 'react';
import { labels } from '../data/mockData';
import { Icon } from './Icon';

interface CommentFormProps {
  readonly value: string;
  readonly onChange: (value: string) => void;
  readonly onSubmit: () => void;
  readonly onKeyDown: (e: KeyboardEvent<HTMLInputElement>) => void;
  /** 댓글 제한·이용 정지 안내. 있으면 입력을 막는다 */
  readonly restriction?: string | null;
}

export const CommentForm: React.FC<CommentFormProps> = ({
  value,
  onChange,
  onSubmit,
  onKeyDown,
  restriction = null,
}) => (
  <div className="border-t p-4 border-hairline bg-surface-2/40 sm:p-6">
    <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder={restriction ?? labels.commentPlaceholder}
        disabled={restriction !== null}
        aria-label={labels.commentPlaceholder}
        className="flex-1 rounded-lg border px-4 py-3 text-sm shadow-inner transition-colors focus:border-primary-container focus:outline-none focus:ring-2 focus:ring-primary-container border-hairline-strong bg-surface-2 text-ink placeholder-ink-subtle"
      />
      <button
        type="button"
        onClick={onSubmit}
        disabled={restriction !== null}
        className="flex items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-primary-container px-6 py-3 text-sm font-semibold text-white shadow-md transition-all hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary-container disabled:opacity-50"
      >
        {labels.commentSubmit}
        <Icon name="arrow_forward" className="text-[16px]" />
      </button>
    </div>
  </div>
);
