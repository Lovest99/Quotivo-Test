import React from 'react';
import { ActivityEvent } from '../../types';
import { formatDateTime } from '../../utils/formatters';
import {
  FileText,
  Sparkles,
  Clock,
  MessageSquare,
  CheckCircle2,
  Send,
  AlertCircle,
  CheckCheck,
  XCircle,
  Copy,
} from 'lucide-react';

interface ActivityTimelineProps {
  events: ActivityEvent[];
  className?: string;
}

export const ActivityTimeline: React.FC<ActivityTimelineProps> = ({ events, className = '' }) => {
  if (events.length === 0) {
    return (
      <div className="py-8 text-center text-xs text-neutral-500">
        No recorded activity events for this quotation yet.
      </div>
    );
  }

  const getEventIcon = (type: ActivityEvent['type']) => {
    switch (type) {
      case 'request_created':
        return <FileText className="w-3.5 h-3.5 text-neutral-500" />;
      case 'draft_generated':
        return <Sparkles className="w-3.5 h-3.5 text-blue-600" />;
      case 'submitted_for_approval':
        return <Clock className="w-3.5 h-3.5 text-blue-600" />;
      case 'changes_requested':
        return <MessageSquare className="w-3.5 h-3.5 text-orange-600" />;
      case 'approved':
        return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />;
      case 'send_attempted':
        return <Send className="w-3.5 h-3.5 text-indigo-600" />;
      case 'delivery_failed':
        return <AlertCircle className="w-3.5 h-3.5 text-rose-600" />;
      case 'delivered':
        return <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />;
      case 'customer_accepted':
        return <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />;
      case 'customer_declined':
        return <XCircle className="w-3.5 h-3.5 text-rose-600" />;
      case 'new_revision_created':
        return <Copy className="w-3.5 h-3.5 text-neutral-600" />;
      default:
        return <FileText className="w-3.5 h-3.5 text-neutral-400" />;
    }
  };

  return (
    <div className={`space-y-4 text-xs ${className}`}>
      <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-px before:bg-neutral-200 dark:before:bg-neutral-800">
        {events.map((evt) => (
          <div key={evt.id} className="relative group">
            {/* Timeline bullet icon */}
            <div className="absolute -left-6 top-0.5 w-5 h-5 rounded-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 flex items-center justify-center">
              {getEventIcon(evt.type)}
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                  {evt.title}
                </span>
                <span className="text-[11px] font-mono text-neutral-400">
                  {formatDateTime(evt.timestamp)}
                </span>
              </div>

              <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
                {evt.description}
              </p>

              <div className="flex items-center gap-1.5 text-[11px] text-neutral-400 pt-0.5">
                <span>By {evt.performedByName}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
