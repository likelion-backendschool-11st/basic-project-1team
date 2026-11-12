import React from 'react';
import type { SelectOption } from '../../data/types';
import { Icon } from '../common/Icon';

interface SelectFieldProps {
  readonly options: readonly SelectOption[];
  readonly value: string;
  readonly onChange: (value: string) => void;
  readonly variant?: 'scope' | 'filter';
  readonly ariaLabel?: string;
}

export const SelectField: React.FC<SelectFieldProps> = ({ options, value, onChange, variant = 'filter', ariaLabel }) => {
  const select = (
    <select
      aria-label={ariaLabel}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={
        variant === 'scope'
          ? 'appearance-none h-9 pl-3 pr-7 bg-surface-2 hover:bg-surface-3 border border-hairline hover:border-hairline-strong rounded-lg font-label-md text-label-md text-ink transition-colors cursor-pointer focus:outline-none focus:border-primary-focus'
          : 'w-full h-9 px-3 rounded-lg bg-surface-2 border border-hairline font-body-sm text-body-sm text-ink focus:border-primary-focus focus:outline-none'
      }
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
  if (variant !== 'scope') return select;
  return (
    <div className="relative shrink-0">
      {select}
      <Icon name="arrow_drop_down" className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 text-[18px] text-ink-tertiary" />
    </div>
  );
};

export default SelectField;
