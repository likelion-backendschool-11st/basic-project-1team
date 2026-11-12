export type ButtonVariant = 'primary' | 'secondary' | 'danger';
export type ButtonSize = 'md' | 'lg';

const BASE =
  'inline-flex items-center justify-center gap-2 rounded-lg font-label-md text-label-md transition-all duration-200 ' +
  'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 enabled:active:scale-[0.99] disabled:cursor-not-allowed';

const VARIANTS: Record<ButtonVariant, string> = {
  primary:
    'bg-primary-container font-medium text-on-primary-container shadow-md shadow-primary-container/20 hover:brightness-110 disabled:opacity-70 disabled:hover:brightness-100',
  secondary: 'bg-surface-2 text-ink-muted hover:bg-surface-3 hover:text-ink',
  danger:
    'bg-semantic-danger text-ink hover:brightness-110 disabled:bg-semantic-danger/30 disabled:text-ink-tertiary disabled:hover:brightness-100',
};

const SIZES: Record<ButtonSize, string> = {
  md: 'px-4 py-2.5',
  lg: 'px-4 py-3',
};

export function buttonClasses(
  variant: ButtonVariant = 'primary',
  size: ButtonSize = 'md',
  fullWidth = true,
  extra = '',
): string {
  return `${BASE} ${VARIANTS[variant]} ${SIZES[size]} ${fullWidth ? 'w-full' : ''} ${extra}`;
}
