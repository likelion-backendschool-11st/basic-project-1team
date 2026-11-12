import React from 'react';
import { Link } from 'react-router-dom';
import type { Kpi, KpiTone } from '../../types';
import { Icon } from '../ui/Icon';

interface KpiCardProps {
  readonly kpi: Kpi;
}

const toneStyles: Record<KpiTone, { border: string; label: string; icon: string; value: string }> = {
  default: { border: 'hover:border-hairline-strong', label: 'text-ink-muted', icon: 'text-ink-muted', value: 'text-ink' },
  attention: { border: 'hover:border-primary-focus/50', label: 'text-ink-muted', icon: 'text-primary', value: 'text-ink' },
  urgent: { border: 'hover:border-error/40', label: 'text-error', icon: 'text-error', value: 'text-error' },
};

export const KpiCard: React.FC<KpiCardProps> = ({ kpi }) => {
  const tone = toneStyles[kpi.tone];
  return (
    <Link
      to={kpi.href}
      className={`specular-card flex flex-col justify-between rounded-lg border border-hairline bg-surface-1 p-space-md transition-all duration-150 hover:bg-surface-2 ${tone.border}`}
    >
      <div className="flex items-center justify-between">
        <span className={`flex items-center gap-1 text-eyebrow font-medium uppercase tracking-wider ${tone.label}`}>
          {kpi.tone === 'urgent' && <span className="h-1.5 w-1.5 rounded-full bg-error" />}
          {kpi.label}
        </span>
        <Icon name={kpi.icon} className={tone.icon} />
      </div>
      <span className={`mt-3 text-headline-lg font-bold tracking-tight ${tone.value}`}>{kpi.value}</span>
    </Link>
  );
};
