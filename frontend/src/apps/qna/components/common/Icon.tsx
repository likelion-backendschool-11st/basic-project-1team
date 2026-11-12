import React from 'react';

interface IconProps {
  readonly name: string;
  readonly className?: string;
  readonly filled?: boolean;
}

/** Material Symbols Outlined glyph. Size via `text-[Npx]` in className. */
export const Icon: React.FC<IconProps> = ({ name, className = '', filled = false }) => (
  <span
    aria-hidden="true"
    className={`material-symbols-outlined select-none ${className}`}
    style={filled ? { fontVariationSettings: "'FILL' 1" } : undefined}
  >
    {name}
  </span>
);

export default Icon;
