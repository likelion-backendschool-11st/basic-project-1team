import React from 'react';

interface IconProps {
  readonly name: string;
  readonly className?: string;
}

export const Icon: React.FC<IconProps> = ({ name, className = '' }) => (
  <span aria-hidden="true" className={`material-symbols-outlined ${className}`}>
    {name}
  </span>
);
