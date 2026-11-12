import React from 'react';
import type { Attachment } from '../../data/types';
import { Icon } from '../common/Icon';

interface AttachmentPillProps {
  readonly attachment: Attachment;
  readonly onRemove: (id: string) => void;
}

export const AttachmentPill: React.FC<AttachmentPillProps> = ({ attachment: a, onRemove }) => (
  <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-surface-2 font-caption text-caption text-ink-subtle">
    <Icon
      name={a.kind === 'log' ? 'description' : 'image'}
      className={`text-[16px] ${a.kind === 'log' ? 'text-tertiary' : 'text-secondary'}`}
    />
    <span className="font-code-inline text-[12px] text-ink">{a.name}</span>
    <span className="text-ink-tertiary text-[11px]">({a.size})</span>
    <button
      type="button"
      aria-label={`${a.name} 삭제`}
      onClick={() => onRemove(a.id)}
      className="hover:text-semantic-danger text-ink-tertiary flex items-center"
    >
      <Icon name="close" className="text-[14px]" />
    </button>
  </div>
);
