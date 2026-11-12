import React from 'react';
import type { Attachment } from '../../data/types';
import { Icon } from '../common/Icon';

interface AttachmentTileProps {
  readonly attachment: Attachment;
  readonly onRemove: (id: string) => void;
  /** 'question' = edit-question style, 'answer' = bordered edit-answer style with uploaded check */
  readonly variant?: 'question' | 'answer';
}

export const AttachmentTile: React.FC<AttachmentTileProps> = ({ attachment: a, onRemove, variant = 'question' }) => {
  const isLog = a.kind === 'log';
  const answer = variant === 'answer';
  const iconTone = answer ? (isLog ? 'text-tertiary' : 'text-primary') : isLog ? 'text-secondary' : 'text-primary';
  return (
    <div
      className={`flex items-center justify-between group transition-colors rounded-lg ${
        answer ? 'p-2.5 bg-surface-2 border border-hairline hover:border-hairline-strong' : 'p-space-xs bg-surface-1 hover:bg-surface-2'
      }`}
    >
      <div className={`flex items-center min-w-0 overflow-hidden ${answer ? 'gap-2.5' : 'gap-space-xs'}`}>
        <div className={`w-8 h-8 rounded bg-surface-3 flex items-center justify-center shrink-0 ${iconTone}`}>
          <Icon name={isLog ? 'description' : 'image'} className="text-[18px]" />
        </div>
        <div className="flex flex-col min-w-0">
          <span className={`font-code-inline text-code-inline text-ink truncate ${answer ? 'group-hover:text-primary transition-colors' : ''}`}>{a.name}</span>
          <span className={`font-caption text-ink-tertiary ${answer ? 'text-[11px]' : 'text-caption'}`}>
            {a.size}
            {a.note ? ` • ${a.note}` : ''}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        {answer && <Icon name="check_circle" className="text-semantic-success text-[16px]" />}
        <button
          type="button"
          title="파일 삭제"
          aria-label={`${a.name} 삭제`}
          onClick={() => onRemove(a.id)}
          className={`rounded text-ink-tertiary hover:text-semantic-danger transition-colors flex items-center justify-center ${
            answer ? 'p-1 hover:bg-surface-3' : 'w-7 h-7 hover:bg-semantic-danger-surface'
          }`}
        >
          <Icon name="close" className={answer ? 'text-[16px]' : 'text-[18px]'} />
        </button>
      </div>
    </div>
  );
};

export default AttachmentTile;
