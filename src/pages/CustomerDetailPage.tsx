import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Customer } from '../types';
import { StorageService } from '../services/storage';
import { QuoteStatusBadge } from '../components/ui/StatusBadges';
import { CurrencyAmount } from '../components/ui/CurrencyAmount';
import { formatDate } from '../utils/formatters';
import {
  ArrowLeft,
  Edit,
  Plus,
  Mail,
  Phone,
  MapPin,
  FileSpreadsheet,
  History,
  ChevronDown,
} from 'lucide-react';

export const CustomerDetailPage: React.FC = () => {
  const { customerId } = useParams<{ customerId: string }>();
  const navigate = useNavigate();
  const { customers, quotes, activities, showToast } = useApp();

  const [activeTab, setActiveTab] = useState<'overview' | 'quotes' | 'activity'>('overview');

  const customer = customers.find((c) => c.id === customerId);

  if (!customer) {
    return (
      <div className="p-8 text-center text-xs text-neutral-500">
        Customer record not found.
      </div>
    );
  }

  const customerQuotes = quotes.filter((q) => q.customerId === customer.id);
  const customerActivities = activities.filter((a) => a.customerId === customer.id);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200 dark:border-neutral-800">
        <div className="flex items-center gap-3">
          <Link
            to="/app/customers"
            className="p-1.5 text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
              <span>{customer.name}</span>
              <span className="font-mono text-xs px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 uppercase font-semibold text-neutral-500">
                {customer.type}
              </span>
            </h1>
            {customer.companyName && (
              <p className="text-xs text-neutral-500 mt-0.5">{customer.companyName}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            to={`/app/customers/${customer.id}/edit`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 text-neutral-800 dark:text-neutral-200 rounded-lg text-xs font-medium shadow-xs"
          >
            <Edit className="w-3.5 h-3.5" />
            <span>Edit Profile</span>
          </Link>

          <Link
            to="/app/requests/new"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Quote for Customer</span>
          </Link>
        </div>
      </div>

      {/* Mobile View Selector (< sm): Fits screen with ZERO horizontal scroll */}
      <div className="sm:hidden flex items-center justify-between gap-2 p-1 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-xs shadow-2xs">
        <span className="text-[10px] font-bold text-neutral-400 pl-2 uppercase tracking-wider">
          View:
        </span>
        <div className="relative flex-1">
          <select
            value={activeTab}
            onChange={(e) => setActiveTab(e.target.value as any)}
            aria-label="Select customer view"
            className="w-full text-right font-semibold text-xs text-neutral-900 dark:text-neutral-100 bg-transparent pr-6 py-1 focus:outline-hidden appearance-none cursor-pointer"
          >
            <option value="overview">Customer Profile</option>
            <option value="quotes">Quotations ({customerQuotes.length})</option>
            <option value="activity">Customer Activity</option>
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-neutral-400 absolute right-1.5 top-1.5 pointer-events-none" />
        </div>
      </div>

      {/* Desktop Tabs (>= sm) */}
      <div className="hidden sm:flex items-center gap-1 border-b border-neutral-200 dark:border-neutral-800 text-xs">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-3 py-2 font-medium transition-colors border-b-2 -mb-px ${
            activeTab === 'overview'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400 font-semibold'
              : 'border-transparent text-neutral-500 hover:text-neutral-800'
          }`}
        >
          Customer Profile
        </button>

        <button
          onClick={() => setActiveTab('quotes')}
          className={`px-3 py-2 font-medium flex items-center gap-1.5 transition-colors border-b-2 -mb-px ${
            activeTab === 'quotes'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400 font-semibold'
              : 'border-transparent text-neutral-500 hover:text-neutral-800'
          }`}
        >
          <span>Quotations</span>
          <span className="font-mono text-[10px] px-1.5 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300">
            {customerQuotes.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('activity')}
          className={`px-3 py-2 font-medium transition-colors border-b-2 -mb-px ${
            activeTab === 'activity'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400 font-semibold'
              : 'border-transparent text-neutral-500 hover:text-neutral-800'
          }`}
        >
          Customer Activity
        </button>
      </div>

      {/* TAB 1: Profile */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-5 space-y-4">
            <h3 className="font-semibold uppercase tracking-wider text-neutral-400 text-[10px]">
              Contact Coordinates
            </h3>
            <div className="space-y-2 text-neutral-700 dark:text-neutral-300">
              <p className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-neutral-400" />
                <a href={`mailto:${customer.email}`} className="text-blue-600 hover:underline">
                  {customer.email}
                </a>
              </p>
              <p className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-neutral-400" />
                <span>{customer.phone || 'No phone recorded'}</span>
              </p>
            </div>

            <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800 space-y-1">
              <span className="font-semibold text-neutral-600 dark:text-neutral-400 block text-[10px] uppercase">
                Billing Address
              </span>
              <p className="text-neutral-800 dark:text-neutral-200">
                {customer.billingAddress?.street}
              </p>
              <p className="text-neutral-500">
                {customer.billingAddress?.city}, {customer.billingAddress?.state} {customer.billingAddress?.postalCode}
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-5 space-y-4">
            <h3 className="font-semibold uppercase tracking-wider text-neutral-400 text-[10px]">
              Site Address & Notes
            </h3>
            {customer.siteAddress ? (
              <div className="space-y-1">
                <span className="font-semibold text-neutral-600 dark:text-neutral-400 block text-[10px] uppercase">
                  Default Job / Delivery Site
                </span>
                <p className="text-neutral-800 dark:text-neutral-200">
                  {customer.siteAddress.street}
                </p>
                <p className="text-neutral-500">
                  {customer.siteAddress.city}, {customer.siteAddress.state} {customer.siteAddress.postalCode}
                </p>
              </div>
            ) : (
              <p className="text-neutral-400 italic">No separate job site address specified.</p>
            )}

            {customer.notes && (
              <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800">
                <span className="font-semibold text-neutral-600 dark:text-neutral-400 block text-[10px] uppercase mb-1">
                  Internal Commercial Notes
                </span>
                <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed bg-neutral-50 dark:bg-neutral-800/60 p-2.5 rounded border border-neutral-100 dark:border-neutral-800">
                  {customer.notes}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: Quotations */}
      {activeTab === 'quotes' && (
        <div className="space-y-3">
          {customerQuotes.map((q) => (
            <div
              key={q.id}
              className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
            >
              <div>
                <div className="flex items-center gap-2">
                  <Link
                    to={`/app/quotes/${q.id}`}
                    className="font-mono font-bold text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    {q.quoteNumber} (Rev {q.currentRevision})
                  </Link>
                  <QuoteStatusBadge status={q.status} />
                </div>
                <p className="font-semibold text-neutral-900 dark:text-neutral-100 mt-1">{q.title}</p>
                <p className="text-[11px] text-neutral-500">Issued {formatDate(q.issueDate)}</p>
              </div>

              <div className="flex items-center gap-4 shrink-0">
                <CurrencyAmount
                  amount={q.grandTotal}
                  currency={q.currency}
                  className="font-mono font-bold text-sm text-neutral-900 dark:text-neutral-100"
                />
                <Link
                  to={`/app/quotes/${q.id}`}
                  className="px-3 py-1.5 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 rounded font-medium text-neutral-800 dark:text-neutral-200"
                >
                  View
                </Link>
              </div>
            </div>
          ))}

          {customerQuotes.length === 0 && (
            <div className="py-8 text-center text-xs text-neutral-500 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-8">
              No quotations created for this customer yet.
            </div>
          )}
        </div>
      )}

      {/* TAB 3: Activity */}
      {activeTab === 'activity' && (
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-6 text-xs">
          {customerActivities.length > 0 ? (
            <div className="space-y-3">
              {customerActivities.map((act) => (
                <div key={act.id} className="pb-3 border-b border-neutral-100 dark:border-neutral-800 last:border-0 last:pb-0">
                  <p className="font-semibold text-neutral-900 dark:text-neutral-100">{act.title}</p>
                  <p className="text-neutral-500 text-[11px] mt-0.5">{act.description}</p>
                  <span className="text-[10px] text-neutral-400 font-mono">{formatDate(act.timestamp)}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-neutral-400 text-center py-4">No recent activity logs for this client.</p>
          )}
        </div>
      )}
    </div>
  );
};
