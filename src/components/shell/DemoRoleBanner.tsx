import React from 'react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';
import { ShieldCheck, UserCheck, ShieldAlert, RotateCcw, ChevronDown } from 'lucide-react';

export const DemoRoleBanner: React.FC = () => {
  const { currentUser, switchRole, resetAllDemoData, currentPlan, setUpgradeModalOpen } = useApp();

  const roles: { role: UserRole; label: string; shortLabel: string; desc: string; icon: React.ReactNode }[] = [
    {
      role: 'owner',
      label: 'Owner / Admin',
      shortLabel: 'Admin',
      desc: 'Full access: create, edit, approve, send, business settings',
      icon: <ShieldCheck className="w-3.5 h-3.5" />,
    },
    {
      role: 'staff',
      label: 'Staff Member',
      shortLabel: 'Staff',
      desc: 'Request creation & draft editing; approval disabled',
      icon: <UserCheck className="w-3.5 h-3.5" />,
    },
    {
      role: 'approver',
      label: 'Approver',
      shortLabel: 'Approver',
      desc: 'Review submitted revisions, request changes, approve & send',
      icon: <ShieldAlert className="w-3.5 h-3.5" />,
    },
  ];

  const planPrice = currentPlan === 'enterprise' ? '$79' : currentPlan === 'pro' ? '$29' : '$10';

  return (
    <div className="bg-neutral-100/90 dark:bg-neutral-900/90 backdrop-blur-xs border-b border-neutral-200 dark:border-neutral-800 text-xs px-3 sm:px-4 py-1.5 sm:py-2 text-neutral-600 dark:text-neutral-400 no-print transition-all">
      {/* Mobile Single-Line Ultra-Compact Bar (< sm) */}
      <div className="flex sm:hidden items-center justify-between w-full gap-2">
        <div className="flex items-center gap-1.5">
          <span className="font-bold text-neutral-900 dark:text-neutral-200 uppercase tracking-wider text-[9px] px-1 py-0.5 rounded bg-neutral-200 dark:bg-neutral-800">
            Demo
          </span>
          <div className="relative inline-flex items-center">
            <select
              value={currentUser.role}
              onChange={(e) => switchRole(e.target.value as UserRole)}
              aria-label="Switch active test role"
              className="appearance-none bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 font-semibold text-[11px] pl-2 pr-5 py-0.5 rounded border border-neutral-300 dark:border-neutral-700 shadow-2xs focus:outline-hidden"
            >
              {roles.map((r) => (
                <option key={r.role} value={r.role}>
                  {r.shortLabel}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3 h-3 text-neutral-400 absolute right-1.5 pointer-events-none" />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setUpgradeModalOpen(true)}
            className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300 border border-blue-200 dark:border-blue-900"
          >
            {planPrice}/mo
          </button>
          <button
            onClick={resetAllDemoData}
            title="Reset demo data"
            className="p-1 text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Desktop Bar (>= sm) */}
      <div className="hidden sm:flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-neutral-900 dark:text-neutral-100 uppercase tracking-wider text-[10px]">
            Demo Environment
          </span>
          <span className="text-neutral-300 dark:text-neutral-700">|</span>
          <span className="text-neutral-500 text-xs">Active Test Role:</span>
          <div className="flex items-center gap-1 bg-white dark:bg-neutral-800 p-0.5 rounded-md border border-neutral-200 dark:border-neutral-700">
            {roles.map((r) => {
              const isActive = currentUser.role === r.role;
              return (
                <button
                  key={r.role}
                  onClick={() => switchRole(r.role)}
                  title={r.desc}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 shadow-xs'
                      : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'
                  }`}
                >
                  {r.icon}
                  <span>{r.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            {currentUser.avatarUrl ? (
              <img
                src={currentUser.avatarUrl}
                alt={currentUser.name}
                className="w-5 h-5 rounded-full object-cover ring-1 ring-neutral-300 dark:ring-neutral-700 shadow-2xs shrink-0"
              />
            ) : null}
            <span className="text-[11px] text-neutral-500 hidden md:inline">
              Logged in as <strong className="text-neutral-800 dark:text-neutral-200">{currentUser.name}</strong>
            </span>
            <button
              onClick={() => setUpgradeModalOpen(true)}
              className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300 border border-blue-200 dark:border-blue-900 hover:bg-blue-200 transition-colors cursor-pointer"
            >
              {currentPlan ? `${currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1)} ${planPrice}/mo` : `Basic ${planPrice}/mo`}
            </button>
          </div>
          <button
            onClick={resetAllDemoData}
            className="inline-flex items-center gap-1 text-[11px] text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 hover:underline transition-colors cursor-pointer"
            title="Reset all quotations and catalogue items to initial seed state"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset Demo Data</span>
          </button>
        </div>
      </div>
    </div>
  );
};
