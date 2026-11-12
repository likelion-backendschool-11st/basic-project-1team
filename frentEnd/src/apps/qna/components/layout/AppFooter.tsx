import React from 'react';
import { appShell } from '../../data/mockData';

interface AppFooterProps {
  readonly showVersion?: boolean;
}

export const AppFooter: React.FC<AppFooterProps> = ({ showVersion = true }) => (
  <footer className="w-full bg-surface-1 border-t border-hairline mt-auto">
    <div className="max-w-[1280px] mx-auto px-margin py-space-lg flex flex-col md:flex-row items-center justify-between gap-space-md font-body-sm text-body-sm text-ink-subtle">
      <div className="flex items-center gap-space-sm">
        {showVersion && <span className="font-code-inline text-code-inline text-ink-tertiary">{appShell.version}</span>}
        <span className="text-ink-tertiary">•</span>
        <span>{appShell.community}</span>
      </div>
      <div className="flex items-center gap-space-lg">
        {appShell.footerLinks.map((label) => (
          <a key={label} className="hover:text-ink transition-colors" href="#">
            {label}
          </a>
        ))}
      </div>
    </div>
  </footer>
);

export default AppFooter;
