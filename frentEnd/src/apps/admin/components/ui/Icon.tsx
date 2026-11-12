interface IconProps {
  readonly name: string;
  readonly filled?: boolean;
  readonly className?: string;
}

/** Material Symbols Outlined glyph (same icon font as the Stitch export). */
export function Icon({ name, filled = false, className = '' }: IconProps) {
  return (
    <span aria-hidden="true" className={`material-symbols-outlined ${filled ? 'icon-filled' : ''} ${className}`}>
      {name}
    </span>
  );
}

export default Icon;
