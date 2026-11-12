import React from 'react';

interface AvatarProps {
  readonly initial: string;
  readonly size?: 'xs' | 'sm' | 'md' | 'lg';
  readonly tone?: 'neutral' | 'primary' | 'secondary' | 'tertiary' | 'ink';
}

const sizes = {
  xs: 'w-5 h-5 text-[10px]',
  sm: 'w-7 h-7 text-[11px]',
  md: 'w-8 h-8 text-[12px]',
  lg: 'w-10 h-10 text-[14px]',
} as const;

const tones = {
  neutral: 'bg-surface-3 text-ink-subtle',
  primary: 'bg-surface-3 border border-hairline text-primary',
  secondary: 'bg-secondary-container/20 border border-secondary-container/40 text-secondary',
  tertiary: 'bg-surface-3 border border-hairline text-tertiary',
  ink: 'bg-surface-3 text-ink',
} as const;

export const Avatar: React.FC<AvatarProps> = ({ initial, size = 'xs', tone = 'neutral' }) => (
  <div className={`${sizes[size]} ${tones[tone]} rounded-full flex items-center justify-center font-code-inline font-semibold shrink-0`}>
    {initial}
  </div>
);

export default Avatar;
