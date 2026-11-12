import React from 'react';
import { site } from '../site';

export const SiteFooter: React.FC = () => (
  <footer className="w-full bg-surface-1 border-t border-hairline mt-auto">
    <div className="max-w-[1280px] mx-auto px-margin py-space-lg flex flex-col md:flex-row items-center justify-between gap-space-md font-body-sm text-body-sm text-ink-subtle">
      <div className="flex items-center gap-space-sm">
        <span>{site.community}</span>
      </div>
    </div>
  </footer>
);
