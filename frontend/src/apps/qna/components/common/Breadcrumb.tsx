import React from 'react';
import { Link } from 'react-router-dom';
import { Icon } from './Icon';

export interface Crumb {
  readonly label: string;
  readonly to?: string;
  readonly icon?: string;
}

interface BreadcrumbProps {
  readonly items: readonly Crumb[];
  readonly currentTone?: 'primary' | 'ink';
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ items, currentTone = 'ink' }) => (
  <nav
    aria-label="Breadcrumb"
    className="flex items-center gap-space-xs font-caption text-caption text-ink-tertiary"
  >
    {items.map((item, i) => {
      const last = i === items.length - 1;
      return (
        <React.Fragment key={item.label}>
          {i > 0 && <span className="text-hairline-strong">/</span>}
          {item.to && !last ? (
            <Link to={item.to} className="hover:text-ink transition-colors flex items-center gap-1">
              {item.icon && <Icon name={item.icon} className="text-[15px]" />}
              <span>{item.label}</span>
            </Link>
          ) : (
            <span
              className={
                currentTone === 'primary' ? 'text-primary font-medium' : 'text-ink font-semibold'
              }
            >
              {item.label}
            </span>
          )}
        </React.Fragment>
      );
    })}
  </nav>
);
