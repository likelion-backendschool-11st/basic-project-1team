import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react';
import type { SelectOption } from '../../types';
import { Icon } from './Icon';

const fieldBase =
  'w-full rounded-lg border border-hairline bg-canvas text-body-md text-ink placeholder:text-ink-tertiary transition-colors focus:border-primary-container focus:outline-none focus:ring-2 focus:ring-primary-focus/40 disabled:opacity-50';

interface TextInputProps extends Readonly<InputHTMLAttributes<HTMLInputElement>> {
  readonly leadingIcon?: string;
}

export function TextInput({ leadingIcon, className = '', ...rest }: TextInputProps) {
  return (
    <div className={`relative ${className}`}>
      {leadingIcon && (
        <Icon name={leadingIcon} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-subtle" />
      )}
      <input className={`${fieldBase} h-10 ${leadingIcon ? 'pl-9' : 'pl-3'} pr-3`} {...rest} />
    </div>
  );
}

interface SelectProps<V extends string> extends Readonly<Omit<SelectHTMLAttributes<HTMLSelectElement>, 'onChange' | 'value'>> {
  readonly options: readonly SelectOption<V>[];
  readonly value: V;
  readonly onChange: (value: V) => void;
}

export function Select<V extends string>({ options, value, onChange, className = '', ...rest }: SelectProps<V>) {
  return (
    <div className={`relative ${className}`}>
      <select
        className={`${fieldBase} h-10 cursor-pointer appearance-none bg-none pl-3 pr-9`}
        value={value}
        onChange={(event) => onChange(event.target.value as V)}
        {...rest}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value} className="bg-surface-1">
            {option.label}
          </option>
        ))}
      </select>
      <Icon name="expand_more" className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink-subtle" />
    </div>
  );
}

interface TextAreaProps extends Readonly<TextareaHTMLAttributes<HTMLTextAreaElement>> {}

export function TextArea({ className = '', ...rest }: TextAreaProps) {
  return <textarea className={`${fieldBase} resize-none px-3 py-2.5 leading-relaxed ${className}`} {...rest} />;
}

interface CheckboxProps {
  readonly label: string;
  readonly checked: boolean;
  readonly onChange: (checked: boolean) => void;
  readonly className?: string;
}

export function Checkbox({ label, checked, onChange, className = '' }: CheckboxProps) {
  return (
    <label className={`inline-flex cursor-pointer items-center gap-2.5 text-label-md text-ink ${className}`}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="h-4 w-4 rounded border-hairline-strong bg-canvas text-primary-container focus:ring-primary-focus/50 focus:ring-offset-0"
      />
      {label}
    </label>
  );
}

interface FieldLabelProps {
  readonly htmlFor?: string;
  readonly children: string;
}

export function FieldLabel({ htmlFor, children }: FieldLabelProps) {
  return (
    <label htmlFor={htmlFor} className="mb-1.5 block text-label-sm text-ink-muted">
      {children}
    </label>
  );
}
