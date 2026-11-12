import React from 'react';

interface IconProps {
  readonly name: string;
  readonly className?: string;
  readonly filled?: boolean;
}

/** Material Symbols Outlined glyph. Decorative by default. */
export const Icon: React.FC<IconProps> = ({ name, className = '', filled = false }) => (
  <span aria-hidden="true" className={`material-symbols-outlined ${filled ? 'icon-fill' : ''} ${className}`}>
    {name}
  </span>
);
