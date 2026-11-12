import React from 'react';
import { Icon } from '../ui/Icon';

interface HighlightRowProps {
  readonly icon: string;
  readonly label: string;
  readonly value: string;
}

/** Community teaser strip: "오늘 등록된 새 공략  +1,280건". */
export const HighlightRow: React.FC<HighlightRowProps> = ({ icon, label, value }) => (
  <div className="flex w-full items-center justify-between rounded-lg bg-surface-2/60 p-3 text-ink-subtle">
    <div className="flex items-center gap-2">
      <Icon name={icon} className="text-[18px] text-primary" />
      <span className="font-body-sm text-body-sm text-ink-muted">{label}</span>
    </div>
    <span className="rounded bg-surface-3 px-2 py-0.5 font-label-code text-label-code text-ink">
      {value}
    </span>
  </div>
);
