import React from 'react';
import { reportPage as R } from '../../data/mockData';
import type { ReportReason } from '../../data/types';
import { Card } from '../common/Card';

interface ReasonSelectorProps {
  readonly reasons: readonly ReportReason[];
  readonly value: string;
  readonly onChange: (value: string) => void;
}

export const ReasonSelector: React.FC<ReasonSelectorProps> = ({ reasons, value, onChange }) => (
  <Card className="p-6">
    <div className="flex items-center justify-between mb-3">
      <span className="font-headline-sm text-headline-sm text-ink flex items-center gap-1.5">
        <span className="text-semantic-danger font-bold">*</span>
        <span>{R.reasonTitle}</span>
      </span>
      <span className="font-caption text-caption text-ink-tertiary">{R.reasonHint}</span>
    </div>
    <div role="radiogroup" className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
      {reasons.map((reason) => {
        const checked = reason.value === value;
        return (
          <label
            key={reason.value}
            className={`relative flex items-start gap-3 p-3.5 rounded-lg border hover:border-hairline-strong cursor-pointer transition-colors group ${
              checked ? 'border-primary-focus bg-surface-3' : 'border-hairline bg-surface-2'
            }`}
          >
            <input
              type="radio"
              name="report_reason"
              value={reason.value}
              checked={checked}
              onChange={() => onChange(reason.value)}
              className="mt-0.5 accent-primary-container"
            />
            <div className="flex flex-col">
              <span className="font-label-md text-label-md text-ink group-hover:text-primary-fixed transition-colors">{reason.label}</span>
              <span className="font-caption text-caption text-ink-subtle mt-0.5">{reason.description}</span>
            </div>
          </label>
        );
      })}
    </div>
  </Card>
);

export default ReasonSelector;
