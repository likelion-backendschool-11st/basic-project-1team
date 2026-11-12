import React from 'react';

interface PageCardProps {
  readonly children: React.ReactNode;
  readonly padded?: boolean;
}

export const PageCard: React.FC<PageCardProps> = ({ children, padded = false }) => (
  <div className="min-h-screen px-4 py-10 sm:px-6 lg:px-8">
    <main
      className={`mx-auto w-full max-w-container overflow-hidden rounded-card border border-line-light bg-card-light shadow-sm dark:border-line-dark dark:bg-card-dark dark:shadow-2xl ${
        padded ? 'p-8 sm:p-12' : ''
      }`}
    >
      {children}
    </main>
  </div>
);

export default PageCard;
