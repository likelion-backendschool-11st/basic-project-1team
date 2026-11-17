import React from 'react';
interface IconProps {
  readonly name: string;
  readonly filled?: boolean;
  readonly className?: string;
}

/** Material Symbols Outlined glyph (same icon font as the Stitch export). */
export const Icon: React.FC<IconProps> = ({ name, filled = false, className = '' }) => {
  return (
    <span
      aria-hidden="true"
      className={`material-symbols-outlined ${filled ? 'icon-filled' : ''} ${className}`}
    >
      {name}
    </span>
  );
};
