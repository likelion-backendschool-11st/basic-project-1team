import React from 'react';

interface PageShellProps {
  readonly children: React.ReactNode;
  readonly footer?: React.ReactNode;
}

/** Full-viewport canvas that centers a single card, as in every Stitch screen. */
export const PageShell: React.FC<PageShellProps> = ({ children, footer }) => (
  <div className="flex min-h-screen items-center justify-center bg-canvas p-margin">
    <main className="flex w-full max-w-lg flex-col">
      {children}
      {footer}
    </main>
  </div>
);

export default PageShell;
