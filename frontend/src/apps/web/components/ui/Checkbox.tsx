import React from 'react';
import { Icon } from './Icon';

interface CheckboxProps {
  readonly id: string;
  readonly label: string;
  readonly checked: boolean;
  readonly onChange: (checked: boolean) => void;
  /** `card` = full-width padded row (withdraw agreement). */
  readonly variant?: 'plain' | 'card';
  readonly tone?: 'primary' | 'danger';
}

export const Checkbox: React.FC<CheckboxProps> = ({
  id,
  label,
  checked,
  onChange,
  variant = 'plain',
  tone = 'primary',
}) => {
  const checkedBg = tone === 'danger' ? 'bg-semantic-danger' : 'bg-primary-container';
  return (
    <label
      htmlFor={id}
      className={`group flex cursor-pointer select-none items-center ${
        variant === 'card'
          ? 'w-full gap-3 rounded-lg bg-surface-container-low p-space-sm transition-colors duration-150 hover:bg-surface-2'
          : 'gap-2'
      }`}
    >
      <input
        id={id}
        type="checkbox"
        className="peer sr-only"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span
        aria-hidden="true"
        className={`flex h-4 w-4 shrink-0 items-center justify-center rounded transition-colors duration-150 peer-focus-visible:ring-2 peer-focus-visible:ring-primary/60 ${
          checked ? checkedBg : 'bg-surface-2 ring-1 ring-hairline-strong'
        }`}
      >
        <Icon
          name="check"
          className={`text-[14px] font-bold text-canvas transition-opacity duration-150 ${checked ? 'opacity-100' : 'opacity-0'}`}
        />
      </span>
      <span className="font-body-sm text-body-sm text-ink-subtle transition-colors group-hover:text-ink-muted">
        {label}
      </span>
    </label>
  );
};

export default Checkbox;
