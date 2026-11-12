import React, { type FormEvent, type ReactNode } from 'react';
import { ui } from '../../data/mockData';
import { Button } from './Button';
import { Card } from './Card';

interface FilterBarProps {
  readonly onSubmit: (event: FormEvent) => void;
  readonly children: ReactNode;
  readonly submitLabel?: string;
  readonly submitClassName?: string;
}

/** Search/filter strip at the top of list screens; submit applies the filters. */
export const FilterBar: React.FC<FilterBarProps> = ({ onSubmit, children, submitLabel = ui.search, submitClassName = '' }) => {
  return (
    <Card padding="md" className="mb-6">
      <form role="search" onSubmit={onSubmit} className="flex flex-wrap items-center gap-3">
        {children}
        <Button type="submit" variant="primary" icon="search" className={submitClassName}>
          {submitLabel}
        </Button>
      </form>
    </Card>
  );
};
