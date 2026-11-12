import type { HTMLAttributes, ReactNode } from 'react';

interface CardProps extends Readonly<HTMLAttributes<HTMLElement>> {
  readonly as?: 'section' | 'div' | 'aside';
  readonly padding?: 'none' | 'md' | 'lg';
  readonly children: ReactNode;
}

const paddings = { none: '', md: 'p-space-md', lg: 'p-space-lg' } as const;

/** Level-1 lift: surface-1 panel with hairline border and specular top edge. */
export function Card({ as: Tag = 'section', padding = 'lg', className = '', children, ...rest }: CardProps) {
  return (
    <Tag className={`specular-card rounded-lg border border-hairline bg-surface-1 ${paddings[padding]} ${className}`} {...rest}>
      {children}
    </Tag>
  );
}

export default Card;
