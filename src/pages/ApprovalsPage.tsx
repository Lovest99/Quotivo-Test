import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { StorageService } from '../services/storage';
import { Quote } from '../types';
import { CurrencyAmount } from '../components/ui/CurrencyAmount';
import { QuoteStatusBadge } from '../components/ui/StatusBadges';
import { formatDate } from '../utils/formatters';
import {
  CheckSquare,
  Clock,
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  Eye,
  ShieldCheck,
  Send,
  Lock,
  X,
  FileText,
  ChevronRight,
} from 'lucide-react';

export const ApprovalsPage: React.FC = () => {
  const { quotes, customers, currentUser, refreshQuotes, showToast } = useApp();

  const [activeTab, setActiveTab] = useState<'pending' | 'changes' | 'approved'>('pending');
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMobileReviewOpen, setIsMobileReviewOpen] = useState(false);

  const canApprove = currentUser.role === 'owner' || currentUser.role === 'approver';

  const pendingQuotes = quotes.filter((q) => q.status === 'awaiting_approval');
  const changesQuotes = quotes.filter((q) => q.status === 'changes_requested');
  const approvedQuotes = quotes.filter((q) => q.status === 'approved' || q.status === 'sent' || q.status === 'accepted');

  const activeList =
    activeTab === 'pending'
      ? pendingQuotes
      : activeTab === 'changes'
      ? changesQuotes
      : approvedQuotes;

  const handleSelectQuote = (quote: Quote) => {
    setSelectedQuote(quote);
    setIsMobileReviewOpen(true);
  };

  const handleApprove = (quote: Quote) => {
    if (!canApprove) {
      showToast('Staff role cannot approve quotations. Switch role in demo banner.', 'error');
      return;
    }
    if (quote.flags.missingPrices) {
      showToast('Cannot approve quotation: One or more line items have missing prices.', 'error');
      return;
    }

    setIsSubmitting(true);
    const result = StorageService.approveRevision(
      quote.id,
      quote.currentRevision,
      currentUser,
      feedbackComment || 'Revision approved from inbox.'
    );
    setIsSubmitting(false);

    if (result.success && result.quote) {
      showToast(`Revision ${quote.currentRevision} approved!`, 'success');
      refreshQuotes();
      setSelectedQuote(null);
      setIsMobileReviewOpen(false);
      setFeedbackComment('');
    } else {
      showToast(result.error || 'Approval failed', 'error');
    }
  };

  const handleRequestChanges = (quote: Quote) => {
    if (!feedbackComment || feedbackComment.trim().length < 5) {
      showToast('Please provide specific feedback comments for the estimator.', 'warning');
      return;
    }

    setIsSubmitting(true);
    const result = StorageService.requestChanges(
      quote.id,
      quote.currentRevision,
      currentUser,
      feedbackComment
    );
    setIsSubmitting(false);

    if (result.success && result.quote) {
      showToast('Changes requested and author notified.', 'info');
      refreshQuotes();
      setSelectedQuote(null);
      setIsMobileReviewOpen(false);
      setFeedbackComment('');
    } else {
      showToast(result.error || 'Could not request changes', 'error');
    }
  };

  return (
    <div className="p-3 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-4 sm:space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 pb-3 sm:pb-4 border-b border-neutral-200 dark:border-neutral-800">
        <div>
          <h1 className="text-lg sm:text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-blue-600" />
            <span>Approvals & Governance</span>
          </h1>
          <p className="text-[11px] sm:text-xs text-neutral-500 mt-0.5">
            Review submitted quotations, verify commercial rates, and sign off revisions.
          </p>
        </div>

        {/* Role permission indicator */}
        <div className="flex items-center gap-1.5 text-xs shrink-0">
          <span className="font-semibold uppercase tracking-wider text-[10px] px-2 py-0.5 rounded bg-neutral-200 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200">
            {currentUser.role}
          </span>
          {!canApprove && (
            <span className="text-amber-600 dark:text-amber-400 text-[11px] font-medium hidden sm:inline">
              (View Only)
            </span>
          )}
        </div>
      </div>

      {/* Tabs: Grid 3-cols on mobile so ZERO horizontal scroll */}
      <div className="grid grid-cols-3 gap-1 sm:flex sm:items-center sm:gap-1.5 text-xs text-center">
        <button
          onClick={() => {
            setActiveTab('pending');
            setSelectedQuote(null);
          }}
          className={`py-1.5 px-1 sm:px-3 rounded-lg font-medium flex items-center justify-center gap-1 transition-colors cursor-pointer truncate ${
            activeTab === 'pending'
              ? 'bg-blue-600 text-white font-semibold shadow-2xs'
              : 'bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 hover:text-neutral-900'
          }`}
        >
          <span className="truncate">Pending</span>
          <span
            className={`font-mono text-[10px] px-1.5 py-0.2 rounded-full font-bold shrink-0 ${
              activeTab === 'pending'
                ? 'bg-white/20 text-white'
                : 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
            }`}
          >
            {pendingQuotes.length}
          </span>
        </button>

        <button
          onClick={() => {
            setActiveTab('changes');
            setSelectedQuote(null);
          }}
          className={`py-1.5 px-1 sm:px-3 rounded-lg font-medium flex items-center justify-center gap-1 transition-colors cursor-pointer truncate ${
            activeTab === 'changes'
              ? 'bg-blue-600 text-white font-semibold shadow-2xs'
              : 'bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 hover:text-neutral-900'
          }`}
        >
          <span className="truncate">Changes</span>
          <span
            className={`font-mono text-[10px] px-1.5 py-0.2 rounded-full font-bold shrink-0 ${
              activeTab === 'changes'
                ? 'bg-white/20 text-white'
                : 'bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-300'
            }`}
          >
            {changesQuotes.length}
          </span>
        </button>

        <button
          onClick={() => {
            setActiveTab('approved');
            setSelectedQuote(null);
          }}
          className={`py-1.5 px-1 sm:px-3 rounded-lg font-medium flex items-center justify-center gap-1 transition-colors cursor-pointer truncate ${
            activeTab === 'approved'
              ? 'bg-blue-600 text-white font-semibold shadow-2xs'
              : 'bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 hover:text-neutral-900'
          }`}
        >
          <span className="truncate">Approved</span>
          <span
            className={`font-mono text-[10px] px-1.5 py-0.2 rounded-full font-bold shrink-0 ${
              activeTab === 'approved'
                ? 'bg-white/20 text-white'
                : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
            }`}
          >
            {approvedQuotes.length}
          </span>
        </button>
      </div>

      {/* Main Grid: Inbox list + Review detail pane (desktop) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Quotes List */}
        <div className="lg:col-span-2 space-y-2.5">
          {activeList.map((q) => {
            const cust = customers.find((c) => c.id === q.customerId);
            const isSelected = selectedQuote?.id === q.id;

            return (
              <div
                key={q.id}
                onClick={() => handleSelectQuote(q)}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all shadow-2xs ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50/20 dark:bg-blue-950/20 ring-1 ring-blue-600'
                    : 'border-neutral-200/90 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:border-neutral-300'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-bold text-xs text-blue-600 dark:text-blue-400">
                        {q.quoteNumber}
                      </span>
                      <QuoteStatusBadge status={q.status} />
                      <span className="font-mono text-[10px] font-semibold text-neutral-400">
                        Rev {q.currentRevision}
                      </span>
                    </div>
                    <p className="font-semibold text-neutral-900 dark:text-neutral-100 text-xs mt-1 truncate">
                      {q.title}
                    </p>
                    <p className="text-[11px] text-neutral-500 truncate">
                      Client: {cust?.companyName || cust?.name} · By {q.createdByName}
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <CurrencyAmount
                      amount={q.grandTotal}
                      currency={q.currency}
                      className="text-sm font-bold text-neutral-900 dark:text-neutral-100 block"
                    />
                    <span className="text-[10px] text-neutral-400 block font-mono">
                      {q.lineItems.length} items
                    </span>
                  </div>
                </div>

                {q.flags.missingPrices && (
                  <div className="mt-2.5 p-2 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded text-rose-800 dark:text-rose-200 text-[11px] flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                    <span>Missing line prices: Must be priced by estimator before sign-off.</span>
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 mt-2 border-t border-neutral-100 dark:border-neutral-800/80 text-[11px] text-neutral-500">
                  <span>Issued: {formatDate(q.issueDate)}</span>
                  <span className="text-blue-600 dark:text-blue-400 font-medium inline-flex items-center gap-0.5 lg:hidden">
                    Review Revision <ChevronRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            );
          })}

          {activeList.length === 0 && (
            <div className="py-12 text-center text-xs text-neutral-500 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-8 shadow-2xs">
              No quotations currently in this queue.
            </div>
          )}
        </div>

        {/* Right 1 span: Review Drawer on Desktop */}
        <div className="hidden lg:block space-y-4 sticky top-28">
          {selectedQuote ? (
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-5 space-y-4 text-xs shadow-2xs">
              <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3">
                <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">
                  Revision Review & Action
                </h3>
                <span className="font-mono font-bold text-blue-600">
                  Rev {selectedQuote.currentRevision}
                </span>
              </div>

              <div className="space-y-2">
                <p className="font-semibold text-neutral-900 dark:text-neutral-100">
                  {selectedQuote.title}
                </p>
                <p className="text-[11px] text-neutral-600 dark:text-neutral-400 leading-relaxed bg-neutral-50 dark:bg-neutral-800 p-2.5 rounded border border-neutral-100 dark:border-neutral-800">
                  {selectedQuote.scopeSummary}
                </p>
              </div>

              <div className="border-t border-neutral-100 dark:border-neutral-800 pt-3 space-y-1.5">
                <div className="flex justify-between text-neutral-500">
                  <span>Items Count:</span>
                  <span className="font-mono">{selectedQuote.lineItems.length}</span>
                </div>
                <div className="flex justify-between text-neutral-500">
                  <span>Subtotal:</span>
                  <CurrencyAmount amount={selectedQuote.subtotal} currency={selectedQuote.currency} />
                </div>
                <div className="flex justify-between font-bold text-neutral-900 dark:text-neutral-100 text-sm pt-1">
                  <span>Grand Total:</span>
                  <CurrencyAmount amount={selectedQuote.grandTotal} currency={selectedQuote.currency} />
                </div>
              </div>

              {canApprove && selectedQuote.status === 'awaiting_approval' && (
                <div className="space-y-1.5 pt-2">
                  <label className="font-medium text-neutral-700 dark:text-neutral-300 block">
                    Reviewer Notes / Feedback:
                  </label>
                  <textarea
                    value={feedbackComment}
                    onChange={(e) => setFeedbackComment(e.target.value)}
                    rows={3}
                    placeholder="Enter approval notes or required revisions..."
                    className="w-full p-2 border border-neutral-200 dark:border-neutral-700 rounded-lg text-xs bg-neutral-50 dark:bg-neutral-800"
                  />
                </div>
              )}

              <div className="space-y-2 pt-2">
                {canApprove && selectedQuote.status === 'awaiting_approval' && (
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      disabled={isSubmitting || selectedQuote.flags.missingPrices}
                      onClick={() => handleApprove(selectedQuote)}
                      className="py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-lg font-semibold text-xs shadow-xs cursor-pointer"
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={() => handleRequestChanges(selectedQuote)}
                      className="py-2 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 text-neutral-800 dark:text-neutral-200 rounded-lg font-semibold text-xs border border-neutral-200 dark:border-neutral-700 cursor-pointer"
                    >
                      Request Changes
                    </button>
                  </div>
                )}

                <Link
                  to={`/app/quotes/${selectedQuote.id}/edit`}
                  className="w-full py-2 bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-neutral-100 dark:text-neutral-900 rounded-lg font-semibold text-xs text-center block"
                >
                  Open Full Editor
                </Link>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-6 text-center text-xs text-neutral-400">
              Select a quotation from the list to review details and take approval action.
            </div>
          )}
        </div>
      </div>

      {/* Mobile Slide-Up Review Modal Drawer */}
      {isMobileReviewOpen && selectedQuote && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/50 backdrop-blur-xs lg:hidden animate-in fade-in duration-150">
          <div className="flex-1" onClick={() => setIsMobileReviewOpen(false)} />
          <div className="bg-white dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-800 rounded-t-2xl p-5 shadow-2xl space-y-4 animate-in slide-in-from-bottom duration-200 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-100 dark:border-neutral-800">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-sm text-neutral-900 dark:text-neutral-100">
                  {selectedQuote.quoteNumber} (Rev {selectedQuote.currentRevision})
                </span>
                <QuoteStatusBadge status={selectedQuote.status} />
              </div>
              <button
                onClick={() => setIsMobileReviewOpen(false)}
                className="p-1 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1">
              <h4 className="font-bold text-neutral-900 dark:text-neutral-100 text-xs">
                {selectedQuote.title}
              </h4>
              <p className="text-[11px] text-neutral-600 dark:text-neutral-400 bg-neutral-50 dark:bg-neutral-800 p-2.5 rounded border border-neutral-100 dark:border-neutral-800">
                {selectedQuote.scopeSummary}
              </p>
            </div>

            <div className="border-t border-neutral-100 dark:border-neutral-800 pt-2.5 space-y-1 text-xs">
              <div className="flex justify-between text-neutral-500">
                <span>Items:</span>
                <span className="font-mono">{selectedQuote.lineItems.length} items</span>
              </div>
              <div className="flex justify-between font-bold text-neutral-900 dark:text-neutral-100 text-sm pt-1">
                <span>Total Value:</span>
                <CurrencyAmount amount={selectedQuote.grandTotal} currency={selectedQuote.currency} />
              </div>
            </div>

            {canApprove && selectedQuote.status === 'awaiting_approval' && (
              <div className="space-y-1.5 pt-1 text-xs">
                <label className="font-medium text-neutral-700 dark:text-neutral-300 block">
                  Reviewer Notes:
                </label>
                <textarea
                  value={feedbackComment}
                  onChange={(e) => setFeedbackComment(e.target.value)}
                  rows={2}
                  placeholder="Notes for the estimator..."
                  className="w-full p-2 border border-neutral-200 dark:border-neutral-700 rounded-lg text-xs bg-neutral-50 dark:bg-neutral-800"
                />
              </div>
            )}

            <div className="space-y-2 pt-2">
              {canApprove && selectedQuote.status === 'awaiting_approval' && (
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    disabled={isSubmitting || selectedQuote.flags.missingPrices}
                    onClick={() => handleApprove(selectedQuote)}
                    className="py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-lg font-semibold text-xs shadow-xs"
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => handleRequestChanges(selectedQuote)}
                    className="py-2.5 bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 rounded-lg font-semibold text-xs border border-neutral-200 dark:border-neutral-700"
                  >
                    Request Changes
                  </button>
                </div>
              )}

              <Link
                to={`/app/quotes/${selectedQuote.id}/edit`}
                className="w-full py-2.5 bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 rounded-lg font-semibold text-xs text-center block"
              >
                Open Full Editor
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
