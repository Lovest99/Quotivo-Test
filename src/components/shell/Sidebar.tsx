import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { BrandLogo } from '../ui/BrandLogo';
import {
  LayoutDashboard,
  PlusCircle,
  FileSpreadsheet,
  CheckSquare,
  Users,
  BookOpen,
  LayoutTemplate,
  History,
  Settings,
  X,
  Sparkles,
  Shield,
  Layers,
  Sun,
  Moon,
  ShieldCheck,
  UserCheck,
  ShieldAlert,
} from 'lucide-react';
import { UserRole } from '../../types';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const {
    quotes,
    business,
    currentUser,
    switchRole,
    currentPlan,
    setUpgradeModalOpen,
    theme,
    toggleTheme,
  } = useApp();

  const pendingApprovalsCount = quotes.filter((q) => q.status === 'awaiting_approval').length;

  const navItems = [
    { label: 'Overview', to: '/app', icon: LayoutDashboard, end: true },
    { label: 'New Request', to: '/app/requests/new', icon: PlusCircle },
    { label: 'Quotes', to: '/app/quotes', icon: FileSpreadsheet },
    {
      label: 'Approvals',
      to: '/app/approvals',
      icon: CheckSquare,
      badge: pendingApprovalsCount > 0 ? pendingApprovalsCount : undefined,
    },
    { label: 'Customers', to: '/app/customers', icon: Users },
    { label: 'Price Catalogue', to: '/app/catalogue', icon: BookOpen },
    { label: 'Templates', to: '/app/templates', icon: LayoutTemplate },
    { label: 'Activity Audit', to: '/app/activity', icon: History },
    { label: 'Pricing & Plans', to: '/app/pricing', icon: Layers },
    { label: 'Settings', to: '/app/settings/business', icon: Settings },
  ];

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 h-full w-72 bg-white dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800 flex flex-col transition-transform duration-200 ease-in-out shrink-0 no-print shadow-2xl ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-4 border-b border-neutral-100 dark:border-neutral-800/80 flex items-center justify-between">
          <Link
            to="/app"
            onClick={onClose}
            className="flex items-center gap-2 hover:opacity-85 transition-opacity"
          >
            <BrandLogo size="sm" showTagline={false} />
          </Link>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 rounded-md transition-colors"
            aria-label="Close menu"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Workspace Context Chip */}
        <div className="px-4 py-2 border-b border-neutral-100 dark:border-neutral-800/60 bg-neutral-50/50 dark:bg-neutral-800/30 flex items-center justify-between text-[11px]">
          <span className="text-neutral-600 dark:text-neutral-300 font-semibold truncate max-w-[130px]">
            {business.name || 'Enterprise'}
          </span>
          <span className="font-mono text-neutral-400 text-[10px] tracking-tight">
            Quotivo Pro
          </span>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={() => {
                  if (window.innerWidth < 1024) onClose();
                }}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-semibold shadow-2xs'
                      : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-50 dark:hover:bg-neutral-800/50'
                  }`
                }
              >
                <div className="flex items-center gap-2.5 truncate">
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span className="ml-2 px-1.5 py-0.5 text-[10px] font-mono font-bold rounded bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* User Card, Role Switcher & Active Plan */}
        <div className="p-3 border-t border-neutral-100 dark:border-neutral-800/80 bg-neutral-50/50 dark:bg-neutral-900/40 space-y-2.5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              {currentUser.avatarUrl ? (
                <img
                  src={currentUser.avatarUrl}
                  alt={currentUser.name}
                  className="w-8 h-8 rounded-full object-cover ring-1 ring-neutral-200 dark:ring-neutral-700 shrink-0"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                  {currentUser.name.charAt(0)}
                </div>
              )}
              <div className="flex flex-col min-w-0 flex-1">
                <span className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 truncate">
                  {currentUser.name}
                </span>
                <span className="text-[10px] text-neutral-400 capitalize truncate">
                  {currentUser.role} · {business.name}
                </span>
              </div>
            </div>

            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-1.5 text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 rounded-lg hover:bg-neutral-200/60 dark:hover:bg-neutral-800 transition-colors shrink-0"
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-neutral-600" />
              )}
            </button>
          </div>

          {/* Quick Role Switcher for Mobile Drawer */}
          <div>
            <div className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider mb-1">
              Active Role
            </div>
            <div className="grid grid-cols-3 gap-1 bg-neutral-200/60 dark:bg-neutral-800/80 p-0.5 rounded-lg text-[11px]">
              {(['owner', 'staff', 'approver'] as UserRole[]).map((r) => {
                const isSelected = currentUser.role === r;
                return (
                  <button
                    key={r}
                    onClick={() => switchRole(r)}
                    className={`py-1 rounded-md capitalize font-medium transition-colors text-center ${
                      isSelected
                        ? 'bg-white dark:bg-neutral-700 text-blue-600 dark:text-blue-400 font-bold shadow-2xs'
                        : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'
                    }`}
                  >
                    {r === 'owner' ? 'Owner' : r === 'staff' ? 'Staff' : 'Approver'}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-2 border-t border-neutral-200/60 dark:border-neutral-800/60 flex items-center justify-between text-[11px]">
            <span className="text-neutral-500">
              Plan: <strong className="text-neutral-800 dark:text-neutral-200 capitalize">{currentPlan} (${currentPlan === 'basic' ? '10' : currentPlan === 'pro' ? '29' : '79'}/mo)</strong>
            </span>
            <button
              type="button"
              onClick={() => setUpgradeModalOpen(true)}
              className="text-blue-600 dark:text-blue-400 font-semibold hover:underline text-[11px] cursor-pointer"
            >
              Change &rarr;
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
