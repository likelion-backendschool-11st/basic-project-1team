import { Link } from 'react-router-dom';
import { brand } from '../../data/mockData';
import { Icon } from '../ui/Icon';

interface TopBarProps {
  readonly onLogout?: () => void;
}

export function TopBar({ onLogout }: TopBarProps) {
  return (
    <header className="specular-card sticky top-0 z-50 flex h-14 w-full items-center justify-between border-b border-hairline bg-surface-1 px-space-lg">
      <div className="flex items-center gap-3">
        <Link to="/" className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-container text-on-primary-container">
            <Icon name={brand.logoIcon} className="!text-[16px]" />
          </span>
          <span className="text-headline-sm font-bold text-ink">{brand.name}</span>
        </Link>
        <span className="flex items-center gap-1.5 rounded-full border border-hairline bg-surface-2 px-2 py-0.5">
          <span className="h-1.5 w-1.5 rounded-full bg-tertiary" />
          <span className="font-mono text-code-xs font-medium tracking-wide text-primary">{brand.badge}</span>
        </span>
      </div>

      <div className="flex items-center gap-4">
        <a
          href={brand.siteLink.href}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-label-md text-ink-subtle transition-colors hover:bg-surface-2 hover:text-ink"
        >
          {brand.siteLink.label}
          <Icon name="arrow_outward" className="!text-[16px]" />
        </a>
        <div className="flex items-center gap-2.5 pl-1">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-surface-2 font-mono text-xs font-medium text-ink">
            {brand.operator.initials}
          </span>
          <span className="whitespace-nowrap text-label-md text-ink">{brand.operator.name}</span>
        </div>
        <button
          type="button"
          onClick={onLogout}
          className="flex items-center gap-1 whitespace-nowrap rounded-lg px-2.5 py-1.5 text-label-md text-ink-subtle transition-colors hover:bg-surface-2 hover:text-ink"
        >
          <Icon name="logout" className="!text-[16px]" />
          {brand.logoutLabel}
        </button>
      </div>
    </header>
  );
}
