import React from 'react';
import { Link } from 'react-router-dom';
import { comingSoon } from '../data/mockData';
import { Icon } from '../components/common/Icon';
import { routes } from '../routes';

interface ComingSoonPageProps {
  readonly className?: string;
}

export const ComingSoonPage: React.FC<ComingSoonPageProps> = ({ className = '' }) => (
  <div className={`py-space-2xl flex flex-col items-center text-center gap-space-sm ${className}`}>
    <Icon name="construction" className="text-[40px] text-ink-tertiary" />
    <h1 className="font-headline-lg text-headline-lg text-ink font-semibold">{comingSoon.title}</h1>
    <p className="font-body-md text-body-md text-ink-subtle max-w-md">{comingSoon.description}</p>
    <Link
      to={routes.questions()}
      className="mt-space-sm inline-flex items-center gap-1 px-space-md py-2 rounded-lg bg-primary-container hover:bg-primary-hover text-on-primary font-label-md text-label-md transition-colors"
    >
      {comingSoon.cta}
      <Icon name="arrow_forward" className="text-[16px]" />
    </Link>
  </div>
);
