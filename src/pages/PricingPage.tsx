import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { BrandLogo } from '../components/ui/BrandLogo';
import {
  Check,
  Zap,
  Shield,
  CreditCard,
  Building2,
  ArrowRight,
  ArrowLeft,
  Download,
  HelpCircle,
  Clock,
} from 'lucide-react';

export const PricingPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    currentPlan,
    billingInterval,
    quotesUsedThisMonth,
    quotesMonthlyLimit,
    changePlan,
    showToast,
  } = useApp();

  const [interval, setInterval] = useState<'monthly' | 'annual'>(billingInterval);

  const handleSelectPlan = (plan: 'basic' | 'pro' | 'enterprise') => {
    changePlan(plan, interval);
  };

  const invoices = [
    { id: 'INV-2027-003', date: 'Feb 01, 2027', amount: '$10.00', status: 'Paid', plan: 'Basic Quoting Plan' },
    { id: 'INV-2027-002', date: 'Jan 01, 2027', amount: '$10.00', status: 'Paid', plan: 'Basic Quoting Plan' },
    { id: 'INV-2026-001', date: 'Dec 01, 2026', amount: '$10.00', status: 'Paid', plan: 'Basic Quoting Plan' },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-12 animate-in fade-in duration-200">
      {/* Navigation Breadcrumb */}
      <div className="flex items-center gap-2 text-xs">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1 text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back</span>
        </button>
        <span className="text-neutral-300 dark:text-neutral-700">·</span>
        <Link to="/app" className="text-neutral-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
          Dashboard
        </Link>
        <span className="text-neutral-300 dark:text-neutral-700">·</span>
        <span className="text-neutral-900 dark:text-neutral-100 font-semibold">Subscription & Pricing</span>
      </div>

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
              Commercial Quoting Plans
            </span>
            <span className="text-xs text-neutral-400">· Active: {currentPlan.toUpperCase()}</span>
          </div>
          <h1 className="text-xl sm:text-3xl font-bold tracking-tight bg-gradient-to-r from-neutral-900 via-neutral-800 to-neutral-700 dark:from-white dark:via-neutral-100 dark:to-neutral-300 bg-clip-text text-transparent mt-1">
            Subscription Plans & Quota
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Transparent pricing tailored for trade contractors, HVAC specialists, and engineering firms.
          </p>
        </div>

        {/* Current Active Plan Pill */}
        <div className="p-3 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl flex items-center gap-3 shadow-xs">
          <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900/60 flex items-center justify-center text-blue-600 dark:text-blue-400">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-neutral-400 block tracking-wider">
              Current Active Plan
            </span>
            <p className="text-xs font-bold text-neutral-900 dark:text-neutral-100 capitalize">
              {currentPlan} (${currentPlan === 'basic' ? '10' : currentPlan === 'pro' ? '29' : '79'}/mo)
            </p>
          </div>
        </div>
      </div>

      {/* Quota Usage Bar */}
      <div className="p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div>
            <span className="font-bold text-neutral-900 dark:text-neutral-100 block">
              Monthly Quoting Capacity
            </span>
            <span className="text-[11px] text-neutral-500">
              {currentPlan === 'basic'
                ? `${quotesUsedThisMonth} of ${quotesMonthlyLimit} AI quote generations used this billing cycle`
                : 'Unlimited quote drafting and n8n webhook sync active'}
            </span>
          </div>
          <span className="font-mono font-bold text-neutral-700 dark:text-neutral-300">
            {currentPlan === 'basic'
              ? `${Math.round((quotesUsedThisMonth / quotesMonthlyLimit) * 100)}% used`
              : 'Unlimited'}
          </span>
        </div>

        <div className="h-2 w-full bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${
              currentPlan === 'basic' ? 'bg-blue-600' : 'bg-emerald-500'
            }`}
            style={{
              width:
                currentPlan === 'basic'
                  ? `${Math.min(100, Math.round((quotesUsedThisMonth / quotesMonthlyLimit) * 100))}%`
                  : '100%',
            }}
          />
        </div>
      </div>

      {/* Billing Interval Toggle */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center gap-3 p-1 rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
          <button
            type="button"
            onClick={() => setInterval('monthly')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              interval === 'monthly'
                ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 shadow-2xs'
                : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100'
            }`}
          >
            Monthly Billing
          </button>
          <button
            type="button"
            onClick={() => setInterval('annual')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              interval === 'annual'
                ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 shadow-2xs'
                : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100'
            }`}
          >
            <span>Annual Billing</span>
            <span className="px-1.5 py-0.2 text-[9px] font-bold uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 rounded">
              Save 20%
            </span>
          </button>
        </div>
      </div>

      {/* 3 Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
        {/* Plan 1: Basic */}
        <div
          className={`rounded-2xl border p-6 sm:p-8 flex flex-col justify-between transition-all ${
            currentPlan === 'basic'
              ? 'border-blue-600 bg-white dark:bg-neutral-900 ring-2 ring-blue-600/20 shadow-md'
              : 'border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs'
          }`}
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-500 block">
                  Basic Plan
                </span>
                <p className="text-xs text-neutral-500 mt-1">
                  For solo trade contractors & independent operators.
                </p>
              </div>
              {currentPlan === 'basic' && (
                <span className="px-2 py-0.5 bg-blue-600 text-white rounded text-[10px] font-bold">
                  ACTIVE
                </span>
              )}
            </div>

            <div className="pt-2 flex items-baseline gap-1">
              <span className="text-4xl font-extrabold font-mono text-neutral-900 dark:text-neutral-100">
                ${interval === 'monthly' ? '10' : '8'}
              </span>
              <span className="text-xs text-neutral-500">/ month</span>
            </div>
            {interval === 'annual' && (
              <p className="text-[11px] text-emerald-600 font-medium">Billed annually ($96/year)</p>
            )}

            <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800 space-y-2.5 text-xs text-neutral-600 dark:text-neutral-300">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span><strong>50 AI Quotes</strong> / month</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>n8n automation & email dispatch</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>1 Price Catalogue (PKR, USD, EUR, GBP)</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Missing rates & unmatched alerts</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Print & PDF quotation download</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Standard email support</span>
              </div>
            </div>
          </div>

          <div className="pt-8">
            <button
              type="button"
              disabled={currentPlan === 'basic'}
              onClick={() => handleSelectPlan('basic')}
              className={`w-full py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                currentPlan === 'basic'
                  ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-400 cursor-default'
                  : 'bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 hover:opacity-90'
              }`}
            >
              {currentPlan === 'basic' ? 'Current Plan' : 'Select Basic ($10/mo)'}
            </button>
          </div>
        </div>

        {/* Plan 2: Pro */}
        <div
          className={`rounded-2xl border-2 p-6 sm:p-8 flex flex-col justify-between transition-all relative ${
            currentPlan === 'pro'
              ? 'border-blue-600 bg-white dark:bg-neutral-900 ring-4 ring-blue-600/10 shadow-xl'
              : 'border-blue-600 bg-white dark:bg-neutral-900 shadow-md'
          }`}
        >
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-blue-600 text-white rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm">
            Most Popular · High Volume
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 block">
                  Pro Plan
                </span>
                <p className="text-xs text-neutral-500 mt-1">
                  For growing trade contractors, HVAC/MEP firms & estimating teams.
                </p>
              </div>
              {currentPlan === 'pro' && (
                <span className="px-2 py-0.5 bg-blue-600 text-white rounded text-[10px] font-bold">
                  ACTIVE
                </span>
              )}
            </div>

            <div className="pt-2 flex items-baseline gap-1">
              <span className="text-4xl font-extrabold font-mono text-neutral-900 dark:text-neutral-100">
                ${interval === 'monthly' ? '29' : '24'}
              </span>
              <span className="text-xs text-neutral-500">/ month</span>
            </div>
            {interval === 'annual' && (
              <p className="text-[11px] text-emerald-600 font-medium">Billed annually ($288/year)</p>
            )}

            <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800 space-y-2.5 text-xs text-neutral-700 dark:text-neutral-200">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-blue-600 shrink-0 font-bold" />
                <span><strong>Unlimited AI Quotes</strong> & Scope Drafting</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-blue-600 shrink-0 font-bold" />
                <span>Real-time n8n Webhook + Gmail Dispatch</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-blue-600 shrink-0 font-bold" />
                <span>Multi-industry price catalogues & custom margins</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-blue-600 shrink-0 font-bold" />
                <span>Human approval workflows (Owner / Staff / Approver)</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-blue-600 shrink-0 font-bold" />
                <span>Custom company logo on header & PDF</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-blue-600 shrink-0 font-bold" />
                <span>Revision audit trail & change requests</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-blue-600 shrink-0 font-bold" />
                <span>Priority webhook queue & fast delivery</span>
              </div>
            </div>
          </div>

          <div className="pt-8">
            <button
              type="button"
              disabled={currentPlan === 'pro'}
              onClick={() => handleSelectPlan('pro')}
              className={`w-full py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                currentPlan === 'pro'
                  ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-400 cursor-default'
                  : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white shadow-md hover:shadow-blue-500/25'
              }`}
            >
              {currentPlan === 'pro' ? 'Current Plan' : 'Switch to Pro Plan ($29/mo)'}
            </button>
          </div>
        </div>

        {/* Plan 3: Enterprise */}
        <div
          className={`rounded-2xl border p-6 sm:p-8 flex flex-col justify-between transition-all ${
            currentPlan === 'enterprise'
              ? 'border-blue-600 bg-white dark:bg-neutral-900 ring-2 ring-blue-600/20 shadow-md'
              : 'border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs'
          }`}
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-500 block">
                  Enterprise
                </span>
                <p className="text-xs text-neutral-500 mt-1">
                  For general contractors, multi-branch builders & high-value tenders.
                </p>
              </div>
              {currentPlan === 'enterprise' && (
                <span className="px-2 py-0.5 bg-blue-600 text-white rounded text-[10px] font-bold">
                  ACTIVE
                </span>
              )}
            </div>

            <div className="pt-2 flex items-baseline gap-1">
              <span className="text-4xl font-extrabold font-mono text-neutral-900 dark:text-neutral-100">
                ${interval === 'monthly' ? '79' : '65'}
              </span>
              <span className="text-xs text-neutral-500">/ month</span>
            </div>
            {interval === 'annual' && (
              <p className="text-[11px] text-emerald-600 font-medium">Billed annually ($780/year)</p>
            )}

            <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800 space-y-2.5 text-xs text-neutral-600 dark:text-neutral-300">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span><strong>Unlimited Team Seats</strong> & Roles</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Dedicated n8n cloud webhook endpoint</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Multi-branch price catalogues & custom margins</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Advanced deposit escrow & stage payments</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Custom API integration & full JSON exports</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>24/7 dedicated support & SLA</span>
              </div>
            </div>
          </div>

          <div className="pt-8">
            <button
              type="button"
              disabled={currentPlan === 'enterprise'}
              onClick={() => handleSelectPlan('enterprise')}
              className={`w-full py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                currentPlan === 'enterprise'
                  ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-400 cursor-default'
                  : 'bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 hover:opacity-90'
              }`}
            >
              {currentPlan === 'enterprise' ? 'Current Plan' : 'Switch to Enterprise ($79/mo)'}
            </button>
          </div>
        </div>
      </div>

      {/* Feature Comparison Matrix Table */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
          Feature Comparison Matrix
        </h3>
        <div className="border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden bg-white dark:bg-neutral-900 shadow-xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-50 dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-800 text-neutral-500">
              <tr>
                <th className="p-3.5 font-semibold">Capability</th>
                <th className="p-3.5 font-semibold">Basic ($10/mo)</th>
                <th className="p-3.5 font-semibold text-blue-600 dark:text-blue-400">Pro ($29/mo)</th>
                <th className="p-3.5 font-semibold">Enterprise ($79/mo)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
              <tr>
                <td className="p-3.5 font-medium">Monthly AI Quote Generations</td>
                <td className="p-3.5 font-mono">50 / month</td>
                <td className="p-3.5 font-mono font-bold text-blue-600">Unlimited</td>
                <td className="p-3.5 font-mono font-bold">Unlimited</td>
              </tr>
              <tr>
                <td className="p-3.5 font-medium">n8n Automation & Gmail Delivery</td>
                <td className="p-3.5 text-emerald-600 font-bold">✓ Included</td>
                <td className="p-3.5 text-emerald-600 font-bold">✓ Included</td>
                <td className="p-3.5 text-emerald-600 font-bold">✓ Dedicated Instance</td>
              </tr>
              <tr>
                <td className="p-3.5 font-medium">Custom Company Logo on Quotes & PDF</td>
                <td className="p-3.5 text-neutral-400">—</td>
                <td className="p-3.5 text-emerald-600 font-bold">✓ Included</td>
                <td className="p-3.5 text-emerald-600 font-bold">✓ Included</td>
              </tr>
              <tr>
                <td className="p-3.5 font-medium">Multi-Industry Catalogues (HVAC, Civil, etc.)</td>
                <td className="p-3.5 text-neutral-500">1 Catalogue</td>
                <td className="p-3.5 text-emerald-600 font-bold">✓ All Presets</td>
                <td className="p-3.5 text-emerald-600 font-bold">✓ Unlimited</td>
              </tr>
              <tr>
                <td className="p-3.5 font-medium">Human Approval Workflows & Governance</td>
                <td className="p-3.5 text-neutral-500">Standard</td>
                <td className="p-3.5 text-emerald-600 font-bold">✓ Role Segregation</td>
                <td className="p-3.5 text-emerald-600 font-bold">✓ Custom Permissions</td>
              </tr>
              <tr>
                <td className="p-3.5 font-medium">Currencies Supported</td>
                <td className="p-3.5 font-mono">PKR, USD, EUR, GBP</td>
                <td className="p-3.5 font-mono">All Global Currencies</td>
                <td className="p-3.5 font-mono">Multi-Currency Conversion</td>
              </tr>
              <tr>
                <td className="p-3.5 font-medium">Team Member Seats</td>
                <td className="p-3.5 font-mono">1 User</td>
                <td className="p-3.5 font-mono">Up to 5 Users</td>
                <td className="p-3.5 font-mono font-bold">Unlimited</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* In-App Invoices & Payment Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
        {/* Payment Method */}
        <div className="p-5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 space-y-3">
          <span className="font-bold text-neutral-900 dark:text-neutral-100 text-sm block">
            Payment Method
          </span>
          <div className="p-3 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-800/40 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-7 rounded bg-blue-900 text-white flex items-center justify-center font-bold font-mono text-[11px]">
                VISA
              </div>
              <div>
                <p className="font-semibold text-neutral-900 dark:text-neutral-100">
                  •••• •••• •••• 4242
                </p>
                <p className="text-[10px] text-neutral-400">Expires 08/29 · Primary</p>
              </div>
            </div>
            <span className="text-[10px] text-emerald-600 font-mono font-semibold">Active</span>
          </div>
          <p className="text-[11px] text-neutral-400">
            Next billing charge will occur on the 1st of next month.
          </p>
        </div>

        {/* Invoice Receipts */}
        <div className="p-5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 space-y-3">
          <span className="font-bold text-neutral-900 dark:text-neutral-100 text-sm block">
            Recent Subscription Receipts
          </span>
          <div className="space-y-2">
            {invoices.map((inv) => (
              <div
                key={inv.id}
                className="p-2.5 rounded-lg border border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-[11px]"
              >
                <div>
                  <span className="font-mono font-semibold text-neutral-800 dark:text-neutral-200 block">
                    {inv.id}
                  </span>
                  <span className="text-neutral-400 text-[10px]">{inv.date} · {inv.plan}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-neutral-900 dark:text-neutral-100">
                    {inv.amount}
                  </span>
                  <button
                    type="button"
                    onClick={() => showToast(`Downloaded invoice ${inv.id} (PDF)`, 'info')}
                    className="p-1 hover:text-blue-600 cursor-pointer"
                    title="Download invoice PDF"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
