import React from 'react';
import { site } from '../site';

interface SiteFooterProps {
  readonly showVersion?: boolean;
}

export const SiteFooter: React.FC<SiteFooterProps> = ({ showVersion = true }) => (
  <footer className="w-full bg-surface-1 border-t border-hairline mt-auto">
    <div className="max-w-[1280px] mx-auto px-margin py-space-lg flex flex-col md:flex-row items-center justify-between gap-space-md font-body-sm text-body-sm text-ink-subtle">
      <div className="flex items-center gap-space-sm">
        {showVersion && (
          <span className="font-code-inline text-code-inline text-ink-tertiary">
            {site.version}
          </span>
        )}
        <span className="text-ink-tertiary">•</span>
        <span>{site.community}</span>
      </div>
      <div className="flex items-center gap-space-lg">
        {site.footerLinks.map((label) => (
          <a key={label} className="hover:text-ink transition-colors" href="#">
            {label}
          </a>
        ))}
      </div>
    </div>
  </footer>
);
