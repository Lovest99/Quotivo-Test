import React, { useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { QuoteStatus, Quote } from '../types';
import { QuoteStatusBadge, DeliveryStatusBadge } from '../components/ui/StatusBadges';
import { CurrencyAmount } from '../components/ui/CurrencyAmount';
import { formatDate } from '../utils/formatters';
import {
  Search,
  Filter,
  Plus,
  Eye,
  Edit,
  Copy,
  Archive,
  ArrowUpDown,
  X,
  FileSpreadsheet,
  Download,
  SlidersHorizontal,
  Check,
  ChevronDown,
} from 'lucide-react';

export const QuotesListPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { quotes, customers, saveQuote, showToast } = useApp();

  const activeTab = searchParams.get('status') || 'all';
  const [searchQuery, setSearchQuery] = useState('');
  const [customerFilter, setCustomerFilter] = useState('all');
  const [currencyFilter, setCurrencyFilter] = useState('all');
  const [deliveryFilter, setDeliveryFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'date_desc' | 'date_asc' | 'total_desc' | 'total_asc'>('date_desc');
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

  const activeFilterCount =
    (customerFilter !== 'all' ? 1 : 0) +
    (currencyFilter !== 'all' ? 1 : 0) +
    (deliveryFilter !== 'all' ? 1 : 0) +
    (sortBy !== 'date_desc' ? 1 : 0);

  const filteredQuotes = useMemo(() => {
    return quotes
      .filter((q) => {
        // Tab status filter
        if (activeTab === 'draft' && q.status !== 'draft' && q.status !== 'needs_info') return false;
        if (activeTab === 'awaiting_approval' && q.status !== 'awaiting_approval') return false;
        if (activeTab === 'sent' && q.status !== 'sent') return false;
        if (activeTab === 'accepted' && q.status !== 'accepted') return false;
        if (activeTab === 'archived' && q.status !== 'archived') return false;
        if (activeTab === 'all' && q.status === 'archived') return false;

        // Search
        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          const cust = customers.find((c) => c.id === q.customerId);
          const matchesQuoteNo = q.quoteNumber.toLowerCase().includes(query);
          const matchesTitle = q.title.toLowerCase().includes(query);
          const matchesCustomer = cust
            ? cust.name.toLowerCase().includes(query) || (cust.companyName && cust.companyName.toLowerCase().includes(query))
            : false;
          if (!matchesQuoteNo && !matchesTitle && !matchesCustomer) return false;
        }

        // Customer filter
        if (customerFilter !== 'all' && q.customerId !== customerFilter) return false;

        // Currency filter
        if (currencyFilter !== 'all' && q.currency !== currencyFilter) return false;

        // Delivery filter
        if (deliveryFilter !== 'all' && q.deliveryStatus !== deliveryFilter) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'date_desc') return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        if (sortBy === 'date_asc') return new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
        if (sortBy === 'total_desc') return b.grandTotal - a.grandTotal;
        if (sortBy === 'total_asc') return a.grandTotal - b.grandTotal;
        return 0;
      });
  }, [quotes, activeTab, searchQuery, customerFilter, currencyFilter, deliveryFilter, sortBy, customers]);

  const handleDuplicate = (quote: Quote) => {
    const duplicate: Quote = {
      ...JSON.parse(JSON.stringify(quote)),
      id: `q_${Date.now()}`,
      quoteNumber: `Q-${Date.now().toString().slice(-4)}`,
      title: `${quote.title} (Copy)`,
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
    showToast(`Quotation duplicated as ${duplicate.quoteNumber}`, 'success');
  };

  const handleArchive = (quote: Quote) => {
    const updated = { ...quote, status: 'archived' as QuoteStatus };
    saveQuote(updated);
    showToast(`Quotation ${quote.quoteNumber} archived`, 'info');
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setCustomerFilter('all');
    setCurrencyFilter('all');
    setDeliveryFilter('all');
    setSortBy('date_desc');
    setSearchParams({});
  };

  return (
    <div className="p-3 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-4 sm:space-y-6 animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="flex items-center justify-between gap-3 pb-1">
        <div>
          <h1 className="text-lg sm:text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
            Commercial Quotations
          </h1>
          <p className="text-[11px] sm:text-xs text-neutral-500 mt-0.5 hidden xs:block">
            {filteredQuotes.length} quotations · revisions, approvals & delivery tracking
          </p>
        </div>

        <Link
          to="/app/requests/new"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-neutral-100 dark:text-neutral-950 dark:hover:bg-white rounded-lg text-xs font-semibold shadow-2xs shrink-0 transition-colors"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>New Quotation</span>
        </Link>
      </div>

      {/* Mobile Status Selector (< sm): Fits screen with ZERO horizontal scroll */}
      <div className="sm:hidden flex items-center justify-between gap-2 p-1 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-xs shadow-2xs">
        <span className="text-[10px] font-bold text-neutral-400 pl-2 uppercase tracking-wider">
          Status:
        </span>
        <div className="relative flex-1">
          <select
            value={activeTab}
            onChange={(e) => {
              if (e.target.value === 'all') setSearchParams({});
              else setSearchParams({ status: e.target.value });
            }}
            aria-label="Filter quotations by status"
            className="w-full text-right font-semibold text-xs text-neutral-900 dark:text-neutral-100 bg-transparent pr-6 py-1 focus:outline-hidden appearance-none cursor-pointer"
          >
            <option value="all">All Active ({quotes.filter((q) => q.status !== 'archived').length})</option>
            <option value="draft">Drafts ({quotes.filter((q) => q.status === 'draft' || q.status === 'needs_info').length})</option>
            <option value="awaiting_approval">Awaiting Approval ({quotes.filter((q) => q.status === 'awaiting_approval').length})</option>
            <option value="sent">Sent ({quotes.filter((q) => q.status === 'sent').length})</option>
            <option value="accepted">Accepted ({quotes.filter((q) => q.status === 'accepted').length})</option>
            <option value="archived">Archived ({quotes.filter((q) => q.status === 'archived').length})</option>
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-neutral-400 absolute right-1.5 top-1.5 pointer-events-none" />
        </div>
      </div>

      {/* Desktop Filter Tabs (>= sm) */}
      <div className="hidden sm:flex items-center gap-1.5 overflow-x-auto text-xs pb-1 no-scrollbar">
        {[
          { key: 'all', label: 'All Active' },
          { key: 'draft', label: 'Drafts' },
          { key: 'awaiting_approval', label: 'Awaiting Approval' },
          { key: 'sent', label: 'Sent' },
          { key: 'accepted', label: 'Accepted' },
          { key: 'archived', label: 'Archived' },
        ].map((tab) => {
          const isSelected = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => {
                if (tab.key === 'all') setSearchParams({});
                else setSearchParams({ status: tab.key });
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer shrink-0 ${
                isSelected
                  ? 'bg-blue-600 text-white font-semibold shadow-2xs'
                  : 'bg-white dark:bg-neutral-800/80 border border-neutral-200/80 dark:border-neutral-700/80 text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-neutral-100'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Search & Filter Trigger Bar */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-neutral-400" />
          <input
            type="text"
            placeholder="Search quote #, client, or title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-2 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-xs text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-2.5 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Mobile Filter Drawer Trigger Button */}
        <button
          onClick={() => setIsFilterDrawerOpen(true)}
          className={`sm:hidden inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-medium transition-colors shrink-0 ${
            activeFilterCount > 0
              ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-300 dark:border-blue-800 text-blue-700 dark:text-blue-300'
              : 'bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300'
          }`}
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>Filters</span>
          {activeFilterCount > 0 && (
            <span className="w-4 h-4 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </button>

        {/* Desktop Inline Filters (>= sm) */}
        <div className="hidden sm:flex items-center gap-2 text-xs">
          <select
            value={customerFilter}
            onChange={(e) => setCustomerFilter(e.target.value)}
            aria-label="Filter by customer"
            className="px-2.5 py-2 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-xs text-neutral-800 dark:text-neutral-200"
          >
            <option value="all">All Customers</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <select
            value={deliveryFilter}
            onChange={(e) => setDeliveryFilter(e.target.value)}
            aria-label="Filter by delivery status"
            className="px-2.5 py-2 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-xs text-neutral-800 dark:text-neutral-200"
          >
            <option value="all">All Deliveries</option>
            <option value="not_sent">Not Sent</option>
            <option value="delivered">Delivered</option>
            <option value="failed">Failed</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            aria-label="Sort quotations"
            className="px-2.5 py-2 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-xs text-neutral-800 dark:text-neutral-200"
          >
            <option value="date_desc">Newest First</option>
            <option value="date_asc">Oldest First</option>
            <option value="total_desc">Highest Total</option>
            <option value="total_asc">Lowest Total</option>
          </select>

          {(searchQuery || activeFilterCount > 0) && (
            <button
              onClick={clearAllFilters}
              className="p-2 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 text-xs flex items-center gap-1 cursor-pointer"
              title="Clear all filters"
            >
              <X className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Bottom Sheet / Modal Drawer on Mobile */}
      {isFilterDrawerOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/50 backdrop-blur-xs sm:hidden animate-in fade-in duration-150">
          <div className="flex-1" onClick={() => setIsFilterDrawerOpen(false)} />
          <div className="bg-white dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-800 rounded-t-2xl p-5 shadow-2xl space-y-4 animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                  Filter & Sort Quotations
                </h3>
              </div>
              <button
                onClick={() => setIsFilterDrawerOpen(false)}
                className="p-1 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="block text-neutral-500 font-medium mb-1">Customer Account</label>
                <select
                  value={customerFilter}
                  onChange={(e) => setCustomerFilter(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-xs text-neutral-900 dark:text-neutral-100"
                >
                  <option value="all">All Customers</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} {c.companyName ? `(${c.companyName})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-neutral-500 font-medium mb-1">Delivery Status</label>
                <select
                  value={deliveryFilter}
                  onChange={(e) => setDeliveryFilter(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-xs text-neutral-900 dark:text-neutral-100"
                >
                  <option value="all">All Delivery Statuses</option>
                  <option value="not_sent">Not Sent</option>
                  <option value="delivered">Delivered via n8n / Email</option>
                  <option value="failed">Delivery Failed</option>
                </select>
              </div>

              <div>
                <label className="block text-neutral-500 font-medium mb-1">Currency</label>
                <select
                  value={currencyFilter}
                  onChange={(e) => setCurrencyFilter(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-xs text-neutral-900 dark:text-neutral-100"
                >
                  <option value="all">All Currencies</option>
                  <option value="PKR">PKR (₨)</option>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="CAD">CAD (C$)</option>
                  <option value="AUD">AUD (A$)</option>
                </select>
              </div>

              <div>
                <label className="block text-neutral-500 font-medium mb-1">Sort Order</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-xs text-neutral-900 dark:text-neutral-100"
                >
                  <option value="date_desc">Newest First</option>
                  <option value="date_asc">Oldest First</option>
                  <option value="total_desc">Highest Total Amount</option>
                  <option value="total_asc">Lowest Total Amount</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-3 border-t border-neutral-100 dark:border-neutral-800">
              <button
                type="button"
                onClick={clearAllFilters}
                className="flex-1 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 text-xs font-medium text-neutral-600 dark:text-neutral-300"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={() => setIsFilterDrawerOpen(false)}
                className="flex-1 py-2 rounded-lg bg-blue-600 text-white text-xs font-semibold shadow-xs"
              >
                Apply Filters ({filteredQuotes.length})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Quotations Table */}
      <div className="hidden lg:block border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-x-auto bg-white dark:bg-neutral-900 shadow-2xs">
        <table className="w-full text-xs text-left border-collapse">
          <thead className="sticky top-0 z-10 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md">
            <tr className="bg-neutral-50/80 dark:bg-neutral-800/60 border-b border-neutral-200 dark:border-neutral-800 text-neutral-500 font-medium">
              <th className="py-2.5 px-3">Quote Number</th>
              <th className="py-2.5 px-3 min-w-[200px]">Customer & Project</th>
              <th className="py-2.5 px-3">Status</th>
              <th className="py-2.5 px-3">Delivery</th>
              <th className="py-2.5 px-3">Issued Date</th>
              <th className="py-2.5 px-3 text-right">Grand Total</th>
              <th className="py-2.5 px-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
            {filteredQuotes.map((q) => {
              const cust = customers.find((c) => c.id === q.customerId);
              return (
                <tr key={q.id} className="hover:bg-neutral-50/60 dark:hover:bg-neutral-800/40 transition-colors">
                  <td className="py-3 px-3">
                    <Link
                      to={`/app/quotes/${q.id}`}
                      className="font-mono font-semibold text-blue-600 dark:text-blue-400 hover:underline block"
                    >
                      {q.quoteNumber}
                    </Link>
                    <span className="text-[10px] text-neutral-400 font-mono">
                      Rev {q.currentRevision}
                    </span>
                  </td>

                  <td className="py-3 px-3">
                    <span className="font-semibold text-neutral-900 dark:text-neutral-100 block">
                      {q.title}
                    </span>
                    <span className="text-[11px] text-neutral-500 block">
                      {cust?.companyName || cust?.name || 'Customer'}
                    </span>
                  </td>

                  <td className="py-3 px-3">
                    <QuoteStatusBadge status={q.status} />
                  </td>

                  <td className="py-3 px-3">
                    <DeliveryStatusBadge status={q.deliveryStatus} />
                  </td>

                  <td className="py-3 px-3 text-neutral-600 dark:text-neutral-400">
                    {formatDate(q.issueDate)}
                  </td>

                  <td className="py-3 px-3 text-right font-mono tabular-nums font-semibold text-neutral-900 dark:text-neutral-100">
                    <CurrencyAmount amount={q.grandTotal} currency={q.currency} />
                  </td>

                  <td className="py-3 px-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        to={`/app/quotes/${q.id}`}
                        className="p-1.5 text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 rounded"
                        title="View details"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </Link>
                      <Link
                        to={`/app/quotes/${q.id}/preview`}
                        className="p-1.5 text-neutral-500 hover:text-blue-600 dark:hover:text-blue-400 rounded"
                        title="Preview & Export PDF"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </Link>
                      <Link
                        to={`/app/quotes/${q.id}/edit`}
                        className="p-1.5 text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 rounded"
                        title="Edit quotation"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleDuplicate(q)}
                        className="p-1.5 text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 rounded cursor-pointer"
                        title="Duplicate"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleArchive(q)}
                        className="p-1.5 text-neutral-500 hover:text-rose-600 rounded cursor-pointer"
                        title="Archive"
                      >
                        <Archive className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Quotation Cards (< lg) */}
      <div className="lg:hidden space-y-2.5">
        {filteredQuotes.map((q) => {
          const cust = customers.find((c) => c.id === q.customerId);
          return (
            <div
              key={q.id}
              className="p-3.5 rounded-xl border border-neutral-200/90 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-2xs space-y-2.5"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <Link
                      to={`/app/quotes/${q.id}`}
                      className="font-mono font-bold text-xs text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      {q.quoteNumber}
                    </Link>
                    <span className="font-mono text-[10px] text-neutral-400 font-medium">
                      Rev {q.currentRevision}
                    </span>
                  </div>
                  <p className="font-semibold text-neutral-900 dark:text-neutral-100 text-xs mt-0.5 truncate">
                    {q.title}
                  </p>
                  <p className="text-[11px] text-neutral-500 truncate">
                    {cust?.companyName || cust?.name}
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <CurrencyAmount
                    amount={q.grandTotal}
                    currency={q.currency}
                    className="font-bold text-sm text-neutral-900 dark:text-neutral-100 block"
                  />
                  <span className="text-[10px] text-neutral-400 block font-mono">{formatDate(q.issueDate)}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-neutral-100 dark:border-neutral-800/80 text-xs">
                <div className="flex items-center gap-1.5">
                  <QuoteStatusBadge status={q.status} />
                  <DeliveryStatusBadge status={q.deliveryStatus} />
                </div>

                <div className="flex items-center gap-1.5">
                  <Link
                    to={`/app/quotes/${q.id}/preview`}
                    className="p-1 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
                    title="Preview PDF"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </Link>
                  <Link
                    to={`/app/quotes/${q.id}`}
                    className="px-2 py-1 text-[11px] text-neutral-600 dark:text-neutral-300 font-medium hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded"
                  >
                    View
                  </Link>
                  <Link
                    to={`/app/quotes/${q.id}/edit`}
                    className="px-2.5 py-1 text-[11px] bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 rounded font-semibold shadow-2xs"
                  >
                    Edit
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredQuotes.length === 0 && (
        <div className="py-12 text-center space-y-3 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-8 shadow-2xs">
          <FileSpreadsheet className="w-8 h-8 text-neutral-400 mx-auto" />
          <h3 className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">
            No quotations found
          </h3>
          <p className="text-xs text-neutral-500 max-w-sm mx-auto">
            {searchQuery
              ? `No quotations matched "${searchQuery}". Try clearing your filters.`
              : 'Create your first commercial quotation to start pricing jobs.'}
          </p>
          <div className="pt-2">
            <Link
              to="/app/requests/new"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Create New Request</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};
