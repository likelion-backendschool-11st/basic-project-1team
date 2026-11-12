import React from 'react';
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

export const BioEditor: React.FC<BioEditorProps> = ({ id, label, value, count, max, unit, placeholder, help, onChange }) => (
  <div className="flex flex-col gap-space-xs">
    <div className="flex items-center justify-between">
      <label htmlFor={id} className="font-label-md text-label-md text-ink-muted">
        {label}
      </label>
      <span className="font-label-code text-label-code text-ink-tertiary" aria-live="polite">
        <span className="text-secondary">{count}</span> / {max}
        {unit}
      </span>
    </div>
    <div className="relative rounded-lg bg-surface-2 p-1 transition-colors focus-within:bg-surface-3">
      <textarea
        id={id}
        rows={4}
        maxLength={max}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        aria-describedby={`${id}-help`}
        className="w-full resize-none bg-transparent px-3 py-2 font-body-md text-body-md text-ink outline-none placeholder:text-ink-tertiary"
      />
    </div>
    <p id={`${id}-help`} className="flex items-center gap-1 font-body-sm text-body-sm text-ink-tertiary">
      <Icon name="info" className="text-[14px]" />
      {help}
    </p>
  </div>
);
