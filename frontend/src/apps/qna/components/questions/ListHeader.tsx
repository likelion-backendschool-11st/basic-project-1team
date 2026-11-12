import React from 'react';
import { Link } from 'react-router-dom';
import { questionListPage } from '../../data/mockData';
import { blockIfRestricted } from '../../../../shared/sanctions';
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
        <h1 className="font-headline-lg text-headline-lg text-ink font-semibold tracking-tight">
          {questionListPage.title}
        </h1>
        <p className="font-body-md text-body-md text-ink-subtle">{questionListPage.description}</p>
      </div>
      <Link
        to={newQuestionTo}
        onClick={(e) => {
          guardLink(e);
          if (!e.defaultPrevented) blockIfRestricted('write', e);
        }}
        className="group flex-1 sm:flex-none inline-flex items-center justify-center gap-space-xs px-space-md py-2 rounded-lg bg-primary-container hover:bg-primary-hover text-on-primary font-label-md text-label-md transition-all duration-150 shadow-sm active:bg-primary-focus self-stretch sm:self-auto"
      >
        <Icon name="add" className="text-[18px] transition-transform group-hover:rotate-90" />
        <span>{questionListPage.newQuestion}</span>
      </Link>
    </div>
  );
};
