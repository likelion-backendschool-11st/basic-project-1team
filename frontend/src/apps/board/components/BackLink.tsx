import React from 'react';
import { Link } from 'react-router-dom';
import { labels, routes } from '../data/mockData';
import { Icon } from './Icon';

interface BackLinkProps {
  readonly to?: string;
}

export const BackLink: React.FC<BackLinkProps> = ({ to = routes.board }) => (
  <Link
    to={to}
    className="group inline-flex w-fit items-center gap-1 text-xs font-semibold uppercase tracking-wider transition-colors hover:underline text-primary"
  >
    <Icon
      name="arrow_back"
      className="text-[16px] transition-transform group-hover:-translate-x-0.5"
    />
    {labels.backToList}
  </Link>
);
