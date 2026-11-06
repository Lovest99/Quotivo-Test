/**
 * Status Badges following anti-slop zero-pill guidelines
 * Uses semantic color indicators paired with Lucide icons and clean readable text.
 */

import React from 'react';
import {
  FileText,
  AlertCircle,
  Clock,
  MessageSquare,
  CheckCircle2,
  Send,
  CheckCheck,
  XCircle,
  Archive,
  Hourglass,
  HelpCircle,
} from 'lucide-react';
import { QuoteStatus, DeliveryStatus } from '../../types';

interface QuoteStatusBadgeProps {
  status: QuoteStatus;
  className?: string;
}

export const QuoteStatusBadge: React.FC<QuoteStatusBadgeProps> = ({ status, className = '' }) => {
  switch (status) {
    case 'draft':
      return (
        <span className={`inline-flex items-center gap-1.5 text-xs font-medium text-neutral-600 dark:text-neutral-400 ${className}`}>
          <FileText className="w-3.5 h-3.5 text-neutral-400" />
          <span>Draft</span>
        </span>
      );
    case 'needs_info':
      return (
        <span className={`inline-flex items-center gap-1.5 text-xs font-medium text-amber-700 dark:text-amber-400 ${className}`}>
          <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
          <span>Needs Info</span>
        </span>
      );
    case 'awaiting_approval':
      return (
        <span className={`inline-flex items-center gap-1.5 text-xs font-medium text-blue-700 dark:text-blue-400 ${className}`}>
          <Clock className="w-3.5 h-3.5 text-blue-500 animate-pulse" />
          <span>Awaiting Approval</span>
        </span>
      );
    case 'changes_requested':
      return (
        <span className={`inline-flex items-center gap-1.5 text-xs font-medium text-orange-700 dark:text-orange-400 ${className}`}>
          <MessageSquare className="w-3.5 h-3.5 text-orange-500" />
          <span>Changes Requested</span>
        </span>
      );
    case 'approved':
      return (
        <span className={`inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-400 ${className}`}>
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
          <span>Approved</span>
        </span>
      );
    case 'sent':
      return (
        <span className={`inline-flex items-center gap-1.5 text-xs font-medium text-indigo-700 dark:text-indigo-400 ${className}`}>
          <Send className="w-3.5 h-3.5 text-indigo-500" />
          <span>Sent</span>
        </span>
      );
    case 'accepted':
      return (
        <span className={`inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-400 ${className}`}>
          <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Accepted</span>
        </span>
      );
    case 'declined':
      return (
        <span className={`inline-flex items-center gap-1.5 text-xs font-medium text-rose-700 dark:text-rose-400 ${className}`}>
          <XCircle className="w-3.5 h-3.5 text-rose-500" />
          <span>Declined</span>
        </span>
      );
    case 'expired':
      return (
        <span className={`inline-flex items-center gap-1.5 text-xs font-medium text-neutral-500 dark:text-neutral-400 ${className}`}>
          <Hourglass className="w-3.5 h-3.5 text-neutral-400" />
          <span>Expired</span>
        </span>
      );
    case 'archived':
      return (
        <span className={`inline-flex items-center gap-1.5 text-xs font-medium text-neutral-400 dark:text-neutral-500 ${className}`}>
          <Archive className="w-3.5 h-3.5 text-neutral-400" />
          <span>Archived</span>
        </span>
      );
    default:
      return (
        <span className={`inline-flex items-center gap-1.5 text-xs font-medium text-neutral-500 ${className}`}>
          <HelpCircle className="w-3.5 h-3.5" />
          <span>{status}</span>
        </span>
      );
  }
};

interface DeliveryStatusBadgeProps {
  status: DeliveryStatus;
  className?: string;
}

export const DeliveryStatusBadge: React.FC<DeliveryStatusBadgeProps> = ({ status, className = '' }) => {
  switch (status) {
    case 'not_sent':
      return (
        <span className={`inline-flex items-center gap-1 text-xs text-neutral-400 ${className}`}>
          <span>Not Sent</span>
        </span>
      );
    case 'queued':
    case 'sending':
      return (
        <span className={`inline-flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 ${className}`}>
          <Clock className="w-3 h-3 text-blue-500" />
          <span>Sending</span>
        </span>
      );
    case 'provider_accepted':
      return (
        <span className={`inline-flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400 ${className}`}>
          <CheckCircle2 className="w-3 h-3 text-indigo-500" />
          <span>Dispatched</span>
        </span>
      );
    case 'delivered':
      return (
        <span className={`inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 ${className}`}>
          <CheckCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>Delivered</span>
        </span>
      );
    case 'failed':
      return (
        <span className={`inline-flex items-center gap-1 text-xs text-rose-600 dark:text-rose-400 font-medium ${className}`}>
          <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
          <span>Delivery Failed</span>
        </span>
      );
    default:
      return (
        <span className={`inline-flex items-center gap-1 text-xs text-neutral-400 ${className}`}>
          <span>{status}</span>
        </span>
      );
  }
};
