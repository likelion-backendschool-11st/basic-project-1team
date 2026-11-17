import React, { Fragment } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '../ui/Icon';

export interface AuthLinkItem {
  readonly label: string;
  readonly to: string;
  readonly icon?: string;
  readonly emphasis?: boolean;
}

interface AuthLinksProps {
  readonly items: readonly AuthLinkItem[];
  /** `center` = dot-separated row (login) · `between` = edge-aligned with slash (find-id). */
  readonly layout?: 'center' | 'between';
}

export const AuthLinks: React.FC<AuthLinksProps> = ({ items, layout = 'center' }) => (
  <nav
    className={`flex w-full items-center font-body-sm text-body-sm ${
      layout === 'center' ? 'justify-center gap-3' : 'justify-between'
    }`}
  >
    {items.map((item, index) => (
      <Fragment key={item.to}>
        {index > 0 &&
          (layout === 'center' ? (
            <span aria-hidden="true" className="h-1 w-1 rounded-full bg-outline-variant/60" />
          ) : (
            <span aria-hidden="true" className="font-label-code text-xs text-surface-variant">
              /
            </span>
          ))}
        <Link
          to={item.to}
          className={`flex items-center gap-1 rounded px-1.5 py-1 transition-colors duration-150 hover:bg-surface-2 ${
            item.emphasis
              ? 'font-medium text-primary hover:text-primary-fixed-dim'
              : 'text-ink-subtle hover:text-ink'
          }`}
        >
          {item.icon && <Icon name={item.icon} className="text-base" />}
          <span>{item.label}</span>
        </Link>
      </Fragment>
    ))}
  </nav>
);
