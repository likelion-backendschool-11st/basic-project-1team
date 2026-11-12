interface TagChipProps {
  readonly name: string;
  readonly tone?: 'primary' | 'danger' | 'muted';
  readonly className?: string;
}

const tones: Record<NonNullable<TagChipProps['tone']>, string> = {
  primary: 'text-primary border-hairline-strong',
  danger: 'text-error border-error/30',
  muted: 'text-ink-tertiary border-hairline',
};

/** Monospace game-tag label, e.g. `elden-ring`. */
export function TagChip({ name, tone = 'primary', className = '' }: TagChipProps) {
  return (
    <span className={`inline-flex whitespace-nowrap rounded border bg-surface-2 px-2 py-0.5 font-mono text-code-sm ${tones[tone]} ${className}`}>
      {name}
    </span>
  );
}
