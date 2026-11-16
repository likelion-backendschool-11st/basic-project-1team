import React from 'react';
import { Icon } from './Icon';

/** 페이지 번호 버튼을 한 번에 몇 개 보여 줄지 */
const VISIBLE_PAGES = 5;

const labels = {
  nav: '페이지 이동',
  prev: '이전 페이지',
  next: '다음 페이지',
};

/** 지금 페이지를 가운데에 두고 최대 VISIBLE_PAGES 개의 페이지 번호를 만든다 */
function pageWindow(page: number, totalPages: number): number[] {
  const start = Math.max(
    1,
    Math.min(page - Math.floor(VISIBLE_PAGES / 2), totalPages - VISIBLE_PAGES + 1),
  );
  return Array.from({ length: Math.min(VISIBLE_PAGES, totalPages) }, (_, i) => start + i);
}

interface PaginationProps {
  /** 1부터 시작 (API_SPEC 1.5) */
  readonly page: number;
  /** 글이 없어도 1 */
  readonly totalPages: number;
  readonly onChange: (page: number) => void;
  /** 바깥 여백·테두리 */
  readonly className?: string;
}

const arrowClass =
  'flex h-8 w-8 items-center justify-center rounded-lg text-ink-subtle transition-colors hover:bg-surface-2 hover:text-ink disabled:pointer-events-none disabled:opacity-30';

/** 모든 목록 화면이 함께 쓰는 페이지 번호. 사용자·관리자 사이트 공통 */
export const Pagination: React.FC<PaginationProps> = ({
  page,
  totalPages,
  onChange,
  className = '',
}) => (
  <nav aria-label={labels.nav} className={`flex items-center justify-center gap-1 ${className}`}>
    <button
      type="button"
      aria-label={labels.prev}
      className={arrowClass}
      disabled={page <= 1}
      onClick={() => onChange(page - 1)}
    >
      <Icon name="chevron_left" className="text-[18px]" />
    </button>
    {pageWindow(page, totalPages).map((n) => (
      <button
        key={n}
        type="button"
        aria-current={n === page ? 'page' : undefined}
        onClick={() => onChange(n)}
        className={`h-8 min-w-8 rounded-lg px-2 font-code-inline text-code-inline transition-colors ${
          n === page
            ? 'bg-primary-container font-semibold text-on-primary-container'
            : 'text-ink-subtle hover:bg-surface-2 hover:text-ink'
        }`}
      >
        {n}
      </button>
    ))}
    <button
      type="button"
      aria-label={labels.next}
      className={arrowClass}
      disabled={page >= totalPages}
      onClick={() => onChange(page + 1)}
    >
      <Icon name="chevron_right" className="text-[18px]" />
    </button>
  </nav>
);
