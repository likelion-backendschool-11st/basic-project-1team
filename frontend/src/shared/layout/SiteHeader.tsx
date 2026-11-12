import React from 'react';
import { site, siteNav } from '../site';
import { Icon } from './Icon';
import { useSitePath } from './siteRouting';
import { NoticeTicker } from './NoticeTicker';
import { ProfileMenu } from './ProfileMenu';
import { SiteLink } from './SiteLink';

interface SiteHeaderProps {
  readonly className?: string;
}

const isActivePath = (path: string, href: string) => path === href || path.startsWith(`${href}/`);

/** 사용자 화면 공통 헤더 (로고·메뉴·검색·알림·프로필 + 공지 롤링). */
export const SiteHeader: React.FC<SiteHeaderProps> = ({ className = '' }) => {
  const path = useSitePath();
  return (
    <header
      className={`fixed top-0 w-full z-50 bg-canvas/90 backdrop-blur-xl border-b border-hairline ${className}`}
    >
      <div className="h-14 max-w-[1280px] mx-auto px-margin flex items-center justify-between gap-gutter">
        <div className="flex items-center gap-space-lg">
          <SiteLink href={site.homePath} className="flex items-center gap-space-xs">
            <img alt={site.logoAlt} className="h-8 w-auto object-contain" src={site.logoSrc} />
            <span className="font-headline-sm text-headline-sm text-ink font-semibold tracking-tight">
              {site.brand}
            </span>
          </SiteLink>
          <nav className="hidden lg:flex items-center gap-space-xxs">
            {siteNav.map((item) => (
              <SiteLink
                key={item.href}
                href={item.href}
                className={`px-space-sm py-1.5 rounded font-label-md text-label-md transition-colors ${
                  isActivePath(path, item.href)
                    ? 'bg-surface-2 text-ink border border-hairline font-semibold'
                    : 'text-ink-subtle hover:text-ink hover:bg-surface-1'
                }`}
              >
                {item.label}
              </SiteLink>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-space-sm">
          <button
            aria-label={site.notificationsLabel}
            type="button"
            className="relative p-1.5 rounded text-ink-subtle hover:text-ink hover:bg-surface-1 transition-colors flex items-center justify-center"
          >
            <Icon name="notifications" className="text-[20px]" />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-primary-container ring-2 ring-canvas" />
          </button>
          <div className="flex items-center pl-space-xs border-l border-hairline">
            <ProfileMenu />
          </div>
        </div>
      </div>
      <NoticeTicker />
    </header>
  );
};
