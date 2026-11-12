import React from 'react';
import { DOT_CLASSES } from '../ui/StatusPill';
import type { Tone } from '../../data/mockData';

interface GameTagProps {
  readonly name: string;
  readonly tone: Tone;
}

export const GameTag: React.FC<GameTagProps> = ({ name, tone }) => (
  <span className="inline-flex items-center gap-2 rounded-lg bg-surface-1 px-3 py-1.5 transition-colors hover:bg-surface-3">
    <span aria-hidden="true" className={`h-2 w-2 rounded-full ${DOT_CLASSES[tone]}`} />
    <span className="font-label-code text-label-code text-ink">{name}</span>
  </span>
);

export default GameTag;
