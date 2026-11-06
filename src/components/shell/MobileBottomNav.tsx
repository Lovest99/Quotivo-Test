import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FileSpreadsheet,
  Plus,
  Users,
  MoreHorizontal,
  CheckSquare,
  BookOpen,
  LayoutTemplate,
  History,
  Settings,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const MobileBottomNav: React.FC = () => {
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const { quotes } = useApp();
  const pendingApprovals = quotes.filter((q) => q.status === 'awaiting_approval').length;

  return (
    <>
      {/* "More" Sheet on mobile */}
      {isMoreOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/50 backdrop-blur-xs lg:hidden animate-in fade-in duration-150">
          <div
            className="flex-1"
            onClick={() => setIsMoreOpen(false)}
          />
          <div className="bg-white dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-800 rounded-t-2xl p-4 shadow-xl space-y-3 animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-100 dark:border-neutral-800">
              <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                Additional Tools
              </span>
              <button
                onClick={() => setIsMoreOpen(false)}
                className="p-1 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <NavLink
                to="/app/approvals"
                onClick={() => setIsMoreOpen(false)}
                className="flex items-center gap-2.5 p-3 rounded-lg border border-neutral-100 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-medium"
              >
                <CheckSquare className="w-4 h-4 text-blue-600" />
                <span>Approvals</span>
                {pendingApprovals > 0 && (
                  <span className="ml-auto text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-700">
                    {pendingApprovals}
                  </span>
                )}
              </NavLink>

              <NavLink
                to="/app/catalogue"
                onClick={() => setIsMoreOpen(false)}
                className="flex items-center gap-2.5 p-3 rounded-lg border border-neutral-100 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-medium"
              >
                <BookOpen className="w-4 h-4 text-blue-600" />
                <span>Catalogue</span>
              </NavLink>

              <NavLink
                to="/app/templates"
                onClick={() => setIsMoreOpen(false)}
                className="flex items-center gap-2.5 p-3 rounded-lg border border-neutral-100 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-medium"
              >
                <LayoutTemplate className="w-4 h-4 text-blue-600" />
                <span>Templates</span>
              </NavLink>

              <NavLink
                to="/app/activity"
                onClick={() => setIsMoreOpen(false)}
                className="flex items-center gap-2.5 p-3 rounded-lg border border-neutral-100 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-medium"
              >
                <History className="w-4 h-4 text-blue-600" />
                <span>Activity</span>
              </NavLink>

              <NavLink
                to="/app/settings/business"
                onClick={() => setIsMoreOpen(false)}
                className="col-span-2 flex items-center gap-2.5 p-3 rounded-lg border border-neutral-100 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-medium"
              >
                <Settings className="w-4 h-4 text-blue-600" />
                <span>Business & Integration Settings</span>
              </NavLink>
            </div>
          </div>
        </div>
      )}

      {/* Persistent Bottom Bar */}
      <nav className="bottom-nav fixed bottom-0 left-0 right-0 z-30 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md border-t border-neutral-200 dark:border-neutral-800 lg:hidden px-2 pb-safe no-print">
        <div className="flex items-center justify-around h-14">
          <NavLink
            to="/app"
            end
            className={({ isActive }) =>
              `flex flex-col items-center justify-center min-w-[56px] min-h-[44px] text-[11px] font-medium transition-colors ${
                isActive
                  ? 'text-blue-600 dark:text-blue-400 font-semibold'
                  : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
              }`
            }
          >
            <LayoutDashboard className="w-4 h-4 mb-0.5" />
            <span>Home</span>
          </NavLink>

          <NavLink
            to="/app/quotes"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center min-w-[56px] min-h-[44px] text-[11px] font-medium transition-colors ${
                isActive
                  ? 'text-blue-600 dark:text-blue-400 font-semibold'
                  : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
              }`
            }
          >
            <FileSpreadsheet className="w-4 h-4 mb-0.5" />
            <span>Quotes</span>
          </NavLink>

          {/* Elevated Create Button */}
          <NavLink
            to="/app/requests/new"
            className="flex flex-col items-center justify-center min-w-[52px] min-h-[44px] -mt-4 bg-blue-600 text-white rounded-full p-2.5 shadow-md active:scale-95 transition-transform"
            aria-label="Create New Customer Request"
          >
            <Plus className="w-5 h-5 stroke-[2.5]" />
          </NavLink>

          <NavLink
            to="/app/customers"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center min-w-[56px] min-h-[44px] text-[11px] font-medium transition-colors ${
                isActive
                  ? 'text-blue-600 dark:text-blue-400 font-semibold'
                  : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
              }`
            }
          >
            <Users className="w-4 h-4 mb-0.5" />
            <span>Customers</span>
          </NavLink>

          <button
            onClick={() => setIsMoreOpen(true)}
            className="flex flex-col items-center justify-center min-w-[56px] min-h-[44px] text-[11px] font-medium text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors"
          >
            <MoreHorizontal className="w-4 h-4 mb-0.5" />
            <span>More</span>
          </button>
        </div>
      </nav>
    </>
  );
};
