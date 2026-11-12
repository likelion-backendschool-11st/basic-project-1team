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
    className="ml-2 inline-flex items-center rounded border border-warn-line-light bg-warn-bg-light px-1.5 py-0.5 text-xs text-warn-light transition-colors hover:brightness-95 dark:border-warn-line-dark dark:bg-warn-bg-dark dark:text-warn-dark dark:hover:brightness-125"
  >
    {labels.edit}
  </button>
);
