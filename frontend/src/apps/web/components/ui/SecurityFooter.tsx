import React from 'react';
import { Icon } from './Icon';

interface SecurityFooterProps {
  readonly icon: string;
  readonly text: string;
  readonly className?: string;
}

export const SecurityFooter: React.FC<SecurityFooterProps> = ({ icon, text, className = '' }) => (
  <div
    className={`flex items-center justify-center gap-2 font-label-code text-label-code text-ink-tertiary ${className}`}
  >
    <Icon name={icon} className="text-[14px]" />
    <span>{text}</span>
  </div>
);
