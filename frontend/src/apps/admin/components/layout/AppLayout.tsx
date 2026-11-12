import React from 'react';
import { Outlet } from 'react-router-dom';
import { navItems } from '../../data/mockData';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';

interface AppLayoutProps {
  readonly onLogout?: () => void;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ onLogout }) => {
  return (
    <div className="min-h-screen bg-canvas text-ink selection:bg-primary-container selection:text-on-primary-container">
      <TopBar onLogout={onLogout} />
      <div className="flex min-h-[calc(100vh-3.5rem)]">
        <Sidebar items={navItems} />
        <main className="ml-60 min-w-0 max-w-[1440px] flex-1 bg-canvas p-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
