import React from 'react';
import { Link } from 'react-router-dom';
import { brand, ROUTES } from '../../data/mockData';

interface BrandLogoProps {
  readonly size?: 'sm' | 'lg';
  /** Wrap the monogram in a link back to the entry route. */
  readonly linked?: boolean;
}

/** "G" monogram tile. Links home so every screen has a way back. */
export const BrandLogo: React.FC<BrandLogoProps> = ({ size = 'lg', linked = true }) => {
  const tile =
    size === 'lg' ? (
      <span className="group relative inline-flex">
        <span
          aria-hidden="true"
          className="absolute -inset-1 rounded-xl bg-primary-container/20 blur-sm transition-all group-hover:bg-primary-container/30"
        />
        <span className="relative flex h-14 w-14 items-center justify-center rounded-xl bg-primary-container font-headline-md text-headline-md font-bold text-on-primary-container shadow-sm">
          {brand.monogram}
        </span>
      </span>
    ) : (
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-container font-headline-sm text-headline-sm font-bold tracking-tight text-ink shadow-sm">
        {brand.monogram}
      </span>
    );

  if (!linked) return tile;
  return (
    <Link
      to={ROUTES.login}
      aria-label={brand.name}
      className="inline-flex rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
    >
      {tile}
    </Link>
  );
};
