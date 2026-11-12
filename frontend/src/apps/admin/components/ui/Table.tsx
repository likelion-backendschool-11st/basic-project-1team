import type { HTMLAttributes, ReactNode, TdHTMLAttributes, ThHTMLAttributes } from 'react';
import { ui } from '../../data/mockData';

interface TableProps {
  readonly children: ReactNode;
  readonly className?: string;
}

export function Table({ children, className = '' }: TableProps) {
  return (
    <div className="overflow-x-auto">
      <table className={`w-full border-collapse text-left ${className}`}>{children}</table>
    </div>
  );
}

interface TableHeadProps {
  readonly children: ReactNode;
}

export function TableHead({ children }: TableHeadProps) {
  return (
    <thead>
      <tr className="h-11 border-b border-hairline bg-surface-2/40 text-label-sm text-ink-subtle">{children}</tr>
    </thead>
  );
}

type Align = 'left' | 'center' | 'right';

// Full class names so Tailwind's scanner can see them.
const alignClass: Record<Align, string> = { left: 'text-left', center: 'text-center', right: 'text-right' };

interface ThProps extends Readonly<ThHTMLAttributes<HTMLTableCellElement>> {
  readonly align?: Align;
}

export function Th({ align = 'left', className = '', ...rest }: ThProps) {
  return <th scope="col" className={`whitespace-nowrap px-5 font-medium ${alignClass[align]} ${className}`} {...rest} />;
}

interface TrProps extends Readonly<HTMLAttributes<HTMLTableRowElement>> {
  readonly selected?: boolean;
  readonly dimmed?: boolean;
}

export function Tr({ selected = false, dimmed = false, className = '', ...rest }: TrProps) {
  return (
    <tr
      className={`h-16 border-b border-hairline transition-colors last:border-b-0 hover:bg-surface-2 ${
        selected ? 'bg-surface-2 [&>td:first-child]:border-l-2 [&>td:first-child]:border-primary-container' : ''
      } ${dimmed ? 'text-ink-tertiary' : ''} ${className}`}
      {...rest}
    />
  );
}

interface TdProps extends Readonly<TdHTMLAttributes<HTMLTableCellElement>> {
  readonly align?: Align;
}

export function Td({ align = 'left', className = '', ...rest }: TdProps) {
  return <td className={`px-5 text-body-md ${alignClass[align]} ${className}`} {...rest} />;
}

interface EmptyRowProps {
  readonly colSpan: number;
}

export function EmptyRow({ colSpan }: EmptyRowProps) {
  return (
    <tr>
      <td colSpan={colSpan} className="py-12 text-center text-body-md text-ink-subtle">
        {ui.emptyRow}
      </td>
    </tr>
  );
}
