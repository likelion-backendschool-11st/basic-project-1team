import type { ReactNode } from 'react';

interface PageHeaderProps {
  readonly title: ReactNode;
  readonly description?: ReactNode;
  readonly actions?: ReactNode;
  readonly divider?: boolean;
}

export function PageHeader({ title, description, actions, divider = false }: PageHeaderProps) {
  return (
    <header className={`flex items-start justify-between gap-6 ${divider ? 'border-b border-hairline/80 pb-6' : 'pb-6'}`}>
      <div>
        <h1 className="text-[28px] font-bold leading-tight tracking-tight text-ink">{title}</h1>
        {description && <p className="mt-1 text-body-md text-ink-subtle">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </header>
  );
}

export default PageHeader;
