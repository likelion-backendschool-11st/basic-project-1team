import React from 'react';
import { Link } from 'react-router-dom';
import { questionDetailLabels as L } from '../../data/mockData';
import { Icon } from '../common/Icon';

interface DetailToolbarProps {
  readonly homeTo: string;
  readonly boardTo: string;
  readonly editTo: string;
  readonly reportTo: string;
  readonly onDelete: () => void;
}

export const DetailToolbar: React.FC<DetailToolbarProps> = ({ homeTo, boardTo, editTo, reportTo, onDelete }) => (
  <div className="flex flex-wrap items-center justify-between gap-space-sm pb-space-sm border-b border-hairline">
    <div className="flex items-center gap-space-xs font-caption text-caption text-ink-subtle">
      <Link to={homeTo} className="hover:text-ink transition-colors flex items-center gap-1">
        <Icon name="arrow_back" className="text-[15px]" />
        <span>{L.home}</span>
      </Link>
      <span className="text-ink-tertiary">/</span>
      <Link to={boardTo} className="hover:text-ink transition-colors">
        {L.board}
      </Link>
    </div>
    <div className="flex items-center gap-space-xs">
      <Link
        to={editTo}
        className="px-space-sm py-1.5 rounded-lg bg-surface-1 hover:bg-surface-2 border border-hairline hover:border-hairline-strong text-ink font-label-md text-label-md transition-colors flex items-center gap-1.5"
      >
        <Icon name="edit" className="text-[16px] text-ink-subtle" />
        <span>{L.edit}</span>
      </Link>
      <button
        type="button"
        title={L.removeBlocked}
        onClick={onDelete}
        className="px-space-sm py-1.5 rounded-lg bg-surface-1 hover:bg-semantic-danger-surface border border-hairline hover:border-semantic-danger-border text-ink-subtle hover:text-semantic-danger font-label-md text-label-md transition-colors flex items-center gap-1.5"
      >
        <Icon name="delete" className="text-[16px]" />
        <span>{L.remove}</span>
      </button>
      <Link
        to={reportTo}
        title={L.reportQuestion}
        aria-label={L.reportQuestion}
        className="px-2.5 py-1.5 rounded-lg bg-surface-1 hover:bg-surface-2 border border-hairline hover:border-hairline-strong text-ink-subtle hover:text-ink transition-colors flex items-center"
      >
        <Icon name="flag" className="text-[16px]" />
      </Link>
    </div>
  </div>
);

export default DetailToolbar;
