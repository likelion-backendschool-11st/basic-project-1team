import React from 'react';
import { Link } from 'react-router-dom';
import { Icon } from './Icon';

interface ButtonProps {
  readonly children: React.ReactNode;
  readonly variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  readonly icon?: string;
  readonly iconClassName?: string;
  readonly to?: string;
  readonly onClick?: () => void;
  readonly type?: 'button' | 'submit';
  readonly disabled?: boolean;
  readonly title?: string;
  readonly className?: string;
}

const variants = {
  primary: 'bg-primary-container hover:bg-primary-hover active:bg-primary-focus text-on-primary font-semibold shadow-md',
  secondary: 'bg-surface-2 hover:bg-surface-3 border border-hairline text-ink',
  ghost: 'bg-surface-1 hover:bg-surface-2 border border-hairline hover:border-hairline-strong text-ink-subtle hover:text-ink',
  danger: 'bg-semantic-danger hover:bg-semantic-danger/90 text-ink font-semibold shadow-sm active:scale-[0.99]',
} as const;

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'secondary',
  icon,
  iconClassName = 'text-[18px]',
  to,
  onClick,
  type = 'button',
  disabled,
  title,
  className = '',
}) => {
  const cls = `inline-flex items-center justify-center gap-1.5 px-space-md py-2.5 rounded-lg font-label-md text-label-md transition-colors disabled:opacity-80 disabled:pointer-events-none ${variants[variant]} ${className}`;
  const content = (
    <>
      {icon && <Icon name={icon} className={iconClassName} />}
      {children}
    </>
  );
  if (to) {
    return (
      <Link to={to} className={cls} title={title}>
        {content}
      </Link>
    );
  }
  return (
    <button type={type} onClick={onClick} disabled={disabled} title={title} className={cls}>
      {content}
    </button>
  );
};
