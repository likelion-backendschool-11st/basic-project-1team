import React, { useEffect, useRef, useState } from 'react';
import { isLoggedIn, LOGIN_PATH, logout } from '../auth';
import { useMe } from '../me';
import { site } from '../site';
import { Icon } from './Icon';
import { SiteLink } from './SiteLink';

const Avatar: React.FC<{ readonly url?: string | null; readonly size?: 'sm' | 'md' }> = ({
  url = null,
  size = 'sm',
}) => {
  const box = size === 'sm' ? 'w-8 h-8' : 'w-10 h-10';
  return url ? (
    <img src={url} alt="" className={`${box} rounded-full object-cover`} />
  ) : (
    <span className={`${box} rounded-full bg-primary flex items-center justify-center`}>
      <Icon name="person" className="text-on-primary text-[18px]" />
    </span>
  );
};

const itemClass =
  'w-full flex items-center gap-space-xs px-space-sm py-2 text-left font-label-md text-label-md text-ink-subtle hover:text-ink hover:bg-surface-2 transition-colors';

/**
 * 헤더 우측 프로필 버튼. 로그인 상태면 내 정보 요약과 마이페이지·프로필 수정·로그아웃 메뉴를 열고,
 * 아니면 로그인 화면으로 이동한다. (REQ-LOGIN-007)
 */
export const ProfileMenu: React.FC = () => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const me = useMe();

  useEffect(() => {
    if (!open) return undefined;
    const handleMouseDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  if (!isLoggedIn()) {
    return (
      <SiteLink href={LOGIN_PATH} className="rounded-full">
        <span className="sr-only">{site.loginLabel}</span>
        <Avatar />
      </SiteLink>
    );
  }

  const close = () => setOpen(false);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-label={site.profileLabel}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
        className="rounded-full flex"
      >
        <Avatar url={me?.avatarUrl} />
      </button>
      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-60 rounded-lg bg-surface-1 border border-hairline shadow-lg overflow-hidden"
        >
          {me && (
            <div className="flex items-center gap-space-sm px-space-sm py-space-sm border-b border-hairline">
              <Avatar url={me.avatarUrl} size="md" />
              <div className="min-w-0">
                <p className="truncate font-label-md text-label-md text-ink font-semibold">
                  {me.nickname}
                </p>
                <p className="truncate font-caption text-caption text-ink-tertiary">{me.handle}</p>
              </div>
            </div>
          )}
          <div className="py-1">
            <SiteLink href={site.myPagePath} role="menuitem" onClick={close} className={itemClass}>
              <Icon name="person" className="text-[18px]" />
              {site.myPageLabel}
            </SiteLink>
            <SiteLink
              href={site.editProfilePath}
              role="menuitem"
              onClick={close}
              className={itemClass}
            >
              <Icon name="edit" className="text-[18px]" />
              {site.editProfileLabel}
            </SiteLink>
          </div>
          <div className="py-1 border-t border-hairline">
            <button type="button" role="menuitem" onClick={logout} className={itemClass}>
              <Icon name="logout" className="text-[18px]" />
              {site.logoutLabel}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
