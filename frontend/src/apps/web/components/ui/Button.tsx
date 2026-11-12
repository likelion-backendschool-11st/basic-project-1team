import React from 'react';
import { Icon } from './Icon';
import { buttonClasses } from './buttonStyles';
import type { ButtonSize, ButtonVariant } from './buttonStyles';

interface ButtonProps extends Readonly<React.ButtonHTMLAttributes<HTMLButtonElement>> {
  readonly variant?: ButtonVariant;
  readonly size?: ButtonSize;
  readonly icon?: string;
  readonly iconPosition?: 'left' | 'right';
  readonly fullWidth?: boolean;
  readonly loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'right',
  fullWidth = true,
  loading = false,
  className = '',
  children,
  type = 'button',
  disabled,
  ...props
}) => {
  const glyph = loading ? (
    <Icon name="progress_activity" className="animate-spin text-[18px]" />
  ) : (
    icon && (
      <Icon
        name={icon}
        className={`text-[18px] transition-transform duration-200 ${
          iconPosition === 'right' ? 'group-hover:translate-x-0.5' : ''
        }`}
      />
    )
  );

  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={buttonClasses(variant, size, fullWidth, `group ${className}`)}
      {...props}
    >
      {iconPosition === 'left' && glyph}
      <span>{children}</span>
      {iconPosition === 'right' && glyph}
    </button>
  );
};

export default Button;
