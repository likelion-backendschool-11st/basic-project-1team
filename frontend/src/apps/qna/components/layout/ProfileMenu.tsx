import React, { useEffect, useRef, useState } from 'react';
import { isLoggedIn, LOGIN_PATH, logout } from '../../../../shared/auth';
import { appShell } from '../../data/mockData';
import { Icon } from '../common/Icon';

const avatar = (
  <span className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
    <Icon name="person" className="text-on-primary text-[18px]" />
  </span>
);

/** 헤더 우측 프로필 버튼. 로그인 상태면 로그아웃 메뉴를 열고, 아니면 로그인 화면으로 이동한다. */
export const ProfileMenu: React.FC = () => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

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
      <a href={LOGIN_PATH} aria-label={appShell.loginLabel} className="rounded-full">
        {avatar}
      </a>
    );
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-label={appShell.profileLabel}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
        className="rounded-full flex"
      >
        {avatar}
      </button>
      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-36 py-1 rounded bg-surface-1 border border-hairline shadow-lg"
        >
          <button
            type="button"
            role="menuitem"
            onClick={logout}
            className="w-full flex items-center gap-space-xs px-space-sm py-1.5 text-left font-label-md text-label-md text-ink-subtle hover:text-ink hover:bg-surface-2 transition-colors"
          >
            <Icon name="logout" className="text-[18px]" />
            {appShell.logoutLabel}
          </button>
        </div>
      )}
    </div>
  );
};
