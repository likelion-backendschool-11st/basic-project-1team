import React from 'react';
import { reportGuide as G } from '../../data/mockData';
import { Card } from '../common/Card';
import { Icon } from '../common/Icon';

interface ReportGuideCardProps {
  readonly className?: string;
}

export const ReportGuideCard: React.FC<ReportGuideCardProps> = ({ className = '' }) => (
  <Card className={`p-5 flex flex-col gap-4 ${className}`}>
    <div className="flex items-center gap-2 pb-3 border-b border-hairline">
      <Icon name="verified_user" className="text-primary-container text-[20px]" />
      <h3 className="font-headline-sm text-headline-sm text-ink">{G.title}</h3>
    </div>
    <div className="p-3 bg-surface-2 rounded-lg border border-hairline flex items-center justify-between">
      <div className="flex flex-col">
        <span className="font-caption text-caption text-ink-tertiary">{G.slaLabel}</span>
        <span className="font-headline-md text-headline-md text-ink font-code-inline">
          {G.slaValue} <span className="text-body-sm font-sans text-ink-subtle">{G.slaUnit}</span>
        </span>
      </div>
      <div className="text-right flex flex-col items-end">
        <span className="font-caption text-caption text-semantic-success flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-semantic-success" />
          {G.liveLabel}
        </span>
        <span className="font-code-inline text-[11px] text-ink-tertiary mt-1">{G.slaRate}</span>
      </div>
    </div>
    <div className="flex flex-col gap-3 font-body-sm text-body-sm text-ink-subtle">
      {G.steps.map((step, i) => (
        <div key={step.title} className="flex items-start gap-3">
          <span className="w-5 h-5 rounded-full bg-surface-3 border border-hairline-strong font-code-inline text-[11px] flex items-center justify-center text-primary-fixed shrink-0 mt-0.5">
            {i + 1}
          </span>
          <div>
            <p className="font-label-md text-label-md text-ink">{step.title}</p>
            <p className="font-caption text-caption text-ink-tertiary">{step.body}</p>
          </div>
        </div>
      ))}
    </div>
    <div className="p-3.5 bg-surface-2 rounded-lg border-l-2 border-tertiary flex flex-col gap-1 text-caption font-caption text-ink-subtle">
      <span className="font-label-md text-label-md text-tertiary flex items-center gap-1">
        <Icon name="help_center" className="text-[15px]" />
        {G.calloutTitle}
      </span>
      <p className="leading-relaxed">
        {G.calloutPrefix}
        <strong>{G.calloutStrong}</strong>
        {G.calloutSuffix}
      </p>
    </div>
  </Card>
);
