import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { StorageService } from '../services/storage';
import { Quote, QuoteLineItem } from '../types';
import { QuoteStatusBadge } from '../components/ui/StatusBadges';
import { CurrencyAmount } from '../components/ui/CurrencyAmount';
import { QuoteItemsEditor } from '../components/quote/QuoteItemsEditor';
import { QuoteTotals } from '../components/quote/QuoteTotals';
import { ApprovalPanel } from '../components/quote/ApprovalPanel';
import { SendQuoteModal } from '../components/quote/SendQuoteModal';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { quoteAdapter } from '../services/quoteAdapter';
import {
  Save,
  Eye,
  Send,
  Copy,
  Archive,
  ArrowLeft,
  Wand2,
  AlertTriangle,
  Clock,
  ShieldAlert,
  HelpCircle,
  Check,
  X,
  Calendar,
  Lock,
  MoreVertical,
  Layers,
  FileText,
  DollarSign,
  ShieldCheck,
  CheckSquare,
  Edit2,
  ChevronDown,
} from 'lucide-react';

export const QuoteEditorPage: React.FC = () => {
  const { quoteId } = useParams<{ quoteId: string }>();
  const navigate = useNavigate();
  const { currentUser, customers, business, saveQuote, showToast, refreshQuotes } = useApp();

  const [quote, setQuote] = useState<Quote | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSendModalOpen, setIsSendModalOpen] = useState(false);
  const [isArchiveConfirmOpen, setIsArchiveConfirmOpen] = useState(false);
  const [isActionsDropdownOpen, setIsActionsDropdownOpen] = useState(false);
  const [isMetadataDrawerOpen, setIsMetadataDrawerOpen] = useState(false);

  // Mobile active tab: 'items' (default) | 'totals' | 'meta' | 'approval'
  const [mobileTab, setMobileTab] = useState<'items' | 'totals' | 'meta' | 'approval'>('items');

  // AI Scope Clarifier state
  const [isClarifyingScope, setIsClarifyingScope] = useState(false);
  const [scopeProposal, setScopeProposal] = useState<{
    clarifiedScope: string;
    suggestions: string[];
  } | null>(null);

  // Load quote on mount
  useEffect(() => {
    if (!quoteId) return;
    const found = StorageService.getQuoteById(quoteId);
    if (found) {
      setQuote(JSON.parse(JSON.stringify(found)));
    } else {
      showToast('Quotation not found', 'error');
      navigate('/app/quotes');
    }
  }, [quoteId, navigate, showToast]);

  if (!quote) {
    return (
      <div className="p-8 text-center text-xs text-neutral-500">
        Loading quotation editor...
      </div>
    );
  }

  const customer = customers.find((c) => c.id === quote.customerId);
  const isApproved = quote.status === 'approved';
  const isSent = quote.status === 'sent';
  const isProtectedRevision = isApproved || isSent || quote.status === 'accepted';

  // Field change handler: Automatically handles snapshot protection for approved/sent revisions
  const handleUpdateQuote = (updates: Partial<Quote>) => {
    let activeQuote = { ...quote, ...updates };

    if (isProtectedRevision) {
      activeQuote = StorageService.startNewRevisionIfProtected(
        activeQuote,
        currentUser,
        'Field update on approved quotation'
      );
      showToast(
        `Editing approved quotation created new draft Revision ${activeQuote.currentRevision}`,
        'info'
      );
    }

    setQuote(activeQuote);
    setHasUnsavedChanges(true);
  };

  const handleItemsChange = (newItems: QuoteLineItem[]) => {
    let activeQuote = { ...quote, lineItems: newItems };

    if (isProtectedRevision) {
      activeQuote = StorageService.startNewRevisionIfProtected(
        activeQuote,
        currentUser,
        'Line items modified'
      );
      showToast(
        `Editing approved quotation created new draft Revision ${activeQuote.currentRevision}`,
        'info'
      );
    }

    setQuote(activeQuote);
    setHasUnsavedChanges(true);
  };

  const handleSaveDraft = () => {
    setIsSaving(true);
    const saved = saveQuote(quote);
    setQuote(saved);
    setIsSaving(false);
    setHasUnsavedChanges(false);
    showToast(`Quotation ${saved.quoteNumber} (Rev ${saved.currentRevision}) saved`, 'success');
  };

  const handleDuplicate = () => {
    const defaults = StorageService.getQuoteDefaults();
    const newNumber = `${defaults.quoteNumberPrefix}${String(defaults.nextNumberSequence).padStart(4, '0')}`;
    defaults.nextNumberSequence += 1;
    StorageService.updateQuoteDefaults(defaults);

    const duplicate: Quote = {
      ...JSON.parse(JSON.stringify(quote)),
      id: `q_${Date.now()}`,
      quoteNumber: newNumber,
      title: `${quote.title} (Duplicate)`,
      currentRevision: 1,
      status: 'draft',
      deliveryStatus: 'not_sent',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      revisions: [],
      approvalHistory: [],
      changeRequests: [],
      deliveryHistory: [],
    };

    saveQuote(duplicate);
    showToast(`Created duplicate quotation ${newNumber}`, 'success');
    navigate(`/app/quotes/${duplicate.id}/edit`);
  };

  const handleArchive = () => {
    const updated: Quote = {
      ...quote,
      status: 'archived',
    };
    saveQuote(updated);
    refreshQuotes();
    showToast(`Quotation ${quote.quoteNumber} archived`, 'info');
    navigate('/app/quotes');
  };

  // AI Scope Clarifier trigger
  const handleTriggerClarifyScope = async () => {
    setIsClarifyingScope(true);
    try {
      const res = await quoteAdapter.clarifyScope(quote.scopeSummary, StorageService.getCatalogue());
      setScopeProposal(res);
    } catch {
      showToast('Could not analyze scope', 'error');
    } finally {
      setIsClarifyingScope(false);
    }
  };

  return (
    <div className="p-3 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-4 sm:space-y-6 animate-in fade-in duration-200">
      {/* Sticky Top Action Bar */}
      {/* Sticky Top Header: Crisp Single-Line, Zero 2-line bloat, Zero clipping */}
      <div className="sticky top-14 z-20 -mx-3 sm:-mx-6 lg:-mx-8 -mt-3 sm:-mt-6 lg:-mt-8 px-3 sm:px-6 lg:px-8 py-2 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md border-b border-neutral-200/90 dark:border-neutral-800 shadow-2xs">
        <div className="flex items-center justify-between gap-1.5 sm:gap-2">
          {/* Left: Back + Number + Status + Rev */}
          <div className="flex items-center gap-1.5 min-w-0">
            <Link
              to="/app/quotes"
              className="p-1 text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors shrink-0"
              title="Back to quotes"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>

            <span className="font-mono font-bold text-xs sm:text-sm text-neutral-900 dark:text-neutral-100 shrink-0">
              {quote.quoteNumber}
            </span>
            <QuoteStatusBadge status={quote.status} />
            <span className="font-mono text-[10px] font-semibold px-1 py-0.2 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 shrink-0">
              R{quote.currentRevision}
            </span>
            <span className="hidden xl:inline font-mono text-xs font-bold text-neutral-800 dark:text-neutral-200 ml-1 truncate">
              · <CurrencyAmount amount={quote.grandTotal} currency={quote.currency} />
            </span>
          </div>

          {/* Right: Section Selector (< lg) + Save + Preview + Actions */}
          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
            {/* Mobile Section Selector (< lg): Compact inline dropdown right in the header bar */}
            <div className="lg:hidden relative">
              <select
                value={mobileTab}
                onChange={(e) => setMobileTab(e.target.value as any)}
                aria-label="Select section"
                className="text-[11px] font-medium text-neutral-700 dark:text-neutral-200 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-md pl-2 pr-5 py-1 focus:outline-hidden appearance-none cursor-pointer"
              >
                <option value="items">Schedule ({quote.lineItems.length})</option>
                <option value="totals">Totals</option>
                <option value="approval">Sign-Off</option>
                <option value="meta">Details</option>
              </select>
              <ChevronDown className="w-3 h-3 text-neutral-400 absolute right-1.5 top-2 pointer-events-none" />
            </div>

            {hasUnsavedChanges && (
              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-amber-600 dark:text-amber-400 font-medium mr-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                <span>Unsaved</span>
              </span>
            )}

            <button
              type="button"
              onClick={handleSaveDraft}
              disabled={isSaving}
              className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-1 bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 rounded-md text-xs font-semibold hover:bg-neutral-800 dark:hover:bg-white active:scale-95 transition-all cursor-pointer shadow-2xs"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save</span>
            </button>

            <Link
              to={`/app/quotes/${quote.id}/preview`}
              className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 rounded-md text-xs font-medium shadow-2xs"
            >
              <Eye className="w-3.5 h-3.5 text-neutral-400" />
              <span>Preview</span>
            </Link>

            {/* More Actions Dropdown Menu */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsActionsDropdownOpen(!isActionsDropdownOpen)}
                className="p-1 sm:p-1.5 text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 rounded-md border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 cursor-pointer shadow-2xs"
                aria-label="More quote options"
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {isActionsDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsActionsDropdownOpen(false)}
                  />
                  <div className="absolute right-0 mt-1.5 w-48 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-xl py-1 z-50 text-xs animate-in fade-in zoom-in-95 duration-150">
                    <Link
                      to={`/app/quotes/${quote.id}/preview`}
                      onClick={() => setIsActionsDropdownOpen(false)}
                      className="flex items-center gap-2 px-3.5 py-2 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800"
                    >
                      <Eye className="w-3.5 h-3.5 text-neutral-400" />
                      <span>Preview & Print PDF</span>
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        setIsActionsDropdownOpen(false);
                        setIsSendModalOpen(true);
                      }}
                      className="w-full flex items-center gap-2 px-3.5 py-2 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-left cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5 text-blue-600" />
                      <span>Send via n8n / Email</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsActionsDropdownOpen(false);
                        setIsMetadataDrawerOpen(true);
                      }}
                      className="w-full flex items-center gap-2 px-3.5 py-2 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-left cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-neutral-400" />
                      <span>Edit Dates & Currency</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsActionsDropdownOpen(false);
                        handleDuplicate();
                      }}
                      className="w-full flex items-center gap-2 px-3.5 py-2 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-left cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5 text-neutral-400" />
                      <span>Duplicate Quotation</span>
                    </button>
                    <div className="border-t border-neutral-100 dark:border-neutral-800 my-1" />
                    <button
                      type="button"
                      onClick={() => {
                        setIsActionsDropdownOpen(false);
                        setIsArchiveConfirmOpen(true);
                      }}
                      className="w-full flex items-center gap-2 px-3.5 py-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-left cursor-pointer"
                    >
                      <Archive className="w-3.5 h-3.5" />
                      <span>Archive Quotation</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Revision Lock Alert banner if approved/sent */}
      {isProtectedRevision && (
        <div className="p-3 bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl text-xs flex items-center justify-between gap-3 text-neutral-700 dark:text-neutral-300">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-neutral-500 shrink-0" />
            <span>
              Revision {quote.currentRevision} is <strong>{quote.status.toUpperCase()}</strong>. Modifications create a new draft revision.
            </span>
          </div>
          <Link
            to={`/app/quotes/${quote.id}`}
            className="text-blue-600 dark:text-blue-400 font-medium hover:underline shrink-0"
          >
            History
          </Link>
        </div>
      )}

      {/* Main Layout: Responsive 2-Column on Desktop; Tab-Controlled on Mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left 2 spans: Line Items & Scope */}
        <div className={`lg:col-span-2 space-y-5 ${mobileTab === 'items' ? 'block' : 'hidden lg:block'}`}>
          {/* Quick Scope & Proposal Card */}
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-4 sm:p-5 space-y-3 shadow-2xs">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                  Project Scope & Brief
                </h3>
                <p className="text-[11px] text-neutral-500 mt-0.5 font-medium">
                  Client: {customer?.companyName || customer?.name} · {quote.title}
                </p>
              </div>
              <button
                type="button"
                onClick={handleTriggerClarifyScope}
                disabled={isClarifyingScope}
                className="inline-flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 font-medium hover:underline cursor-pointer"
              >
                <Wand2 className="w-3.5 h-3.5" />
                <span>Clarify Scope</span>
              </button>
            </div>

            {/* AI Scope Clarifier Proposal */}
            {scopeProposal && (
              <div className="p-3.5 bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 rounded-xl space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-blue-900 dark:text-blue-200">
                    Clarified Scope Recommendation:
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        handleUpdateQuote({ scopeSummary: scopeProposal.clarifiedScope });
                        setScopeProposal(null);
                        showToast('Scope summary updated with clarified draft', 'success');
                      }}
                      className="px-2.5 py-1 bg-blue-600 text-white rounded text-[11px] font-medium"
                    >
                      Accept
                    </button>
                    <button
                      type="button"
                      onClick={() => setScopeProposal(null)}
                      className="px-2 py-1 text-neutral-600 dark:text-neutral-400 rounded text-[11px]"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
                <p className="text-[11px] text-neutral-700 dark:text-neutral-300 font-mono leading-relaxed bg-white dark:bg-neutral-900 p-2.5 rounded border border-blue-100 dark:border-blue-900/40">
                  {scopeProposal.clarifiedScope}
                </p>
              </div>
            )}

            <textarea
              value={quote.scopeSummary}
              onChange={(e) => handleUpdateQuote({ scopeSummary: e.target.value })}
              rows={2}
              placeholder="Scope of works description..."
              className="w-full p-2.5 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-neutral-50 dark:bg-neutral-800 leading-relaxed text-xs text-neutral-900 dark:text-neutral-100"
            />
          </div>

          {/* Editable Schedule of Works (Line Items) */}
          <QuoteItemsEditor
            items={quote.lineItems}
            currency={quote.currency}
            onChange={handleItemsChange}
            isEditable={true}
          />
        </div>

        {/* Right 1 span / Mobile Totals Tab: Totals Summary Panel & Approval */}
        <div className={`space-y-5 lg:sticky lg:top-28 ${mobileTab === 'totals' ? 'block' : 'hidden lg:block'}`}>
          <QuoteTotals
            items={quote.lineItems}
            currency={quote.currency}
            depositPercent={quote.depositPercent}
            onDepositPercentChange={(val) => handleUpdateQuote({ depositPercent: val })}
            isEditable={true}
          />

          {/* Payment Terms & Notes in Totals tab on mobile */}
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-4 text-xs space-y-3 shadow-2xs">
            <h4 className="font-semibold uppercase tracking-wider text-neutral-400 text-[10px]">
              Payment Terms & Logistics
            </h4>
            <div>
              <label className="block text-neutral-500 mb-1">Payment Schedule</label>
              <textarea
                value={quote.paymentTerms}
                onChange={(e) => handleUpdateQuote({ paymentTerms: e.target.value })}
                rows={2}
                className="w-full p-2 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-neutral-50 dark:bg-neutral-800 text-xs"
              />
            </div>
            <div>
              <label className="block text-neutral-500 mb-1">General Notes</label>
              <textarea
                value={quote.notes || ''}
                onChange={(e) => handleUpdateQuote({ notes: e.target.value })}
                rows={2}
                placeholder="Site access, delivery conditions..."
                className="w-full p-2 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-neutral-50 dark:bg-neutral-800 text-xs"
              />
            </div>
          </div>
        </div>

        {/* Mobile Sign-Off / Approval Tab (< lg) */}
        <div className={`space-y-5 ${mobileTab === 'approval' ? 'block' : 'hidden lg:block'}`}>
          <ApprovalPanel
            quote={quote}
            currentUser={currentUser}
            onStatusChange={(updated) => {
              setQuote(updated);
              refreshQuotes();
            }}
            onOpenSendModal={() => setIsSendModalOpen(true)}
          />
        </div>

        {/* Mobile Details Tab (< lg) or Metadata Modal Drawer */}
        <div className={`space-y-5 ${mobileTab === 'meta' ? 'block' : 'hidden'}`}>
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-4 sm:p-5 space-y-4 shadow-2xs">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
              Quotation Metadata & Currency
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block mb-1 font-medium text-neutral-700 dark:text-neutral-300">
                  Quotation Title:
                </label>
                <input
                  type="text"
                  value={quote.title}
                  onChange={(e) => handleUpdateQuote({ title: e.target.value })}
                  className="w-full px-3 py-2 text-xs font-semibold border border-neutral-200 dark:border-neutral-700 rounded-lg bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block mb-1 font-medium text-neutral-700 dark:text-neutral-300">
                    Currency:
                  </label>
                  <select
                    value={quote.currency}
                    onChange={(e) => handleUpdateQuote({ currency: e.target.value })}
                    className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-neutral-50 dark:bg-neutral-800 font-mono text-xs"
                  >
                    <option value="PKR">PKR (₨)</option>
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="CAD">CAD (C$)</option>
                    <option value="AUD">AUD (A$)</option>
                  </select>
                </div>

                <div>
                  <label className="block mb-1 font-medium text-neutral-700 dark:text-neutral-300">
                    Date Issued:
                  </label>
                  <input
                    type="date"
                    value={quote.issueDate}
                    onChange={(e) => handleUpdateQuote({ issueDate: e.target.value })}
                    className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-neutral-50 dark:bg-neutral-800 text-xs"
                  />
                </div>

                <div>
                  <label className="block mb-1 font-medium text-neutral-700 dark:text-neutral-300">
                    Valid Until:
                  </label>
                  <input
                    type="date"
                    value={quote.validUntil}
                    onChange={(e) => handleUpdateQuote({ validUntil: e.target.value })}
                    className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-neutral-50 dark:bg-neutral-800 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1 font-medium text-neutral-700 dark:text-neutral-300">
                  Commercial Exclusions:
                </label>
                <input
                  type="text"
                  value={quote.exclusions || ''}
                  onChange={(e) => handleUpdateQuote({ exclusions: e.target.value })}
                  placeholder="e.g. Municipal road permits; electrical re-cabling."
                  className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-neutral-50 dark:bg-neutral-800 text-xs"
                />
              </div>
            </div>

            {/* Customer Details Box */}
            <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800">
              <span className="font-semibold uppercase tracking-wider text-neutral-400 text-[10px]">
                Customer Account
              </span>
              <p className="font-bold text-neutral-900 dark:text-neutral-100 text-xs mt-1">
                {customer?.companyName || customer?.name}
              </p>
              <p className="text-[11px] text-neutral-500">{customer?.email} · {customer?.phone}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Metadata Edit Slide-over Modal / Drawer */}
      {isMetadataDrawerOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="flex-1" onClick={() => setIsMetadataDrawerOpen(false)} />
          <div className="bg-white dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-800 rounded-t-2xl p-5 shadow-2xl space-y-4 animate-in slide-in-from-bottom duration-200 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-100 dark:border-neutral-800">
              <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                Edit Quotation Metadata
              </h3>
              <button
                onClick={() => setIsMetadataDrawerOpen(false)}
                className="p-1 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block mb-1 font-medium text-neutral-700 dark:text-neutral-300">
                  Quotation Title:
                </label>
                <input
                  type="text"
                  value={quote.title}
                  onChange={(e) => handleUpdateQuote({ title: e.target.value })}
                  className="w-full px-3 py-2 text-xs font-semibold border border-neutral-200 dark:border-neutral-700 rounded-lg bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 font-medium text-neutral-700 dark:text-neutral-300">
                    Currency:
                  </label>
                  <select
                    value={quote.currency}
                    onChange={(e) => handleUpdateQuote({ currency: e.target.value })}
                    className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-neutral-50 dark:bg-neutral-800 font-mono text-xs"
                  >
                    <option value="PKR">PKR (₨)</option>
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="CAD">CAD (C$)</option>
                    <option value="AUD">AUD (A$)</option>
                  </select>
                </div>

                <div>
                  <label className="block mb-1 font-medium text-neutral-700 dark:text-neutral-300">
                    Valid Until:
                  </label>
                  <input
                    type="date"
                    value={quote.validUntil}
                    onChange={(e) => handleUpdateQuote({ validUntil: e.target.value })}
                    className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-neutral-50 dark:bg-neutral-800 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1 font-medium text-neutral-700 dark:text-neutral-300">
                  Exclusions:
                </label>
                <input
                  type="text"
                  value={quote.exclusions || ''}
                  onChange={(e) => handleUpdateQuote({ exclusions: e.target.value })}
                  className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-neutral-50 dark:bg-neutral-800 text-xs"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsMetadataDrawerOpen(false)}
              className="w-full py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold shadow-xs"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* Send Modal */}
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

      {/* Archive Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isArchiveConfirmOpen}
        title="Archive Quotation"
        message={`Are you sure you want to archive quotation ${quote.quoteNumber}? It will be hidden from the active pipeline.`}
        confirmLabel="Archive"
        isDestructive={true}
        onConfirm={handleArchive}
        onCancel={() => setIsArchiveConfirmOpen(false)}
      />
    </div>
  );
};
