import React from 'react';
import { labels } from '../data/mockData';

interface EditBadgeProps {
  readonly onClick: () => void;
}

export const EditBadge: React.FC<EditBadgeProps> = ({ onClick }) => (
  <button
    type="button"
    onClick={onClick}
    title={labels.editTooltip}
    className="ml-2 inline-flex items-center rounded border px-1.5 py-0.5 text-xs transition-colors border-tertiary-container/50 bg-tertiary-container/20 text-tertiary hover:brightness-125"
  >
    {labels.edit}
  </button>
);
