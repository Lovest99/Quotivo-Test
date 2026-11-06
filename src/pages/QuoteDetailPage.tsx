import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { StorageService } from '../services/storage';
import { Quote } from '../types';
import { QuoteStatusBadge, DeliveryStatusBadge } from '../components/ui/StatusBadges';
import { CurrencyAmount } from '../components/ui/CurrencyAmount';
import { QuoteDocument } from '../components/quote/QuoteDocument';
import { ActivityTimeline } from '../components/quote/ActivityTimeline';
import { VersionList } from '../components/quote/VersionList';
import { SendQuoteModal } from '../components/quote/SendQuoteModal';
import { formatDate, formatDateTime } from '../utils/formatters';
import {
  ArrowLeft,
  Edit,
  Eye,
  Send,
  CheckCircle2,
  XCircle,
  FileText,
  History,
  CheckSquare,
  Clock,
  Mail,
  User,
  ShieldCheck,
  Download,
  ChevronDown,
} from 'lucide-react';

export const QuoteDetailPage: React.FC = () => {
  const { quoteId } = useParams<{ quoteId: string }>();
  const navigate = useNavigate();
  const { currentUser, customers, business, templates, activities, showToast, refreshQuotes } = useApp();

  const [quote, setQuote] = useState<Quote | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'document' | 'activity' | 'versions' | 'delivery'>('overview');
  const [isSendModalOpen, setIsSendModalOpen] = useState(false);

  // Manual Customer Response Recording State
  const [isRecordingResponse, setIsRecordingResponse] = useState(false);
  const [responseStatus, setResponseStatus] = useState<'accepted' | 'declined'>('accepted');
  const [responseNote, setResponseNote] = useState('');

  useEffect(() => {
    if (!quoteId) return;
    const found = StorageService.getQuoteById(quoteId);
    if (found) {
      setQuote(found);
    } else {
      showToast('Quotation not found', 'error');
      navigate('/app/quotes');
    }
  }, [quoteId, navigate, showToast]);

  if (!quote) {
    return <div className="p-8 text-center text-xs text-neutral-500">Loading quotation details...</div>;
  }

  const customer = customers.find((c) => c.id === quote.customerId);
  const defaultTemplate = templates.find((t) => t.isDefault) || templates[0];
  const quoteActivities = activities.filter((a) => a.quoteId === quote.id);

  const canApprove = currentUser.role === 'owner' || currentUser.role === 'approver';
  const isApproved = quote.status === 'approved';
  const isAwaiting = quote.status === 'awaiting_approval';

  const handleRecordResponse = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = StorageService.recordCustomerResponse(
      quote.id,
      responseStatus,
      responseNote,
      currentUser
    );
    if (updated) {
      setQuote(updated);
      refreshQuotes();
      setIsRecordingResponse(false);
      setResponseNote('');
      showToast(`Customer response manually recorded as ${responseStatus.toUpperCase()}`, 'success');
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Sticky Top Header: Single-line on mobile, Zero Overlapping */}
      <div className="sticky top-14 z-20 -mx-4 sm:-mx-6 lg:-mx-8 -mt-4 sm:-mt-6 lg:-mt-8 px-4 sm:px-6 lg:px-8 py-2 sm:py-2.5 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md border-b border-neutral-200/90 dark:border-neutral-800 shadow-2xs">
        <div className="flex items-center justify-between gap-2">
          {/* Left: Back + Number + Status + Rev */}
          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
            <Link
              to="/app/quotes"
              className="p-1 text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors shrink-0"
              title="Back to quotes"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>

            <span className="font-mono font-bold text-xs sm:text-base text-neutral-900 dark:text-neutral-100 shrink-0">
              {quote.quoteNumber}
            </span>
            <QuoteStatusBadge status={quote.status} />
            <span className="font-mono text-[10px] sm:text-xs font-semibold px-1 sm:px-1.5 py-0.2 sm:py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 shrink-0">
              Rev {quote.currentRevision}
            </span>
          </div>

          {/* Right: Mobile View Selector (< sm) + Actions */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Mobile View Selector: Compact inline dropdown */}
            <div className="sm:hidden relative">
              <select
                value={activeTab}
                onChange={(e) => setActiveTab(e.target.value as any)}
                aria-label="Select quotation detail view"
                className="text-[11px] font-medium text-neutral-700 dark:text-neutral-200 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-md pl-2 pr-5 py-1 focus:outline-hidden appearance-none cursor-pointer"
              >
                <option value="overview">Overview</option>
                <option value="document">Document</option>
                <option value="activity">Timeline</option>
                <option value="versions">Versions (R{quote.currentRevision})</option>
                <option value="delivery">Delivery</option>
              </select>
              <ChevronDown className="w-3 h-3 text-neutral-400 absolute right-1.5 top-2 pointer-events-none" />
            </div>

            <Link
              to={`/app/quotes/${quote.id}/edit`}
              className="inline-flex items-center gap-1 px-2.5 py-1 bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 rounded-md text-xs font-semibold hover:bg-neutral-800 dark:hover:bg-white shadow-2xs transition-colors"
            >
              <Edit className="w-3 h-3" />
              <span>Edit</span>
            </Link>

            <Link
              to={`/app/quotes/${quote.id}/preview`}
              className="inline-flex items-center gap-1 px-2.5 py-1 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 rounded-md text-xs font-medium shadow-2xs transition-colors"
            >
              <Download className="w-3 h-3" />
              <span className="hidden xs:inline">PDF</span>
            </Link>

            {isApproved && (
              <button
                type="button"
                onClick={() => setIsSendModalOpen(true)}
                className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-semibold shadow-2xs cursor-pointer transition-colors"
              >
                <Send className="w-3 h-3" />
                <span className="hidden sm:inline">Send</span>
              </button>
            )}

            {isAwaiting && canApprove && (
              <Link
                to={`/app/quotes/${quote.id}/edit`}
                className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-xs font-semibold shadow-2xs transition-colors"
              >
                <CheckSquare className="w-3 h-3" />
                <span className="hidden sm:inline">Sign Off</span>
              </Link>
            )}
          </div>
        </div>

        {/* Desktop Tabs Navigation (>= sm) */}
        <div className="hidden sm:flex items-center gap-1 overflow-x-auto text-xs pt-2 mt-1.5 border-t border-neutral-100 dark:border-neutral-800/80 no-scrollbar">
          {[
            { key: 'overview', label: 'Overview' },
            { key: 'document', label: 'Document View' },
            { key: 'activity', label: 'Activity Timeline' },
            { key: 'versions', label: `Version History (Rev ${quote.currentRevision})` },
            { key: 'delivery', label: 'Delivery Records' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-3 py-1 rounded-md font-medium transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === tab.key
                  ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 font-semibold shadow-2xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Subtitle / Customer Info Banner: In natural flow, never overlapping */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1 text-xs">
        <p className="text-xs text-neutral-500 truncate max-w-xl">
          {quote.title} · Client: <strong className="text-neutral-800 dark:text-neutral-200">{customer?.name}</strong>
        </p>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 spans: Scope, Items list, Details */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-5 space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                Scope of Works
              </h3>
              <p className="text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed font-mono bg-neutral-50 dark:bg-neutral-800/60 p-3 rounded-lg border border-neutral-100 dark:border-neutral-800">
                {quote.scopeSummary}
              </p>
            </div>

            {/* Line items brief */}
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                  Scheduled Trade Items ({quote.lineItems.length})
                </h3>
                <Link to={`/app/quotes/${quote.id}/edit`} className="text-xs text-blue-600 hover:underline">
                  Edit Items
                </Link>
              </div>

              {/* Desktop Table View (>= sm) */}
              <div className="hidden sm:block border border-neutral-100 dark:border-neutral-800 rounded-lg overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-neutral-50 dark:bg-neutral-800/60 border-b border-neutral-200 dark:border-neutral-800 text-neutral-500">
                    <tr>
                      <th className="p-2.5">Item Name</th>
                      <th className="p-2.5 text-right">Quantity</th>
                      <th className="p-2.5 text-right">Unit Rate</th>
                      <th className="p-2.5 text-right">Line Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                    {quote.lineItems.map((item) => (
                      <tr key={item.id}>
                        <td className="p-2.5">
                          <span className="font-semibold text-neutral-900 dark:text-neutral-100 block">
                            {item.name}
                          </span>
                          <span className="text-[11px] text-neutral-500 block truncate max-w-sm">
                            {item.description}
                          </span>
                        </td>
                        <td className="p-2.5 text-right font-mono tabular-nums text-neutral-600 dark:text-neutral-400">
                          {item.quantity} {item.unit}
                        </td>
                        <td className="p-2.5 text-right font-mono tabular-nums text-neutral-600 dark:text-neutral-400">
                          <CurrencyAmount amount={item.unitPrice} currency={quote.currency} />
                        </td>
                        <td className="p-2.5 text-right font-mono tabular-nums font-semibold text-neutral-900 dark:text-neutral-100">
                          <CurrencyAmount amount={item.quantity * item.unitPrice} currency={quote.currency} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards View (< sm): No horizontal table squeeze */}
              <div className="sm:hidden space-y-2">
                {quote.lineItems.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-lg border border-neutral-200/80 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-800/40 space-y-1.5 text-xs shadow-2xs"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-bold text-neutral-900 dark:text-neutral-100">
                        {item.name}
                      </span>
                      <CurrencyAmount
                        amount={item.quantity * item.unitPrice}
                        currency={quote.currency}
                        className="font-bold text-sm text-neutral-900 dark:text-neutral-100 shrink-0"
                      />
                    </div>
                    {item.description && (
                      <p className="text-[11px] text-neutral-500 leading-relaxed">
                        {item.description}
                      </p>
                    )}
                    <div className="flex items-center justify-between pt-1 border-t border-neutral-100 dark:border-neutral-800 text-[11px] text-neutral-500 font-mono">
                      <span>{item.quantity} {item.unit}</span>
                      <span>Rate: <CurrencyAmount amount={item.unitPrice} currency={quote.currency} /></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Commercial terms */}
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-5 space-y-2 text-xs">
              <span className="font-semibold uppercase tracking-wider text-neutral-400 text-[10px]">
                Commercial Payment Terms
              </span>
              <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed bg-neutral-50 dark:bg-neutral-800/40 p-3 rounded-lg border border-neutral-100 dark:border-neutral-800">
                {quote.paymentTerms}
              </p>
            </div>
          </div>

          {/* Right 1 span: Status, Financial Totals, Customer Response Recorder */}
          <div className="space-y-6 lg:sticky lg:top-36">
            {/* Financial Card */}
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-5 space-y-3 text-xs">
              <h3 className="font-semibold uppercase tracking-wider text-neutral-400 text-[10px]">
                Financial Summary
              </h3>

              <div className="space-y-2">
                <div className="flex justify-between text-neutral-500">
                  <span>Subtotal</span>
                  <CurrencyAmount amount={quote.subtotal} currency={quote.currency} />
                </div>
                {quote.discountTotal > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Discounts</span>
                    <span>-<CurrencyAmount amount={quote.discountTotal} currency={quote.currency} /></span>
                  </div>
                )}
                <div className="flex justify-between text-neutral-500">
                  <span>Tax Amount</span>
                  <CurrencyAmount amount={quote.taxTotal} currency={quote.currency} />
                </div>
                <div className="pt-2 border-t border-neutral-200 dark:border-neutral-800 flex justify-between text-sm font-bold text-neutral-900 dark:text-neutral-100">
                  <span>Total Quotation</span>
                  <CurrencyAmount amount={quote.grandTotal} currency={quote.currency} />
                </div>
                {quote.depositAmount && quote.depositAmount > 0 && (
                  <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800 text-[11px] text-neutral-500 flex justify-between">
                    <span>Deposit Due ({quote.depositPercent}%):</span>
                    <CurrencyAmount amount={quote.depositAmount} currency={quote.currency} className="font-semibold text-neutral-800 dark:text-neutral-200" />
                  </div>
                )}
              </div>
            </div>

            {/* Customer Response Section */}
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-5 space-y-3 text-xs">
              <h3 className="font-semibold uppercase tracking-wider text-neutral-400 text-[10px]">
                Customer Decision
              </h3>

              {quote.customerResponse ? (
                <div className="p-3 bg-neutral-50 dark:bg-neutral-800/60 rounded-lg space-y-1">
                  <div className="flex items-center gap-2">
                    {quote.customerResponse.status === 'accepted' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-600" />
                    )}
                    <span className="font-bold text-neutral-900 dark:text-neutral-100 capitalize">
                      Marked {quote.customerResponse.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-500">
                    Recorded on {formatDateTime(quote.customerResponse.recordedAt)} by {quote.customerResponse.recordedBy}
                  </p>
                  {quote.customerResponse.note && (
                    <p className="text-[11px] text-neutral-600 dark:text-neutral-300 italic pt-1">
                      "{quote.customerResponse.note}"
                    </p>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-[11px] text-neutral-500">
                    Record client verbal or signed email acceptance manually for the pilot.
                  </p>
                  {!isRecordingResponse ? (
                    <button
                      type="button"
                      onClick={() => setIsRecordingResponse(true)}
                      className="w-full py-1.5 text-xs font-medium text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-lg transition-colors"
                    >
                      Record Client Response
                    </button>
                  ) : (
                    <form onSubmit={handleRecordResponse} className="space-y-2.5 pt-1">
                      <div className="flex gap-4">
                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <input
                            type="radio"
                            name="respStatus"
                            checked={responseStatus === 'accepted'}
                            onChange={() => setResponseStatus('accepted')}
                          />
                          <span className="text-emerald-700 font-medium">Accepted</span>
                        </label>
                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <input
                            type="radio"
                            name="respStatus"
                            checked={responseStatus === 'declined'}
                            onChange={() => setResponseStatus('declined')}
                          />
                          <span className="text-rose-700 font-medium">Declined</span>
                        </label>
                      </div>

                      <textarea
                        value={responseNote}
                        onChange={(e) => setResponseNote(e.target.value)}
                        placeholder="Add response note (e.g. Signed purchase order received)..."
                        rows={2}
                        className="w-full p-2 border border-neutral-200 dark:border-neutral-700 rounded text-xs bg-neutral-50 dark:bg-neutral-800"
                      />

                      <div className="flex items-center gap-2">
                        <button
                          type="submit"
                          className="flex-1 py-1.5 bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 rounded font-semibold text-xs"
                        >
                          Save Record
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsRecordingResponse(false)}
                          className="px-2.5 py-1.5 text-neutral-500 hover:text-neutral-700 text-xs"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: DOCUMENT VIEW */}
      {activeTab === 'document' && (
        <div className="space-y-4">
          <div className="flex justify-end gap-2">
            <Link
              to={`/app/quotes/${quote.id}/preview`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 rounded-lg hover:bg-neutral-800 transition-colors shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Full Document & Export PDF</span>
            </Link>
          </div>
          <QuoteDocument quote={quote} customer={customer} business={business} template={defaultTemplate} />
        </div>
      )}

      {/* TAB 3: ACTIVITY TIMELINE */}
      {activeTab === 'activity' && (
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-6">
          <ActivityTimeline events={quoteActivities} />
        </div>
      )}

      {/* TAB 4: VERSION HISTORY */}
      {activeTab === 'versions' && (
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-6">
          <VersionList quote={quote} />
        </div>
      )}

      {/* TAB 5: DELIVERY RECORDS */}
      {activeTab === 'delivery' && (
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-6 space-y-4 text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-neutral-100 dark:border-neutral-800">
            <div>
              <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">
                Email Dispatch Records
              </h3>
              <p className="text-[11px] text-neutral-500">
                Immutable records of quotation revisions delivered to clients.
              </p>
            </div>
            {isApproved && (
              <button
                type="button"
                onClick={() => setIsSendModalOpen(true)}
                className="px-3 py-1.5 bg-blue-600 text-white rounded-lg font-medium text-xs"
              >
                Send Revision {quote.currentRevision}
              </button>
            )}
          </div>

          {quote.deliveryHistory && quote.deliveryHistory.length > 0 ? (
            <div className="space-y-3">
              {quote.deliveryHistory.map((del) => (
                <div
                  key={del.id}
                  className="p-3.5 rounded-lg border border-neutral-200 dark:border-neutral-800 space-y-2 bg-neutral-50/50 dark:bg-neutral-800/40"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-neutral-500" />
                      <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                        {del.subject}
                      </span>
                    </div>
                    <DeliveryStatusBadge status={del.status} />
                  </div>

                  <p className="text-[11px] text-neutral-600 dark:text-neutral-400">
                    To: <strong className="font-mono">{del.recipientEmail}</strong> · Revision Attached: Rev {del.revisionNumber}
                  </p>

                  <p className="text-[11px] text-neutral-500">
                    Dispatched on {formatDateTime(del.sentAt)} (Simulated in demo mode)
                  </p>

                  {del.failureReason && (
                    <div className="p-2 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 text-rose-800 text-[11px] rounded">
                      Gateway Error: {del.failureReason}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-neutral-400">
              No emails have been sent for this quotation yet.
            </div>
          )}
        </div>
      )}

      {/* Send Quote Modal */}
      {isSendModalOpen && (
        <SendQuoteModal
          quote={quote}
          customer={customer}
          isOpen={isSendModalOpen}
          onClose={() => setIsSendModalOpen(false)}
          onSentSuccess={() => {
            setIsSendModalOpen(false);
            const reloaded = StorageService.getQuoteById(quote.id);
            if (reloaded) setQuote(reloaded);
          }}
        />
      )}
    </div>
  );
};
