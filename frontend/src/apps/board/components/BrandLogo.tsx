import React from 'react';
import { Link } from 'react-router-dom';
import { brand, routes } from '../data/mockData';

interface BrandLogoProps {
  readonly className?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({ className = '' }) => (
  <Link
    to={routes.board}
    className={`flex items-center gap-2 ${className}`}
    aria-label={brand.name}
  >
    <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-brand text-white shadow-md">
      <svg
        className="h-5 w-5 fill-current"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path d="M20.22 8.16C19.86 6.84 18.72 6 17.36 6H6.64C5.28 6 4.14 6.84 3.78 8.16L2.05 14.5C1.86 15.2 2.01 15.95 2.47 16.5C2.93 17.06 3.63 17.38 4.36 17.38C5.24 17.38 6.04 16.89 6.42 16.1L7.86 13.23C8.04 12.87 8.41 12.64 8.81 12.64H15.19C15.59 12.64 15.96 12.87 16.14 13.23L17.58 16.1C17.96 16.89 18.76 17.38 19.64 17.38C20.37 17.38 21.07 17.06 21.53 16.5C21.99 15.95 22.14 15.2 21.95 14.5L20.22 8.16ZM9 10H8V11C8 11.28 7.78 11.5 7.5 11.5C7.22 11.5 7 11.28 7 11V10H6C5.72 10 5.5 9.78 5.5 9.5C5.5 9.22 5.72 9 6 9H7V8C7 7.72 7.22 7.5 7.5 7.5C7.78 7.5 8 7.72 8 8V9H9C9.28 9 9.5 9.22 9.5 9.5C9.5 9.78 9.28 10 9 10ZM15.75 11C15.34 11 15 10.66 15 10.25C15 9.84 15.34 9.5 15.75 9.5C16.16 9.5 16.5 9.84 16.5 10.25C16.5 10.66 16.16 11 15.75 11ZM17.75 9C17.34 9 17 8.66 17 8.25C17 7.84 17.34 7.5 17.75 7.5C18.16 7.5 18.5 7.84 18.5 8.25C18.5 8.66 18.16 9 17.75 9Z" />
      </svg>
    </span>
    <span className="ml-1 hidden font-mono text-lg font-black tracking-wider text-ink-light dark:text-ink-dark sm:inline-block">
      {brand.name}
    </span>
  </Link>
);
