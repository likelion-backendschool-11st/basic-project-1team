import React from 'react';

export type GlowVariant = 'default' | 'danger' | 'single';

interface GlowCardProps {
  readonly children: React.ReactNode;
  readonly glow?: GlowVariant;
  /** Thin gradient accent across the top edge (login screen). */
  readonly accentLine?: boolean;
  /** Padding / layout classes for the inner content wrapper. */
  readonly className?: string;
}

const GLOWS: Record<GlowVariant, readonly string[]> = {
  default: [
    '-top-24 -right-24 bg-primary-container/10',
    '-bottom-24 -left-24 bg-secondary-container/10',
  ],
  danger: ['-top-24 -left-24 bg-semantic-danger/5', '-bottom-24 -right-24 bg-primary-container/10'],
  single: ['-top-24 -right-24 bg-primary-container/10'],
};

/** Elevated surface-1 card with soft ambient blur glows. */
export const GlowCard: React.FC<GlowCardProps> = ({
  children,
  glow = 'default',
  accentLine = false,
  className = 'p-6 sm:p-8',
}) => (
  <div className="relative w-full overflow-hidden rounded-xl bg-surface-1 shadow-2xl">
    {GLOWS[glow].map((position) => (
      <div
        key={position}
        aria-hidden="true"
        className={`pointer-events-none absolute h-60 w-60 rounded-full blur-3xl ${position}`}
      />
    ))}
    {accentLine && (
      <div
        aria-hidden="true"
        className="h-0.5 w-full bg-gradient-to-r from-transparent via-primary-container/60 to-transparent"
      />
    )}
    <div className={`relative z-10 ${className}`}>{children}</div>
  </div>
);

export default GlowCard;
