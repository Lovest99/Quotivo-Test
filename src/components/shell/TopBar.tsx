import React, { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { BrandLogo } from '../ui/BrandLogo';
import { UserRole } from '../../types';
import {
  Search,
  Bell,
  Sun,
  Moon,
  Plus,
  Menu,
  Check,
  User,
  Settings,
  LogOut,
  ChevronDown,
  CheckCheck,
  Layers,
  LayoutDashboard,
  FileSpreadsheet,
  CheckSquare,
  Users,
  BookOpen,
  LayoutTemplate,
  RotateCcw,
  ShieldCheck,
  UserCheck,
  ShieldAlert,
} from 'lucide-react';

interface TopBarProps {
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
}

export const TopBar: React.FC<TopBarProps> = ({ onToggleSidebar }) => {
  const navigate = useNavigate();
  const {
    currentUser,
    availableUsers,
    switchUser,
    switchRole,
    resetAllDemoData,
    theme,
    toggleTheme,
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    setCommandPaletteOpen,
    business,
    quotes,
    currentPlan,
    setUpgradeModalOpen,
  } = useApp();

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isRoleMenuOpen, setIsRoleMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const unreadNotifications = notifications.filter((n) => !n.read);
  const unreadCount = unreadNotifications.length;
  const pendingApprovalsCount = quotes.filter((q) => q.status === 'awaiting_approval').length;

  const roles: { role: UserRole; label: string; shortLabel: string; desc: string; icon: React.ReactNode }[] = [
    {
      role: 'owner',
      label: 'Owner / Admin',
      shortLabel: 'Admin',
      desc: 'Full access: create, edit, approve, send, business settings',
      icon: <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />,
    },
    {
      role: 'staff',
      label: 'Staff Member',
      shortLabel: 'Staff',
      desc: 'Request creation & draft editing; approval disabled',
      icon: <UserCheck className="w-3.5 h-3.5 text-neutral-500" />,
    },
    {
      role: 'approver',
      label: 'Approver',
      shortLabel: 'Approver',
      desc: 'Review submitted revisions, request changes, approve & send',
      icon: <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />,
    },
  ];

  const planPrice = currentPlan === 'enterprise' ? '$79' : currentPlan === 'pro' ? '$29' : '$10';

  // Desktop Top Navigation Links (PC on PC)
  const topNavItems = [
    { label: 'Dashboard', to: '/app', icon: LayoutDashboard, end: true },
    { label: 'Quotes', to: '/app/quotes', icon: FileSpreadsheet },
    {
      label: 'Approvals',
      to: '/app/approvals',
      icon: CheckSquare,
      badge: pendingApprovalsCount > 0 ? pendingApprovalsCount : undefined,
    },
    { label: 'Customers', to: '/app/customers', icon: Users },
    { label: 'Catalogue', to: '/app/catalogue', icon: BookOpen },
    { label: 'Templates', to: '/app/templates', icon: LayoutTemplate },
    { label: 'Settings', to: '/app/settings/business', icon: Settings },
  ];

  return (
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md border-b border-neutral-200/90 dark:border-neutral-800 transition-colors no-print">
      <div className="flex items-center justify-between h-14 px-3 sm:px-5 lg:px-6 gap-2 sm:gap-4 max-w-full">
        {/* Left: Mobile Drawer Trigger + Brand Wordmark */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            onClick={onToggleSidebar}
            className="p-1.5 -ml-1 text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors lg:hidden"
            aria-label="Toggle navigation drawer"
          >
            <Menu className="w-5 h-5" />
          </button>

          <Link
            to="/app"
            className="flex items-center gap-2 hover:opacity-90 transition-opacity"
            title="Quotivo Dashboard"
          >
            <BrandLogo size="xs" showTagline={false} />
            <span className="hidden xl:inline-block text-[11px] font-semibold text-neutral-400 dark:text-neutral-500 border-l border-neutral-200 dark:border-neutral-800 pl-2.5">
              {business.name || 'Commercial Quoting'}
            </span>
          </Link>
        </div>

        {/* Center: Desktop Top Navigation Links (PC on PC) */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-1.5">
          {topNavItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 shrink-0 ${
                  isActive
                    ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 font-semibold shadow-2xs'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100/70 dark:hover:bg-neutral-800/60'
                }`
              }
            >
              <item.icon className="w-3.5 h-3.5 shrink-0" />
              <span>{item.label}</span>
              {item.badge !== undefined && (
                <span className="ml-0.5 px-1.5 py-0.2 text-[10px] font-mono font-bold rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300">
                  {item.badge}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Right Section: Search, Role, Plan, Theme, Notifications, Profile, New Quote */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {/* Quick Command Palette Search (Desktop XL) */}
          <button
            onClick={() => setCommandPaletteOpen(true)}
            className="hidden xl:flex items-center gap-2 px-2.5 py-1 text-xs text-neutral-400 bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700/70 rounded-lg hover:border-neutral-300 dark:hover:border-neutral-600 transition-all text-left shrink-0"
            title="Search quotes, catalogue, customers (⌘K)"
          >
            <Search className="w-3 h-3 text-neutral-400" />
            <span className="text-[11px]">Search...</span>
            <kbd className="px-1 py-0.2 text-[9px] font-mono text-neutral-400 bg-white dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 rounded">
              ⌘K
            </kbd>
          </button>

          {/* Search Trigger for Mobile & Small Desktop */}
          <button
            onClick={() => setCommandPaletteOpen(true)}
            className="xl:hidden p-1.5 sm:p-2 text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors shrink-0"
            aria-label="Search"
            title="Search (⌘K)"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Integrated Role Switcher Pill (Tablet & Desktop PC only - hidden on mobile, accessible via User Avatar and Sidebar drawer) */}
          <div className="relative hidden md:block shrink-0">
            <button
              onClick={() => setIsRoleMenuOpen((prev) => !prev)}
              className="flex items-center gap-1 px-2 py-1 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200/80 dark:hover:bg-neutral-700 border border-neutral-200 dark:border-neutral-700 rounded-lg text-xs font-medium text-neutral-800 dark:text-neutral-200 transition-colors"
              title="Switch active role"
            >
              <span className="font-semibold capitalize text-[11px] sm:text-xs">
                {currentUser.role}
              </span>
              <ChevronDown className="w-3 h-3 text-neutral-400" />
            </button>

            {isRoleMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsRoleMenuOpen(false)}
                />
                <div className="absolute right-0 mt-1.5 w-64 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-xl py-1.5 z-50 text-xs animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3 py-1.5 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
                    <span className="font-bold text-[11px] uppercase tracking-wider text-neutral-400">
                      Switch Role
                    </span>
                    <button
                      onClick={() => {
                        resetAllDemoData();
                        setIsRoleMenuOpen(false);
                      }}
                      className="text-[10px] text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200 flex items-center gap-1"
                      title="Reset demo data"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Reset</span>
                    </button>
                  </div>

                  <div className="py-1">
                    {roles.map((r) => {
                      const isSelected = currentUser.role === r.role;
                      return (
                        <button
                          key={r.role}
                          onClick={() => {
                            switchRole(r.role);
                            setIsRoleMenuOpen(false);
                          }}
                          className={`w-full flex items-start gap-2.5 px-3 py-2 text-left hover:bg-neutral-50 dark:hover:bg-neutral-800/60 transition-colors ${
                            isSelected ? 'bg-blue-50/50 dark:bg-blue-950/30' : ''
                          }`}
                        >
                          <div className="mt-0.5 shrink-0">{r.icon}</div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className={`font-semibold ${isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-neutral-800 dark:text-neutral-200'}`}>
                                {r.label}
                              </span>
                              {isSelected && <Check className="w-3.5 h-3.5 text-blue-600" />}
                            </div>
                            <p className="text-[10px] text-neutral-500 dark:text-neutral-400 mt-0.5 line-clamp-1">
                              {r.desc}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Subscription Tier Pill (Wide screens only to preserve space) */}
          <button
            onClick={() => setUpgradeModalOpen(true)}
            className="hidden xl:inline-flex items-center gap-1 px-2 py-1 text-[11px] font-semibold rounded-lg bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200/80 dark:border-blue-900/60 hover:bg-blue-100 transition-colors cursor-pointer shrink-0"
            title="Manage subscription and quotas"
          >
            <Layers className="w-3 h-3 text-blue-600 dark:text-blue-400" />
            <span className="capitalize">{currentPlan}</span>
            <span className="text-[10px] font-mono text-blue-500 dark:text-blue-400">
              {planPrice}/mo
            </span>
          </button>

          {/* Theme toggle (Tablet & Desktop PC) */}
          <button
            onClick={toggleTheme}
            className="hidden sm:inline-flex p-1.5 sm:p-2 text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors shrink-0"
            aria-label="Toggle color theme"
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-neutral-600" />
            )}
          </button>

          {/* Notifications Dropdown */}
          <div className="relative shrink-0">
            <button
              onClick={() => setIsNotificationsOpen((prev) => !prev)}
              className="relative p-1.5 sm:p-2 text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1 sm:top-1.5 right-1 sm:right-1.5 w-2 h-2 rounded-full bg-blue-600 ring-2 ring-white dark:ring-neutral-900" />
              )}
            </button>

            {isNotificationsOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsNotificationsOpen(false)}
                />
                <div className="fixed sm:absolute inset-x-3 sm:inset-x-auto sm:right-0 top-14 sm:top-full mt-1.5 w-auto sm:w-96 max-w-sm sm:max-w-none bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-xl py-2 z-50 text-xs animate-in fade-in zoom-in-95 duration-150 mx-auto sm:mx-0">
                  <div className="px-4 py-2 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-neutral-900 dark:text-neutral-100">Notifications</span>
                      {unreadCount > 0 && (
                        <span className="px-1.5 py-0.2 text-[10px] font-mono font-bold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 rounded">
                          {unreadCount}
                        </span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllNotificationsRead}
                        className="text-[11px] text-blue-600 hover:underline flex items-center gap-1"
                      >
                        <CheckCheck className="w-3 h-3" />
                        <span>Mark all read</span>
                      </button>
                    )}
                  </div>

                  <div className="max-h-72 overflow-y-auto divide-y divide-neutral-100 dark:divide-neutral-800/60">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-neutral-400 text-xs">
                        No notifications right now
                      </div>
                    ) : (
                      notifications.slice(0, 5).map((n) => (
                        <div
                          key={n.id}
                          onClick={() => {
                            markNotificationRead(n.id);
                            setIsNotificationsOpen(false);
                            if (n.targetUrl) navigate(n.targetUrl);
                          }}
                          className={`p-3 hover:bg-neutral-50 dark:hover:bg-neutral-800/60 cursor-pointer transition-colors ${
                            !n.read ? 'bg-blue-50/40 dark:bg-blue-950/20' : ''
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="font-semibold text-neutral-900 dark:text-neutral-100 line-clamp-1">
                              {n.title}
                            </span>
                            {!n.read && (
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0 mt-1" />
                            )}
                          </div>
                          <p className="text-[11px] text-neutral-600 dark:text-neutral-400 mt-0.5 line-clamp-2">
                            {n.message}
                          </p>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="p-2 border-t border-neutral-100 dark:border-neutral-800 text-center">
                    <Link
                      to="/app/notifications"
                      onClick={() => setIsNotificationsOpen(false)}
                      className="text-[11px] text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200 font-medium"
                    >
                      View all notification logs &rarr;
                    </Link>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* User Profile Dropdown */}
          <div className="relative shrink-0">
            <button
              onClick={() => setIsUserMenuOpen((prev) => !prev)}
              className="flex items-center gap-1.5 p-1 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors focus:outline-hidden"
              aria-label="User profile and account switcher"
            >
              {currentUser.avatarUrl ? (
                <div className="relative">
                  <img
                    src={currentUser.avatarUrl}
                    alt={currentUser.name}
                    className="w-7 h-7 rounded-full object-cover ring-1 ring-neutral-200 dark:ring-neutral-700 shadow-2xs"
                  />
                  <span className={`absolute bottom-0 right-0 w-2 h-2 rounded-full border border-white dark:border-neutral-900 ${currentUser.role === 'owner' ? 'bg-blue-600' : currentUser.role === 'approver' ? 'bg-amber-500' : 'bg-neutral-400'}`} />
                </div>
              ) : (
                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-2xs">
                  {currentUser.name.charAt(0)}
                </div>
              )}
            </button>

            {isUserMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsUserMenuOpen(false)}
                />
                <div className="absolute right-0 mt-1.5 w-64 max-w-[calc(100vw-24px)] bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-xl py-1.5 z-50 text-xs animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3.5 py-2.5 border-b border-neutral-100 dark:border-neutral-800">
                    <p className="font-semibold text-neutral-900 dark:text-neutral-100 truncate">{currentUser.name}</p>
                    <p className="text-[11px] text-neutral-500 truncate">{currentUser.email}</p>
                    <div className="mt-1 flex items-center gap-1.5">
                      <span className="inline-block text-[10px] font-semibold tracking-wider uppercase text-blue-600 dark:text-blue-400">
                        {currentUser.role}
                      </span>
                      <span className="text-[10px] text-neutral-400">· {business.name}</span>
                    </div>
                  </div>

                  {/* Role Switcher in User Menu (especially great for mobile) */}
                  <div className="py-1 border-b border-neutral-100 dark:border-neutral-800">
                    <div className="px-3.5 py-1 flex items-center justify-between">
                      <p className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider">
                        Active Role
                      </p>
                      <button
                        onClick={() => {
                          resetAllDemoData();
                          setIsUserMenuOpen(false);
                        }}
                        className="text-[10px] text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200 flex items-center gap-1"
                        title="Reset demo data"
                      >
                        <RotateCcw className="w-2.5 h-2.5" />
                        <span>Reset</span>
                      </button>
                    </div>
                    <div className="px-1.5 space-y-0.5">
                      {roles.map((r) => {
                        const isSelected = currentUser.role === r.role;
                        return (
                          <button
                            key={r.role}
                            onClick={() => {
                              switchRole(r.role);
                              setIsUserMenuOpen(false);
                            }}
                            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition-colors ${
                              isSelected
                                ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-semibold'
                                : 'hover:bg-neutral-50 dark:hover:bg-neutral-800/60 text-neutral-700 dark:text-neutral-300'
                            }`}
                          >
                            <span className="flex items-center gap-2">
                              {r.icon}
                              <span>{r.label}</span>
                            </span>
                            {isSelected && <Check className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Switch User Profile */}
                  <div className="py-1">
                    <p className="px-3.5 py-1 text-[10px] font-semibold text-neutral-400 uppercase tracking-wider">
                      Switch User Profile
                    </p>
                    {availableUsers.map((u) => (
                      <button
                        key={u.id}
                        onClick={() => {
                          switchUser(u.id);
                          setIsUserMenuOpen(false);
                        }}
                        className="w-full flex items-center justify-between px-3.5 py-1.5 text-left hover:bg-neutral-50 dark:hover:bg-neutral-800/60 transition-colors"
                      >
                        <span className="flex items-center gap-2">
                          {u.avatarUrl ? (
                            <img
                              src={u.avatarUrl}
                              alt={u.name}
                              className="w-4 h-4 rounded-full object-cover shrink-0"
                            />
                          ) : (
                            <User className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                          )}
                          <span className={u.id === currentUser.id ? 'font-semibold text-neutral-900 dark:text-neutral-100' : 'text-neutral-600 dark:text-neutral-400'}>
                            {u.name} <span className="text-[10px] text-neutral-400 uppercase">({u.role})</span>
                          </span>
                        </span>
                        {u.id === currentUser.id && <Check className="w-3.5 h-3.5 text-blue-600" />}
                      </button>
                    ))}
                  </div>

                  {/* Appearance Theme Toggle */}
                  <div className="border-t border-neutral-100 dark:border-neutral-800 py-1">
                    <button
                      onClick={toggleTheme}
                      className="w-full flex items-center justify-between px-3.5 py-1.5 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800/60 transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        {theme === 'dark' ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-neutral-600" />}
                        <span>Theme: {theme === 'dark' ? 'Dark' : 'Light'}</span>
                      </span>
                      <span className="text-[10px] text-neutral-400">Toggle</span>
                    </button>
                  </div>

                  <div className="border-t border-neutral-100 dark:border-neutral-800 py-1">
                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        navigate('/app/pricing');
                      }}
                      className="w-full flex items-center justify-between px-3.5 py-1.5 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800/60 transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <Layers className="w-3.5 h-3.5 text-blue-600" />
                        <span>Subscription & Plans</span>
                      </span>
                      <span className="text-[10px] text-neutral-400 font-mono capitalize">{currentPlan}</span>
                    </button>
                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        navigate('/app/settings/business');
                      }}
                      className="w-full flex items-center gap-2 px-3.5 py-1.5 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800/60 transition-colors"
                    >
                      <Settings className="w-3.5 h-3.5" />
                      <span>Workspace Settings</span>
                    </button>
                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        navigate('/login');
                      }}
                      className="w-full flex items-center gap-2 px-3.5 py-1.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Switch Session / Sign Out</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Primary Action Button: New Quote (Desktop PC only - hidden on mobile where bottom nav provides elevated center + button) */}
          <Link
            to="/app/requests/new"
            className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-neutral-100 dark:text-neutral-950 dark:hover:bg-white rounded-lg text-xs font-semibold shadow-2xs hover:shadow-xs transition-all whitespace-nowrap shrink-0"
            title="Create New Quote"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>New Quote</span>
          </Link>
        </div>
      </div>
    </header>
  );
};
