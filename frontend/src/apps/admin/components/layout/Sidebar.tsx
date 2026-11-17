import React from 'react';
import type { NavEntry } from '../../types';
import { SidebarNavItem } from './SidebarNavItem';

interface SidebarProps {
  readonly items: readonly NavEntry[];
}

export const Sidebar: React.FC<SidebarProps> = ({ items }) => {
  return (
    <aside className="fixed bottom-0 left-0 top-14 z-40 flex w-60 flex-col border-r border-hairline bg-canvas p-space-sm">
      <nav aria-label="관리자 메뉴" className="space-y-1">
        {items.map((item) => (
          <SidebarNavItem key={item.to} item={item} />
        ))}
      </nav>
    </aside>
  );
};
