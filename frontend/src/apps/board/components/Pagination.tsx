import React from 'react';

interface PaginationProps {
  readonly pages: number[];
  readonly current: number;
  readonly onChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({ pages, current, onChange }) => (
  <nav aria-label="Pagination" className="flex items-center justify-center py-8">
    <ul className="inline-flex items-center gap-2">
      {pages.map((p) => {
        const isCurrent = p === current;
        return (
          <li key={p}>
            <button
              type="button"
              onClick={() => onChange(p)}
              aria-current={isCurrent ? 'page' : undefined}
              className={`h-8 min-w-8 rounded-md px-3 text-sm font-medium transition-colors ${
                isCurrent
                  ? 'bg-primary-container text-white shadow-md'
                  : 'text-ink-subtle hover:bg-surface-3 hover:text-ink'
              }`}
            >
              {p}
            </button>
          </li>
        );
      })}
    </ul>
  </nav>
);
