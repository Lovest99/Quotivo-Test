import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { CurrencyAmount } from '../components/ui/CurrencyAmount';
import { QuoteStatusBadge } from '../components/ui/StatusBadges';
import { formatDate } from '../utils/formatters';
import { StorageService } from '../services/storage';
import {
  Plus,
  Clock,
  Send,
  CheckCircle2,
  FileText,
  ArrowRight,
  BookOpen,
  Users,
  ShieldCheck,
  TrendingUp,
  Sparkles,
  Download,
  Filter,
  CheckCheck,
  X,
  Zap,
  Search,
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, business, quotes, customers, activities, showToast, setCommandPaletteOpen } = useApp();

  const [tableFilter, setTableFilter] = useState<'all' | 'awaiting_approval' | 'draft' | 'sent' | 'accepted'>('all');
  const [isQuickActionsOpen, setIsQuickActionsOpen] = useState(false);

  const draftsCount = quotes.filter((q) => q.status === 'draft' || q.status === 'needs_info').length;
  const awaitingApproval = quotes.filter((q) => q.status === 'awaiting_approval');
  const awaitingCount = awaitingApproval.length;
  const sentCount = quotes.filter((q) => q.status === 'sent').length;
  const acceptedCount = quotes.filter((q) => q.status === 'accepted').length;

  // Currency grouped total value of accepted quotations
  const acceptedByCurrency: Record<string, number> = {};
  quotes.filter((q) => q.status === 'accepted').forEach((q) => {
    acceptedByCurrency[q.currency] = (acceptedByCurrency[q.currency] || 0) + q.grandTotal;
  });

  const filteredQuotes = quotes
    .filter((q) => {
      if (tableFilter === 'all') return true;
      if (tableFilter === 'draft') return q.status === 'draft' || q.status === 'needs_info';
      return q.status === tableFilter;
    })
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 6);

  const recentActivity = activities.slice(0, 5);

  const handleLaunchQuickTemplate = (templateType: 'fitout' | 'hvac' | 'civil' | 'electrical') => {
    const defaultCust = customers[0]?.id || '';
    if (templateType === 'fitout') {
      StorageService.saveCustomerRequestDraft({
        id: `req_${Date.now()}`,
        customerId: defaultCust,
        title: '5,000 sq ft Office Acoustic Partitions & Power',
        category: 'Commercial Fit-Out',
        description: 'Commercial interior refurbishment: supply and erect 85 linear m of acoustic stud partitions, 4 solid core doorsets, 18 ring main twin socket points, and final post-construction power sweep.',
        currency: 'USD',
        selectedCatalogueIds: [],
        attachments: [],
        createdAt: new Date().toISOString(),
      });
    } else if (templateType === 'hvac') {
      StorageService.saveCustomerRequestDraft({
        id: `req_${Date.now()}`,
        customerId: defaultCust,
        title: 'Server Room & Office Multi-Split Cooling Overhaul',
        category: 'Specialist MEP',
        description: 'Urgent requirement for dual 14kW ceiling cassette air conditioning units for primary server room, 35m galvanized spiral ducting, digital touch screen BMS controller, and F-gas commissioning.',
        currency: 'USD',
        selectedCatalogueIds: [],
        attachments: [],
        createdAt: new Date().toISOString(),
      });
    } else if (templateType === 'civil') {
      StorageService.saveCustomerRequestDraft({
        id: `req_${Date.now()}`,
        customerId: defaultCust,
        title: 'Boundary Retaining Wall & Foundation Works',
        category: 'Civil Works',
        description: 'Excavation of foundation trenches, concrete footing pour, double-wythe engineering brickwork (65 sq m), and temporary site perimeter security fencing.',
        currency: 'USD',
        selectedCatalogueIds: [],
        attachments: [],
        createdAt: new Date().toISOString(),
      });
    } else {
      StorageService.saveCustomerRequestDraft({
        id: `req_${Date.now()}`,
        customerId: defaultCust,
        title: 'Three-Phase Distribution Board & Circuit Testing',
        category: 'Electrical',
        description: 'Installation of 12-way three-phase distribution board, sub-metering, emergency LED lighting circuit, and full statutory compliance certification.',
        currency: 'USD',
        selectedCatalogueIds: [],
        attachments: [],
        createdAt: new Date().toISOString(),
      });
    }

    showToast('Loaded commercial prompt template into request wizard', 'info');
    navigate('/app/requests/new');
  };

  return (
    <div className="p-3 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-4 sm:space-y-6 animate-in fade-in duration-200">
      {/* Top Greeting & Action Bar: Executive & Compact */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-0.5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
              Welcome back, {currentUser.name.split(' ')[0]}
            </h1>
            <span className="inline-flex items-center gap-1.5 text-[10px] font-medium text-neutral-500 dark:text-neutral-400 px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 border border-neutral-200/80 dark:border-neutral-700">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>Operational</span>
            </span>
          </div>
          <p className="text-xs text-neutral-500 mt-0.5">
            {business.name} · Trade Estimating & Price Matching Engine
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Link
            to="/app/requests/new"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-neutral-100 dark:text-neutral-950 dark:hover:bg-white rounded-lg text-xs font-semibold shadow-2xs hover:shadow-xs transition-all"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>New Quotation</span>
          </Link>
        </div>
      </div>

      {/* Executive KPI Stat Strip: Compact & High Scannability */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
        {/* Drafts */}
        <button
          onClick={() => navigate('/app/quotes?status=draft')}
          className="p-3 rounded-lg border border-neutral-200/90 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-left hover:border-neutral-300 dark:hover:border-neutral-700 transition-all group shadow-2xs"
        >
          <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400">
            <span className="text-[11px] font-medium">Drafts</span>
            <FileText className="w-3.5 h-3.5 text-neutral-400" />
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-xl sm:text-2xl font-bold font-mono tracking-tight text-neutral-900 dark:text-neutral-100">
              {draftsCount}
            </span>
            <span className="text-[11px] text-neutral-400">in review</span>
          </div>
        </button>

        {/* Awaiting Approval */}
        <button
          onClick={() => navigate('/app/approvals')}
          className="p-3 rounded-lg border border-blue-200/80 dark:border-blue-900/60 bg-blue-50/30 dark:bg-blue-950/20 text-left hover:border-blue-300 dark:hover:border-blue-800 transition-all group shadow-2xs"
        >
          <div className="flex items-center justify-between text-blue-700 dark:text-blue-300">
            <span className="text-[11px] font-medium">Approvals</span>
            <Clock className="w-3.5 h-3.5 text-blue-500" />
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-xl sm:text-2xl font-bold font-mono tracking-tight text-blue-600 dark:text-blue-400">
              {awaitingCount}
            </span>
            <span className="text-[11px] text-blue-600/80 dark:text-blue-400/80 font-medium">pending sign-off</span>
          </div>
        </button>

        {/* Sent */}
        <button
          onClick={() => navigate('/app/quotes?status=sent')}
          className="p-3 rounded-lg border border-neutral-200/90 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-left hover:border-neutral-300 dark:hover:border-neutral-700 transition-all group shadow-2xs"
        >
          <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400">
            <span className="text-[11px] font-medium">Dispatched</span>
            <Send className="w-3.5 h-3.5 text-neutral-400" />
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-xl sm:text-2xl font-bold font-mono tracking-tight text-neutral-900 dark:text-neutral-100">
              {sentCount}
            </span>
            <span className="text-[11px] text-neutral-400">with clients</span>
          </div>
        </button>

        {/* Accepted */}
        <button
          onClick={() => navigate('/app/quotes?status=accepted')}
          className="p-3 rounded-lg border border-neutral-200/90 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-left hover:border-neutral-300 dark:hover:border-neutral-700 transition-all group shadow-2xs"
        >
          <div className="flex items-center justify-between text-emerald-700 dark:text-emerald-300">
            <span className="text-[11px] font-medium">Accepted</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
          </div>
          <div className="mt-1 flex items-baseline justify-between gap-1">
            <span className="text-xl sm:text-2xl font-bold font-mono tracking-tight text-neutral-900 dark:text-neutral-100">
              {acceptedCount}
            </span>
            <span className="text-xs font-mono font-semibold text-emerald-600 dark:text-emerald-400 truncate">
              {Object.keys(acceptedByCurrency).length > 0 ? (
                Object.keys(acceptedByCurrency).map((curr) => (
                  <CurrencyAmount key={curr} amount={acceptedByCurrency[curr]} currency={curr} showCents={false} />
                ))
              ) : (
                <span className="text-[11px] text-neutral-400 font-normal">No closed quotes</span>
              )}
            </span>
          </div>
        </button>
      </div>

      {/* Fast Template Quick-Starters Strip: Compact Single-Line */}
      <div className="p-2 sm:p-2.5 bg-neutral-50/80 dark:bg-neutral-900/60 border border-neutral-200/80 dark:border-neutral-800 rounded-lg flex items-center justify-between gap-2 text-xs overflow-x-auto scrollbar-none">
        <span className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400 shrink-0">
          Fast Starters:
        </span>
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => handleLaunchQuickTemplate('fitout')}
            className="px-2 py-0.5 rounded border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 font-medium text-[11px] transition-colors cursor-pointer"
          >
            Office Fit-Out
          </button>
          <button
            onClick={() => handleLaunchQuickTemplate('hvac')}
            className="px-2 py-0.5 rounded border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 font-medium text-[11px] transition-colors cursor-pointer"
          >
            Server HVAC
          </button>
          <button
            onClick={() => handleLaunchQuickTemplate('civil')}
            className="px-2 py-0.5 rounded border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 font-medium text-[11px] transition-colors cursor-pointer"
          >
            Civil Masonry
          </button>
          <button
            onClick={() => handleLaunchQuickTemplate('electrical')}
            className="px-2 py-0.5 rounded border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 font-medium text-[11px] transition-colors cursor-pointer"
          >
            Electrical Mains
          </button>
        </div>
      </div>

      {/* Main 2-Column Split: Recent Quotations & Governance Inbox */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 spans): Filterable Quotations Table */}
        {/* Left Column: Recent Quotes Pipeline */}
        <div className="lg:col-span-2 space-y-3 sm:space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div>
              <h2 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                Recent Quotations
              </h2>
              <p className="text-[11px] text-neutral-500">
                Commercial records with real-time status and PDF actions.
              </p>
            </div>

            {/* Segmented Filter Control: 5 equal columns on mobile so ZERO horizontal scroll */}
            <div className="grid grid-cols-5 sm:flex sm:items-center gap-1 p-0.5 bg-neutral-100 dark:bg-neutral-800/80 rounded-lg text-xs w-full sm:w-auto text-center">
              {(
                [
                  { id: 'all', label: 'All' },
                  { id: 'awaiting_approval', label: 'Review' },
                  { id: 'sent', label: 'Sent' },
                  { id: 'accepted', label: 'Accepted' },
                  { id: 'draft', label: 'Drafts' },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setTableFilter(tab.id)}
                  className={`py-1 px-1 sm:px-2.5 rounded-md text-[11px] font-medium transition-colors cursor-pointer truncate ${
                    tableFilter === tab.id
                      ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 shadow-2xs font-semibold'
                      : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Desktop Table View (>= md) */}
          <div className="hidden md:block border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden bg-white dark:bg-neutral-900 shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead className="sticky top-0 z-10 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md">
                  <tr className="bg-neutral-50/80 dark:bg-neutral-800/60 border-b border-neutral-200 dark:border-neutral-800 text-neutral-500 font-medium">
                    <th className="py-2.5 px-3">Quote #</th>
                    <th className="py-2.5 px-3">Customer & Title</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Grand Total</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                  {filteredQuotes.map((q) => {
                    const cust = customers.find((c) => c.id === q.customerId);
                    return (
                      <tr key={q.id} className="hover:bg-neutral-50/60 dark:hover:bg-neutral-800/40 transition-colors">
                        <td className="py-3 px-3 font-mono font-medium text-blue-600 dark:text-blue-400">
                          <Link to={`/app/quotes/${q.id}`} className="hover:underline">
                            {q.quoteNumber}
                          </Link>
                          <span className="text-[10px] text-neutral-400 block font-mono">
                            Rev {q.currentRevision}
                          </span>
                        </td>
                        <td className="py-3 px-3 max-w-[220px]">
                          <span className="font-semibold text-neutral-900 dark:text-neutral-100 block truncate">
                            {q.title}
                          </span>
                          <span className="text-[11px] text-neutral-500 truncate block">
                            {cust?.companyName || cust?.name || 'Customer'} · {formatDate(q.issueDate)}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <QuoteStatusBadge status={q.status} />
                        </td>
                        <td className="py-3 px-3 text-right font-mono tabular-nums font-semibold text-neutral-900 dark:text-neutral-100">
                          <CurrencyAmount amount={q.grandTotal} currency={q.currency} />
                        </td>
                        <td className="py-3 px-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Link
                              to={`/app/quotes/${q.id}/edit`}
                              className="px-2 py-1 text-[11px] font-medium text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded transition-colors"
                            >
                              Edit
                            </Link>
                            <Link
                              to={`/app/quotes/${q.id}/preview`}
                              className="px-2 py-1 text-[11px] font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center gap-1"
                              title="Preview & Export PDF"
                            >
                              <Download className="w-3 h-3 text-neutral-400" />
                              <span className="hidden sm:inline">PDF</span>
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="p-2.5 border-t border-neutral-100 dark:border-neutral-800/80 bg-neutral-50/50 dark:bg-neutral-800/30 text-center">
              <Link
                to="/app/quotes"
                className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
              >
                View all quotations in directory &rarr;
              </Link>
            </div>
          </div>

          {/* Mobile Quotation Cards View (< md): No overlapping table, zero horizontal scroll */}
          <div className="md:hidden space-y-2.5">
            {filteredQuotes.map((q) => {
              const cust = customers.find((c) => c.id === q.customerId);
              return (
                <div
                  key={q.id}
                  className="p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-2xs space-y-2.5"
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
                        {cust?.companyName || cust?.name || 'Customer'}
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

                  <div className="flex items-center justify-between pt-2 border-t border-neutral-100 dark:border-neutral-800 text-xs">
                    <QuoteStatusBadge status={q.status} />

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

            <div className="pt-1 text-center">
              <Link
                to="/app/quotes"
                className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline block py-1.5"
              >
                View all quotations in directory &rarr;
              </Link>
            </div>
          </div>
        </div>

        {/* Right Column: Approval Queue & Operations Audit */}
        <div className="space-y-6">
          {/* Approval Queue Box */}
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-4 space-y-3 shadow-2xs">
            <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-2.5">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-900 dark:text-neutral-100">
                  Governance Queue ({awaitingCount})
                </h3>
              </div>
              <Link to="/app/approvals" className="text-[11px] text-blue-600 hover:underline font-medium">
                Open Queue &rarr;
              </Link>
            </div>

            {awaitingApproval.length === 0 ? (
              <div className="p-4 text-center text-xs text-neutral-400 space-y-1">
                <CheckCheck className="w-5 h-5 text-emerald-500 mx-auto" />
                <p className="font-medium text-neutral-700 dark:text-neutral-300">Queue is clear</p>
                <p className="text-[11px]">All submitted revisions are reviewed.</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {awaitingApproval.slice(0, 3).map((q) => {
                  const cust = customers.find((c) => c.id === q.customerId);
                  return (
                    <div
                      key={q.id}
                      className="p-2.5 rounded-lg border border-neutral-100 dark:border-neutral-800 hover:border-blue-300 dark:hover:border-blue-800 transition-colors text-xs space-y-1 bg-neutral-50/30 dark:bg-neutral-800/20"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-medium text-blue-600 dark:text-blue-400">
                          {q.quoteNumber} (Rev {q.currentRevision})
                        </span>
                        <CurrencyAmount amount={q.grandTotal} currency={q.currency} className="font-semibold" />
                      </div>
                      <p className="font-medium text-neutral-900 dark:text-neutral-100 truncate">{q.title}</p>
                      <p className="text-[11px] text-neutral-500">By {q.createdByName} for {cust?.name}</p>
                      <div className="pt-1 flex justify-end">
                        <Link
                          to={`/app/quotes/${q.id}/edit`}
                          className="text-[11px] font-semibold text-blue-600 hover:underline"
                        >
                          Review & Sign Off →
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick Catalogue & Customer Directory Links */}
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-4 space-y-3 shadow-2xs">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
              Operations Grounding
            </h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <Link
                to="/app/catalogue"
                className="p-2.5 rounded-lg border border-neutral-100 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800 flex flex-col gap-1 transition-colors"
              >
                <BookOpen className="w-4 h-4 text-blue-600" />
                <span className="font-medium text-neutral-800 dark:text-neutral-200">Price Catalogue</span>
                <span className="text-[10px] text-neutral-400">Verified SKUs & rates</span>
              </Link>
              <Link
                to="/app/customers"
                className="p-2.5 rounded-lg border border-neutral-100 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800 flex flex-col gap-1 transition-colors"
              >
                <Users className="w-4 h-4 text-blue-600" />
                <span className="font-medium text-neutral-800 dark:text-neutral-200">Customer Base</span>
                <span className="text-[10px] text-neutral-400">Billing & sites</span>
              </Link>
            </div>
          </div>

          {/* Recent Audit Timeline */}
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-4 space-y-3 shadow-2xs">
            <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                Recent Audit Events
              </span>
              <Link to="/app/activity" className="text-[11px] text-blue-600 hover:underline">
                View All
              </Link>
            </div>
            <div className="space-y-2 text-xs">
              {recentActivity.map((act) => (
                <div key={act.id} className="space-y-0.5 border-b border-neutral-50 dark:border-neutral-800/40 pb-2 last:border-0 last:pb-0">
                  <p className="font-medium text-neutral-800 dark:text-neutral-200 truncate">{act.title}</p>
                  <p className="text-[11px] text-neutral-500 truncate">{act.description}</p>
                  <span className="text-[10px] font-mono text-neutral-400">{formatDate(act.timestamp)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Floating Quick Actions Menu */}
      {isQuickActionsOpen && (
        <div
          role="presentation"
          aria-hidden="true"
          onClick={() => setIsQuickActionsOpen(false)}
          className="fixed inset-0 z-40 bg-neutral-900/30 dark:bg-black/50 backdrop-blur-[2px] transition-opacity animate-in fade-in duration-150"
        />
      )}

      <div className="hidden lg:flex fixed bottom-8 right-8 z-40 flex-col items-end">
        {/* Expanded Menu Popover */}
        {isQuickActionsOpen && (
          <div
            role="menu"
            aria-label="Quick Actions"
            className="mb-3 w-72 sm:w-80 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-2xl p-2.5 space-y-1 animate-in fade-in slide-in-from-bottom-3 duration-200"
          >
            <div className="px-3 py-2 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-md bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <Zap className="w-3 h-3 fill-current" />
                </div>
                <span className="text-xs font-semibold uppercase tracking-wider text-neutral-800 dark:text-neutral-200">
                  Quick Actions
                </span>
              </div>
              <span className="text-[10px] text-neutral-400 font-mono">Shortcuts</span>
            </div>

            <div className="pt-1 space-y-0.5">
              <button
                type="button"
                onClick={() => {
                  setIsQuickActionsOpen(false);
                  navigate('/app/requests/new');
                }}
                className="w-full flex items-center gap-3 p-2.5 rounded-xl text-left hover:bg-neutral-50 dark:hover:bg-neutral-800/80 transition-colors group cursor-pointer"
              >
                <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Plus className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    New Quotation Request
                  </p>
                  <p className="text-[11px] text-neutral-500 truncate">Interpret client brief with AI</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsQuickActionsOpen(false);
                  navigate('/app/customers/new');
                }}
                className="w-full flex items-center gap-3 p-2.5 rounded-xl text-left hover:bg-neutral-50 dark:hover:bg-neutral-800/80 transition-colors group cursor-pointer"
              >
                <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Users className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    Add New Customer
                  </p>
                  <p className="text-[11px] text-neutral-500 truncate">Store client details & payment terms</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsQuickActionsOpen(false);
                  navigate('/app/catalogue/new');
                }}
                className="w-full flex items-center gap-3 p-2.5 rounded-xl text-left hover:bg-neutral-50 dark:hover:bg-neutral-800/80 transition-colors group cursor-pointer"
              >
                <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-900/40 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <BookOpen className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                    Add Catalogue Item
                  </p>
                  <p className="text-[11px] text-neutral-500 truncate">New verified SKU, rate or labor code</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsQuickActionsOpen(false);
                  navigate('/app/approvals');
                }}
                className="w-full flex items-center gap-3 p-2.5 rounded-xl text-left hover:bg-neutral-50 dark:hover:bg-neutral-800/80 transition-colors group cursor-pointer"
              >
                <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <ShieldCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div className="flex-1 min-w-0 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      Review Approvals
                    </p>
                    <p className="text-[11px] text-neutral-500 truncate">Sign off draft revisions</p>
                  </div>
                  {awaitingCount > 0 && (
                    <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300">
                      {awaitingCount}
                    </span>
                  )}
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsQuickActionsOpen(false);
                  setCommandPaletteOpen(true);
                }}
                className="w-full flex items-center gap-3 p-2.5 rounded-xl text-left hover:bg-neutral-50 dark:hover:bg-neutral-800/80 transition-colors group cursor-pointer"
              >
                <div className="w-8 h-8 rounded-lg bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Search className="w-4 h-4 text-neutral-600 dark:text-neutral-300" />
                </div>
                <div className="flex-1 min-w-0 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">
                      Command Palette
                    </p>
                    <p className="text-[11px] text-neutral-500 truncate">Search quotes, customers & catalogue</p>
                  </div>
                  <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded text-neutral-500">
                    ⌘K
                  </kbd>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Floating Action Trigger Button */}
        <button
          type="button"
          onClick={() => setIsQuickActionsOpen(!isQuickActionsOpen)}
          aria-expanded={isQuickActionsOpen}
          aria-label="Quick Actions Menu"
          className="group relative flex items-center gap-2.5 h-12 px-4 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl hover:shadow-blue-600/25 transition-all duration-200 active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-neutral-900 cursor-pointer"
        >
          <div
            className={`w-5 h-5 flex items-center justify-center transition-transform duration-200 ${
              isQuickActionsOpen ? 'rotate-90' : 'group-hover:rotate-90'
            }`}
          >
            {isQuickActionsOpen ? (
              <X className="w-5 h-5 text-white" />
            ) : (
              <Plus className="w-5 h-5 text-white" />
            )}
          </div>
          <span className="text-xs font-semibold tracking-wide">
            {isQuickActionsOpen ? 'Close' : 'Quick Actions'}
          </span>
          {!isQuickActionsOpen && awaitingCount > 0 && (
            <span className="w-2 h-2 rounded-full bg-amber-300 animate-pulse" />
          )}
        </button>
      </div>
    </div>
  );
};
