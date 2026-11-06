import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { formatDateTime } from '../utils/formatters';
import {
  Bell,
  Clock,
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  Info,
  Check,
} from 'lucide-react';

export const NotificationsPage: React.FC = () => {
  const navigate = useNavigate();
  const { notifications, markNotificationRead, markAllNotificationsRead } = useApp();

  const getIcon = (type: string) => {
    switch (type) {
      case 'approval_requested':
        return <Clock className="w-4 h-4 text-blue-600" />;
      case 'changes_requested':
        return <MessageSquare className="w-4 h-4 text-orange-600" />;
      case 'quote_approved':
        return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
      case 'delivery_failed':
        return <AlertCircle className="w-4 h-4 text-rose-600" />;
      default:
        return <Info className="w-4 h-4 text-blue-600" />;
    }
  };

  const handleNotificationClick = (id: string, targetUrl: string) => {
    markNotificationRead(id);
    navigate(targetUrl);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-3xl mx-auto space-y-6 animate-in fade-in duration-200">
      <div className="flex items-center justify-between pb-4 border-b border-neutral-200 dark:border-neutral-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
            <Bell className="w-5 h-5 text-blue-600" />
            <span>Notifications</span>
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            System updates, human approval requests, and quotation delivery events.
          </p>
        </div>

        {notifications.some((n) => !n.read) && (
          <button
            type="button"
            onClick={markAllNotificationsRead}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Mark all as read</span>
          </button>
        )}
      </div>

      <div className="space-y-2">
        {notifications.map((notif) => (
          <div
            key={notif.id}
            onClick={() => handleNotificationClick(notif.id, notif.targetUrl)}
            className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start gap-3.5 text-xs ${
              !notif.read
                ? 'bg-blue-50/40 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900/60 shadow-xs'
                : 'bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700'
            }`}
          >
            <div className="p-2 rounded-lg bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 shrink-0 mt-0.5">
              {getIcon(notif.type)}
            </div>

            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                  {notif.title}
                </span>
                <span className="text-[10px] font-mono text-neutral-400">
                  {formatDateTime(notif.createdAt)}
                </span>
              </div>
              <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
                {notif.message}
              </p>
            </div>

            {!notif.read && (
              <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0 mt-2" />
            )}
          </div>
        ))}

        {notifications.length === 0 && (
          <div className="py-12 text-center text-xs text-neutral-400 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-8">
            You're all caught up! No notifications.
          </div>
        )}
      </div>
    </div>
  );
};
