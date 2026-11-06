import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { TopBar } from './TopBar';
import { Sidebar } from './Sidebar';
import { MobileBottomNav } from './MobileBottomNav';
import { CommandPalette } from './CommandPalette';
import { ToastContainer } from '../ui/ToastContainer';
import { PricingModal } from '../ui/PricingModal';
import { WifiOff } from 'lucide-react';

export const AppShell: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden subtle-animated-bg text-neutral-900 dark:text-neutral-100 flex flex-col font-sans transition-colors">
      {/* Offline Alert Banner if connectivity drops */}
      {!isOnline && (
        <div className="bg-amber-600 text-white text-xs font-medium px-4 py-1.5 flex items-center justify-center gap-2 no-print">
          <WifiOff className="w-3.5 h-3.5" />
          <span>You are currently offline. Changes are saved locally to your device.</span>
        </div>
      )}

      {/* Main Top Header with integrated Top Nav for PC and mobile drawer */}
      <TopBar
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
      />

      {/* Content Canvas */}
      <div className="flex-1 flex w-full max-w-full overflow-x-hidden">
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        <main className="flex-1 min-w-0 max-w-full overflow-x-hidden flex flex-col justify-between pb-20 lg:pb-8">
          <div className="flex-1">
            <Outlet />
          </div>

          {/* App Workspace Footer */}
          <footer className="mt-8 pt-4 pb-2 border-t border-neutral-200/60 dark:border-neutral-800/60 px-4 sm:px-6 lg:px-8 text-center text-xs text-neutral-400 dark:text-neutral-500 no-print">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 max-w-7xl mx-auto">
              <p className="flex items-center justify-center gap-1.5 text-xs text-neutral-600 dark:text-neutral-400 font-medium">
                <span>Made with <span className="text-rose-500">❤️</span> by Bright</span>
              </p>
              <p className="text-[11px] text-neutral-400">
                Quotivo Commercial Quoting Platform · Revision-Locked Governance
              </p>
            </div>
          </footer>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />

      {/* Command Palette Modal */}
      <CommandPalette />

      {/* Subscription Pricing Modal */}
      <PricingModal />

      {/* Floating Toast Notification Container */}
      <ToastContainer />
    </div>
  );
};
