import React from 'react';
import { labels } from '../data/mockData';
import { useTheme } from '../hooks/useTheme';
import { Icon } from './Icon';

interface ThemeToggleProps {
  readonly className?: string;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ className = '' }) => {
  const { theme, toggle } = useTheme();
  const label = theme === 'dark' ? labels.themeToggle.toLight : labels.themeToggle.toDark;
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      title={label}
      className={`fixed bottom-4 right-4 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full border border-line-strong-light bg-card-light text-ink-muted-light shadow-sm transition-colors hover:text-ink-light dark:border-line-strong-dark dark:bg-card-dark dark:text-ink-muted-dark dark:hover:text-ink-dark ${className}`}
    >
      <Icon name={theme === 'dark' ? 'light_mode' : 'dark_mode'} className="text-[18px]" />
    </button>
  );
};
