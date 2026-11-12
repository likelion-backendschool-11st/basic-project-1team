import React from 'react';
import { Link } from 'react-router-dom';
import { Icon } from './Icon';
import { buttonClasses } from './buttonStyles';
import type { ButtonSize, ButtonVariant } from './buttonStyles';

interface LinkButtonProps {
  readonly to: string;
  readonly children: React.ReactNode;
  readonly variant?: ButtonVariant;
  readonly size?: ButtonSize;
  readonly icon?: string;
  readonly className?: string;
}

/** Router link styled like a Button (for navigation-only actions). */
export const LinkButton: React.FC<LinkButtonProps> = ({
  to,
  children,
  variant = 'secondary',
  size = 'md',
  icon,
  className = '',
}) => (
  <Link to={to} className={buttonClasses(variant, size, true, className)}>
    {icon && <Icon name={icon} className={`text-[18px] ${variant === 'secondary' ? 'text-ink-subtle' : ''}`} />}
    <span>{children}</span>
  </Link>
);

export default LinkButton;
