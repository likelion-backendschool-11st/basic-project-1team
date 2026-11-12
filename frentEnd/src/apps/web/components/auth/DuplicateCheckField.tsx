import React from 'react';
import { TextField } from '../ui/TextField';
import { StatusMessage } from '../ui/StatusMessage';
import type { DuplicateCheckState } from '../../hooks/useDuplicateCheck';

interface DuplicateCheckFieldProps {
  readonly id: string;
  readonly label: string;
  readonly placeholder: string;
  readonly buttonLabel: string;
  readonly field: DuplicateCheckState;
  readonly type?: 'text' | 'email';
  readonly autoComplete?: string;
}

/** Signup field with an inline "중복 확인" button and live status line. */
export const DuplicateCheckField: React.FC<DuplicateCheckFieldProps> = ({
  id,
  label,
  placeholder,
  buttonLabel,
  field,
  type = 'text',
  autoComplete,
}) => {
  const statusId = `${id}-status`;
  return (
    <TextField
      id={id}
      label={label}
      required
      type={type}
      autoComplete={autoComplete}
      placeholder={placeholder}
      value={field.value}
      onChange={(e) => field.setValue(e.target.value)}
      invalid={field.status.tone === 'danger'}
      aria-describedby={statusId}
      action={
        <button
          type="button"
          onClick={field.check}
          className="shrink-0 rounded-lg bg-surface-2 px-4 py-2.5 font-label-md text-label-md text-ink transition-colors hover:bg-surface-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
        >
          {buttonLabel}
        </button>
      }
    >
      <StatusMessage id={statusId} tone={field.status.tone} text={field.status.text} />
    </TextField>
  );
};

export default DuplicateCheckField;
