import React from 'react';
import { RichTextEditor } from '../../../../shared/editor/RichTextEditor';
import { Icon } from '../ui/Icon';

interface BioEditorProps {
  readonly id: string;
  readonly label: string;
  readonly value: string;
  readonly count: number;
  readonly max: number;
  readonly unit: string;
  readonly placeholder: string;
  readonly help: string;
  readonly onChange: (value: string) => void;
}

export const BioEditor: React.FC<BioEditorProps> = ({
  id,
  label,
  value,
  count,
  max,
  unit,
  placeholder,
  help,
  onChange,
}) => (
  <div className="flex flex-col gap-space-xs">
    <div className="flex items-center justify-between">
      <span id={`${id}-label`} className="font-label-md text-label-md text-ink-muted">
        {label}
      </span>
      <span className="font-label-code text-label-code text-ink-tertiary" aria-live="polite">
        <span className={count > max ? 'text-semantic-danger' : 'text-primary'}>{count}</span> /{' '}
        {max}
        {unit}
      </span>
    </div>
    <div role="group" aria-labelledby={`${id}-label`} aria-describedby={`${id}-help`}>
      <RichTextEditor
        preset="simple"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        maxLength={max}
        showCounter={false}
      />
    </div>
    <p
      id={`${id}-help`}
      className="flex items-center gap-1 font-body-sm text-body-sm text-ink-tertiary"
    >
      <Icon name="info" className="text-[14px]" />
      {help}
    </p>
  </div>
);
