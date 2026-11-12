import { ui } from '../../data/mockData';
import { Icon } from './Icon';

interface PaginationProps {
  readonly page: number;
  readonly totalPages: number;
  readonly onChange: (page: number) => void;
  readonly className?: string;
}

export function Pagination({ page, totalPages, onChange, className = '' }: PaginationProps) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  const arrow =
    'flex h-10 w-10 items-center justify-center rounded-lg text-ink-subtle transition-colors hover:bg-surface-2 hover:text-ink disabled:pointer-events-none disabled:opacity-30';

  return (
    <nav aria-label="Pagination" className={`flex items-center justify-center gap-1 py-5 ${className}`}>
      <button type="button" aria-label={ui.prevPage} className={arrow} disabled={page <= 1} onClick={() => onChange(page - 1)}>
        <Icon name="chevron_left" />
      </button>
      {pages.map((n) => (
        <button
          key={n}
          type="button"
          aria-current={n === page ? 'page' : undefined}
          onClick={() => onChange(n)}
          className={`h-10 w-10 rounded-lg text-label-md transition-colors ${
            n === page ? 'bg-primary-container font-semibold text-on-primary-container' : 'text-ink-subtle hover:bg-surface-2 hover:text-ink'
          }`}
        >
          {n}
        </button>
      ))}
      <button type="button" aria-label={ui.nextPage} className={arrow} disabled={page >= totalPages} onClick={() => onChange(page + 1)}>
        <Icon name="chevron_right" />
      </button>
    </nav>
  );
}

export default Pagination;
