import React, { useState } from 'react';
import { Quote, UserProfile } from '../../types';
import { StorageService } from '../../services/storage';
import { useApp } from '../../context/AppContext';
import {
  CheckCircle2,
  AlertTriangle,
  MessageSquare,
  Lock,
  Clock,
  ShieldCheck,
  Send,
} from 'lucide-react';

interface ApprovalPanelProps {
  quote: Quote;
  currentUser: UserProfile;
  onStatusChange: (updatedQuote: Quote) => void;
  onOpenSendModal?: () => void;
}

export const ApprovalPanel: React.FC<ApprovalPanelProps> = ({
  quote,
  currentUser,
  onStatusChange,
  onOpenSendModal,
}) => {
  const { showToast } = useApp();
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRequestingChanges, setIsRequestingChanges] = useState(false);

  const canApprove = currentUser.role === 'owner' || currentUser.role === 'approver';
  const hasMissingPrices = quote.flags.missingPrices;
  const isAwaitingApproval = quote.status === 'awaiting_approval';
  const isApproved = quote.status === 'approved';
  const isChangesRequested = quote.status === 'changes_requested';

  const handleApprove = () => {
    if (!canApprove) {
      showToast('Only Owners and Approvers have permission to approve quotations.', 'error');
      return;
    }
    if (hasMissingPrices) {
      showToast('Cannot approve quotation: One or more line items have missing prices.', 'error');
      return;
    }

    setIsSubmitting(true);
    const result = StorageService.approveRevision(
      quote.id,
      quote.currentRevision,
      currentUser,
      comment || 'Revision approved for client dispatch.'
    );

    setIsSubmitting(false);
    if (result.success && result.quote) {
      showToast(`Revision ${quote.currentRevision} successfully approved!`, 'success');
      onStatusChange(result.quote);
      setComment('');
    } else {
      showToast(result.error || 'Approval failed', 'error');
    }
  };

  const handleRequestChanges = () => {
    if (!comment || comment.trim().length < 5) {
      showToast('Please provide a specific comment explaining the requested changes.', 'warning');
      return;
    }

    setIsSubmitting(true);
    const result = StorageService.requestChanges(
      quote.id,
      quote.currentRevision,
      currentUser,
      comment
    );

    setIsSubmitting(false);
    if (result.success && result.quote) {
      showToast('Feedback recorded and quote marked Changes Requested.', 'info');
      onStatusChange(result.quote);
      setIsRequestingChanges(false);
      setComment('');
    } else {
      showToast(result.error || 'Could not request changes', 'error');
    }
  };

  const handleSubmitForApproval = () => {
    if (hasMissingPrices) {
      showToast('Resolve all missing prices before submitting for approval.', 'error');
      return;
    }

    const result = StorageService.submitForApproval(quote.id, currentUser);
    if (result.success && result.quote) {
      showToast(`Quotation ${quote.quoteNumber} submitted for approval`, 'success');
      onStatusChange(result.quote);
    } else {
      showToast(result.error || 'Submission failed', 'error');
    }
  };

  return (
    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-5 space-y-4">
      <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">
            Governance & Approval (Rev {quote.currentRevision})
          </h4>
        </div>
        <span className="text-[11px] font-mono text-neutral-400">
          Role: <strong className="uppercase">{currentUser.role}</strong>
        </span>
      </div>

      {/* State description */}
      {isAwaitingApproval && (
        <div className="p-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 rounded-lg text-xs space-y-1">
          <div className="flex items-center gap-1.5 font-semibold text-blue-900 dark:text-blue-200">
            <Clock className="w-4 h-4 text-blue-600" />
            <span>Awaiting Review for Revision {quote.currentRevision}</span>
          </div>
          <p className="text-blue-700 dark:text-blue-300 text-[11px] leading-relaxed">
            This revision is currently locked in review. An Approver or Owner must review quantities, rates, and terms before sending.
          </p>
        </div>
      )}

      {isChangesRequested && quote.changeRequests && quote.changeRequests.length > 0 && (
        <div className="p-3 bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-900/60 rounded-lg text-xs space-y-1.5">
          <div className="flex items-center gap-1.5 font-semibold text-orange-900 dark:text-orange-200">
            <MessageSquare className="w-4 h-4 text-orange-600" />
            <span>Changes Requested by {quote.changeRequests[quote.changeRequests.length - 1].requestedByName}</span>
          </div>
          <p className="text-orange-800 dark:text-orange-300 text-[11px] font-mono leading-relaxed bg-white/70 dark:bg-neutral-900/70 p-2 rounded border border-orange-200/50 dark:border-orange-900/50">
            "{quote.changeRequests[quote.changeRequests.length - 1].feedback}"
          </p>
        </div>
      )}

      {isApproved && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 rounded-lg text-xs space-y-1">
          <div className="flex items-center gap-1.5 font-semibold text-emerald-900 dark:text-emerald-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Revision {quote.currentRevision} Approved</span>
          </div>
          <p className="text-emerald-700 dark:text-emerald-300 text-[11px] leading-relaxed">
            Approved by {quote.approvalHistory?.[quote.approvalHistory.length - 1]?.approvedByName || 'Authorized Signatory'}. Ready for client issuance.
          </p>
        </div>
      )}

      {/* Role Notice for Staff */}
      {!canApprove && (
        <div className="p-2.5 bg-neutral-50 dark:bg-neutral-800/60 rounded-lg text-neutral-600 dark:text-neutral-400 text-xs flex items-start gap-2">
          <Lock className="w-3.5 h-3.5 text-neutral-400 shrink-0 mt-0.5" />
          <p className="text-[11px]">
            Staff accounts can submit drafts for approval but cannot self-approve. Switch to the <strong>Owner</strong> or <strong>Approver</strong> role in the demo banner above to test approval actions.
          </p>
        </div>
      )}

      {/* Comment Input when Approving or Requesting Changes */}
      {canApprove && (isAwaitingApproval || isChangesRequested) && (
        <div className="space-y-1.5">
          <label className="text-[11px] font-medium text-neutral-600 dark:text-neutral-400 block">
            Reviewer Feedback / Approval Notes:
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={2}
            placeholder="Add verification notes or instructions for the estimator..."
            className="w-full text-xs p-2.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg focus:outline-hidden focus:border-blue-600 text-neutral-900 dark:text-neutral-100"
          />
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col gap-2 pt-1">
        {quote.status === 'draft' || quote.status === 'needs_info' || quote.status === 'changes_requested' ? (
          <button
            type="button"
            disabled={hasMissingPrices}
            onClick={handleSubmitForApproval}
            className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Submit Revision {quote.currentRevision} for Approval</span>
          </button>
        ) : null}

        {canApprove && isAwaitingApproval && (
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              disabled={isSubmitting || hasMissingPrices}
              onClick={handleApprove}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-50 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Approve Rev {quote.currentRevision}</span>
            </button>

            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleRequestChanges}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-700 rounded-lg text-xs font-semibold transition-colors"
            >
              <MessageSquare className="w-3.5 h-3.5 text-orange-600" />
              <span>Request Changes</span>
            </button>
          </div>
        )}

        {isApproved && onOpenSendModal && (
          <button
            type="button"
            onClick={onOpenSendModal}
            className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-neutral-900 hover:bg-neutral-800 active:bg-neutral-950 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send Approved Quotation by Email</span>
          </button>
        )}
      </div>
    </div>
  );
};
