import React from 'react';
import { Link } from 'react-router-dom';
import { questionListPage } from '../../data/mockData';
import { useLoginGate } from '../../../../shared/LoginGate';
import { Icon } from '../common/Icon';

interface ListHeaderProps {
  readonly newQuestionTo: string;
}

export const ListHeader: React.FC<ListHeaderProps> = ({ newQuestionTo }) => {
  const { guardLink } = useLoginGate();

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-space-md">
      <div className="flex flex-col gap-space-xxs">
        <div className="flex items-center gap-space-sm">
          <h1 className="font-headline-lg text-headline-lg text-ink font-semibold tracking-tight">{questionListPage.title}</h1>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-semantic-success-surface border border-semantic-success-border font-label-sm text-label-sm text-secondary">
            <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
            {questionListPage.liveBadge}
          </span>
        </div>
        <p className="font-body-md text-body-md text-ink-subtle">{questionListPage.description}</p>
      </div>
      <Link
        to={newQuestionTo}
        onClick={guardLink}
        className="group flex-1 sm:flex-none inline-flex items-center justify-center gap-space-xs px-space-md py-2 rounded-lg bg-primary-container hover:bg-primary-hover text-on-primary font-label-md text-label-md transition-all duration-150 shadow-sm active:bg-primary-focus self-stretch sm:self-auto"
      >
        <Icon name="add" className="text-[18px] transition-transform group-hover:rotate-90" />
        <span>{questionListPage.newQuestion}</span>
      </Link>
    </div>
  );
};

export default ListHeader;
