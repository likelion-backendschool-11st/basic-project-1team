import React from 'react';
import { ui } from '../../data/mockData';

interface ResultCountProps {
  readonly count: number;
  readonly unit?: string;
}

export const ResultCount: React.FC<ResultCountProps> = ({ count, unit = ui.countUnit }) => {
  return (
    <p className="text-body-lg text-ink-muted">
      {ui.total}{' '}
      <strong className="font-mono font-semibold text-ink">{count.toLocaleString()}</strong>
      {unit}
    </p>
  );
};
