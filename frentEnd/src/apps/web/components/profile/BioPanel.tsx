import React, { Fragment } from 'react';

interface BioPanelProps {
  readonly text: string;
  readonly stats: readonly string[];
}

export const BioPanel: React.FC<BioPanelProps> = ({ text, stats }) => (
  <div className="flex min-h-[96px] flex-col justify-between rounded-xl bg-surface-2 p-4 font-body-md text-body-md leading-relaxed text-ink-muted shadow-sm">
    <p className="whitespace-pre-line">{text}</p>
    <div className="mt-3 flex items-center justify-end gap-3 pt-2">
      {stats.map((stat, index) => (
        <Fragment key={stat}>
          {index > 0 && <span aria-hidden="true" className="h-1 w-1 rounded-full bg-ink-tertiary" />}
          <span className={`font-label-code text-label-code ${index === 0 ? 'text-ink-tertiary' : 'text-ink-subtle'}`}>
            {stat}
          </span>
        </Fragment>
      ))}
    </div>
  </div>
);

export default BioPanel;
