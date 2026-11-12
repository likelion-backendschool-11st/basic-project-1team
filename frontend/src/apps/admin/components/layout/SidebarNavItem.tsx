import { NavLink } from 'react-router-dom';
import type { NavEntry } from '../../types';
import { Icon } from '../ui/Icon';

interface SidebarNavItemProps {
  readonly item: NavEntry;
}

export function SidebarNavItem({ item }: SidebarNavItemProps) {
  return (
    <NavLink
      to={item.to}
      end={item.to === '/'}
      className={({ isActive }) =>
        `flex items-center justify-between py-2 pl-3 transition-colors duration-150 ${
          isActive
            ? 'rounded-r border-l-2 border-primary-container bg-surface-2 font-medium'
            : 'rounded text-ink-subtle hover:bg-surface-2 hover:text-ink'
        }`
      }
    >
      {({ isActive }) => (
        <>
          <span className="flex items-center gap-3">
            <Icon
              name={item.icon}
              filled={isActive}
              className={isActive ? 'text-primary' : item.danger ? 'text-error' : ''}
            />
            <span className={`text-label-md ${isActive ? 'text-ink' : ''}`}>{item.label}</span>
          </span>
          <span className="mr-2 flex items-center gap-2">
            {item.badge !== undefined && (
              <span className="rounded-full bg-error-container/60 px-1.5 py-0.5 font-mono text-code-xs font-semibold text-error">
                {item.badge}
              </span>
            )}
            {isActive && <span className="h-1.5 w-1.5 rounded-full bg-primary-container" />}
          </span>
        </>
      )}
    </NavLink>
  );
}
