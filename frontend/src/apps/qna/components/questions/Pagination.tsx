import React from 'react';
import { Icon } from '../common/Icon';

interface PaginationProps {
  readonly page: number;
  readonly pages: readonly number[];
  readonly hasPrev: boolean;
  readonly hasNext: boolean;
  readonly onPrev: () => void;
  readonly onNext: () => void;
  readonly onSelect: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({ page, pages, hasPrev, hasNext, onPrev, onNext, onSelect }) => (
  <nav aria-label="Pagination" className="flex items-center gap-1">
    <button
      aria-label="Previous Page"
      type="button"
      disabled={!hasPrev}
      onClick={onPrev}
      className="w-8 h-8 rounded-lg flex items-center justify-center text-ink-subtle hover:text-ink hover:bg-surface-2 transition-colors disabled:opacity-30 disabled:pointer-events-none"
    >
      <Icon name="chevron_left" className="text-[18px]" />
    </button>
    {pages.map((p) => (
      <button
        key={p}
        type="button"
        aria-current={p === page ? 'page' : undefined}
        onClick={() => onSelect(p)}
        className={`w-8 h-8 rounded-lg flex items-center justify-center font-code-inline text-code-inline border transition-colors ${
          p === page
            ? 'font-semibold bg-surface-2 border-hairline-strong text-primary'
            : 'text-ink-subtle border-transparent hover:text-ink hover:bg-surface-1'
        }`}
      >
        {p}
      </button>
    ))}
    <button
      aria-label="Next Page"
      type="button"
      disabled={!hasNext}
      onClick={onNext}
      className="w-8 h-8 rounded-lg flex items-center justify-center text-ink-subtle hover:text-ink hover:bg-surface-2 transition-colors disabled:opacity-30 disabled:pointer-events-none"
    >
      <Icon name="chevron_right" className="text-[18px]" />
    </button>
  </nav>
);

export default Pagination;
