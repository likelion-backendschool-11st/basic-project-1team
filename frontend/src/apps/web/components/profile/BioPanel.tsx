import React from 'react';
import { RichTextView } from '../../../../shared/editor/RichTextView';

interface BioPanelProps {
  /** 소개글 HTML. 없으면 null */
  readonly text: string | null;
  readonly emptyText: string;
}

export const BioPanel: React.FC<BioPanelProps> = ({ text, emptyText }) => (
  <div className="flex min-h-[96px] flex-col rounded-xl bg-surface-2 p-4 font-body-md text-body-md leading-relaxed text-ink-muted shadow-sm">
    {text ? <RichTextView html={text} /> : <p className="text-ink-tertiary">{emptyText}</p>}
  </div>
);
