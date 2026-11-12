import type { ButtonHTMLAttributes } from 'react';
import { Icon } from './Icon';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';
export type ButtonSize = 'sm' | 'md';

interface ButtonProps extends Readonly<ButtonHTMLAttributes<HTMLButtonElement>> {
  readonly variant?: ButtonVariant;
  readonly size?: ButtonSize;
  readonly icon?: string;
}

const variants: Record<ButtonVariant, string> = {
  primary: 'bg-primary-container text-on-primary-container hover:bg-primary-focus',
  secondary: 'bg-surface-2 text-ink border border-hairline-strong hover:bg-surface-3',
  danger: 'bg-error-container/20 text-error border border-error/30 hover:bg-error-container/40',
  ghost: 'text-ink-subtle hover:text-ink hover:bg-surface-2',
};

const sizes: Record<ButtonSize, string> = {
  sm: 'h-7 px-2.5 text-label-sm rounded',
  md: 'h-10 px-4 text-label-md rounded-lg',
};

export function Button({ variant = 'secondary', size = 'md', icon, className = '', type = 'button', children, ...rest }: ButtonProps) {
  return (
    <button
      type={type}
      className={`inline-flex shrink-0 items-center justify-center gap-1.5 whitespace-nowrap font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-focus/50 disabled:cursor-not-allowed disabled:opacity-40 ${variants[variant]} ${sizes[size]} ${className}`}
      {...rest}
    >
      {icon && <Icon name={icon} className={size === 'sm' ? '!text-[14px]' : '!text-[16px]'} />}
      {children}
    </button>
  );
}
