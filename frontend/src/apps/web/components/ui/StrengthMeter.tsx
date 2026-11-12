import React from 'react';
import type { StrengthScore } from '../../hooks/usePasswordStrength';

interface StrengthMeterProps {
  readonly score: StrengthScore;
  /** Labels for score 0..3. */
  readonly labels: readonly string[];
}

const BAR_COLOR = (bar: number, score: StrengthScore): string => {
  if (score < bar) return 'bg-hairline';
  if (score === 3) return 'bg-semantic-success';
  return 'bg-semantic-warning';
};

const LABEL_COLOR: Record<StrengthScore, string> = {
  0: 'text-ink-tertiary',
  1: 'text-semantic-warning',
  2: 'text-tertiary',
  3: 'font-semibold text-semantic-success',
};

export const StrengthMeter: React.FC<StrengthMeterProps> = ({ score, labels }) => (
  <div className="flex items-center gap-1.5 px-0.5 pt-1" aria-live="polite">
    {[1, 2, 3].map((bar) => (
      <div
        key={bar}
        className={`h-1 flex-1 rounded-full transition-all duration-300 ${BAR_COLOR(bar, score)}`}
      />
    ))}
    <span
      className={`ml-1 min-w-[36px] text-right font-label-code text-label-code ${LABEL_COLOR[score]}`}
    >
      {labels[score]}
    </span>
  </div>
);
