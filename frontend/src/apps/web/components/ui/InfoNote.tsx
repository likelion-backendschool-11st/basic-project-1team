import React from 'react';
import { Icon } from './Icon';

interface InfoNoteProps {
  readonly icon: string;
  readonly primary: string;
  readonly secondary?: string;
}

/** Muted notice card (password policy hint). */
export const InfoNote: React.FC<InfoNoteProps> = ({ icon, primary, secondary }) => (
  <div className="flex items-start gap-2.5 rounded-lg bg-surface-2/60 p-3">
    <Icon name={icon} className="mt-0.5 shrink-0 text-[18px] text-ink-subtle" />
    <div className="flex flex-col gap-0.5 font-body-sm text-body-sm leading-relaxed text-ink-subtle">
      <span>{primary}</span>
      {secondary && <span className="text-[11px] text-ink-tertiary">{secondary}</span>}
    </div>
  </div>
);

export default InfoNote;
