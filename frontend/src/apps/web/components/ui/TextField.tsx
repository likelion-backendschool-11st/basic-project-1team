import React from 'react';
import { Icon } from './Icon';

interface TextFieldProps extends Readonly<Omit<React.InputHTMLAttributes<HTMLInputElement>, 'id'>> {
  readonly id: string;
  readonly label: string;
  /** Small monospace hint on the right of the label. */
  readonly hint?: string;
  readonly required?: boolean;
  readonly leftIcon?: string;
  readonly rightIcon?: string;
  /** Interactive element inside the input on the right (e.g. visibility toggle). */
  readonly rightSlot?: React.ReactNode;
  /** Element beside the input (e.g. "중복 확인" button). */
  readonly action?: React.ReactNode;
  readonly invalid?: boolean;
  /** Rendered under the input (status messages, meters). */
  readonly children?: React.ReactNode;
}

export const TextField: React.FC<TextFieldProps> = ({
  id,
  label,
  hint,
  required = false,
  leftIcon,
  rightIcon,
  rightSlot,
  action,
  invalid = false,
  children,
  className = '',
  ...inputProps
}) => {
  const hasRight = Boolean(rightIcon || rightSlot);
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <div className="flex items-center justify-between">
        <label htmlFor={id} className="font-label-md text-label-md text-ink-muted">
          {label}
          {required && <span className="ml-1 text-semantic-danger">*</span>}
        </label>
        {hint && <span className="font-label-code text-label-code text-ink-tertiary">{hint}</span>}
      </div>
      <div className="flex gap-2">
        <div className="relative flex flex-1 items-center">
          {leftIcon && (
            <Icon
              name={leftIcon}
              className="pointer-events-none absolute left-3 text-[18px] text-ink-tertiary"
            />
          )}
          <input
            id={id}
            required={required}
            aria-invalid={invalid || undefined}
            className={`w-full rounded-lg bg-surface-2 py-2.5 font-body-md text-body-md text-ink shadow-inner outline-none transition-colors duration-200 placeholder:text-ink-tertiary focus:bg-surface-3 ${
              leftIcon ? 'pl-10' : 'pl-3.5'
            } ${hasRight ? 'pr-10' : 'pr-3.5'} ${invalid ? 'ring-1 ring-semantic-danger' : ''}`}
            {...inputProps}
          />
          {rightIcon && (
            <Icon
              name={rightIcon}
              className="pointer-events-none absolute right-3.5 text-[18px] text-ink-tertiary"
            />
          )}
          {rightSlot && <div className="absolute right-2.5 flex items-center">{rightSlot}</div>}
        </div>
        {action}
      </div>
      {children}
    </div>
  );
};
