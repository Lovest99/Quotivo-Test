import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Check,
  Zap,
  Shield,
  X,
  CreditCard,
  Building2,
  ArrowRight,
  HelpCircle,
} from 'lucide-react';

export const PricingModal: React.FC = () => {
  const {
    isUpgradeModalOpen,
    setUpgradeModalOpen,
    currentPlan,
    billingInterval,
    changePlan,
    showToast,
  } = useApp();

  const [interval, setInterval] = useState<'monthly' | 'annual'>(billingInterval);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isUpgradeModalOpen) return null;

  const handleSelectPlan = (plan: 'basic' | 'pro' | 'enterprise') => {
    setIsProcessing(true);
    setTimeout(() => {
      changePlan(plan, interval);
      setIsProcessing(false);
      setUpgradeModalOpen(false);
    }, 400);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                Commercial Quoting Engine
              </span>
              <span className="text-xs text-neutral-400">· Active: {currentPlan.toUpperCase()}</span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold tracking-tight bg-gradient-to-r from-neutral-900 via-blue-900 to-indigo-900 dark:from-white dark:via-blue-200 dark:to-indigo-300 bg-clip-text text-transparent mt-1">
              Upgrade Your Quoting Capacity
            </h2>
          </div>

          <button
            onClick={() => setUpgradeModalOpen(false)}
            className="p-1.5 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6">
          {/* Interval Switcher */}
          <div className="flex items-center justify-center gap-3">
            <span
              className={`text-xs font-medium ${
                interval === 'monthly'
                  ? 'text-neutral-900 dark:text-neutral-100 font-semibold'
                  : 'text-neutral-400'
              }`}
            >
              Monthly Billing
            </span>
            <button
              type="button"
              onClick={() => setInterval(interval === 'monthly' ? 'annual' : 'monthly')}
              className="relative inline-flex h-6 w-11 items-center rounded-full bg-neutral-200 dark:bg-neutral-700 transition-colors cursor-pointer"
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-blue-600 transition-transform ${
                  interval === 'annual' ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <span
              className={`text-xs font-medium flex items-center gap-1.5 ${
                interval === 'annual'
                  ? 'text-neutral-900 dark:text-neutral-100 font-semibold'
                  : 'text-neutral-400'
              }`}
            >
              <span>Annual Billing</span>
              <span className="px-1.5 py-0.2 text-[9px] font-bold uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 rounded">
                Save 20%
              </span>
            </span>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Basic Plan */}
            <div
              className={`p-5 rounded-xl border flex flex-col justify-between transition-all ${
                currentPlan === 'basic'
                  ? 'border-blue-600 bg-blue-50/20 dark:bg-blue-950/20 shadow-xs'
                  : 'border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/60'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                    Basic Plan
                  </span>
                  {currentPlan === 'basic' && (
                    <span className="px-2 py-0.5 bg-blue-600 text-white rounded text-[10px] font-bold">
                      CURRENT
                    </span>
                  )}
                </div>

                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold font-mono text-neutral-900 dark:text-neutral-100">
                    ${interval === 'monthly' ? '10' : '8'}
                  </span>
                  <span className="text-xs text-neutral-500">/ mo</span>
                </div>

                <p className="text-[11px] text-neutral-500">
                  Ideal for solo trade contractors & independent specialists.
                </p>

                <div className="space-y-2 pt-2 border-t border-neutral-200/60 dark:border-neutral-800 text-xs text-neutral-600 dark:text-neutral-300">
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>50 AI quotes / month</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>n8n webhook + Gmail delivery</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>1 Price Catalogue (PKR, USD, EUR)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Unmatched items alerts</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Standard PDF downloads</span>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="button"
                  disabled={currentPlan === 'basic' || isProcessing}
                  onClick={() => handleSelectPlan('basic')}
                  className={`w-full py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    currentPlan === 'basic'
                      ? 'bg-neutral-200 dark:bg-neutral-800 text-neutral-400 cursor-default'
                      : 'bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 hover:opacity-90'
                  }`}
                >
                  {currentPlan === 'basic' ? 'Current Active Plan' : 'Downgrade to Basic ($10/mo)'}
                </button>
              </div>
            </div>

            {/* Pro Plan */}
            <div
              className={`p-5 rounded-xl border-2 flex flex-col justify-between transition-all relative ${
                currentPlan === 'pro'
                  ? 'border-blue-600 bg-blue-50/30 dark:bg-blue-950/30 shadow-md'
                  : 'border-blue-500 bg-white dark:bg-neutral-900 shadow-sm'
              }`}
            >
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-2.5 py-0.5 bg-blue-600 text-white rounded-full text-[9px] font-bold uppercase tracking-wider">
                Most Popular
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                    Pro Plan
                  </span>
                  {currentPlan === 'pro' && (
                    <span className="px-2 py-0.5 bg-blue-600 text-white rounded text-[10px] font-bold">
                      CURRENT
                    </span>
                  )}
                </div>

                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold font-mono text-neutral-900 dark:text-neutral-100">
                    ${interval === 'monthly' ? '29' : '24'}
                  </span>
                  <span className="text-xs text-neutral-500">/ mo</span>
                </div>

                <p className="text-[11px] text-neutral-500">
                  For growing contractors & multi-estimator operations.
                </p>

                <div className="space-y-2 pt-2 border-t border-neutral-200/60 dark:border-neutral-800 text-xs text-neutral-700 dark:text-neutral-200">
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-blue-600 shrink-0 font-bold" />
                    <span><strong>Unlimited AI Quotes</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-blue-600 shrink-0 font-bold" />
                    <span>Real-time n8n Webhook + Gmail Dispatch</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-blue-600 shrink-0 font-bold" />
                    <span>Multi-industry trade catalogues</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-blue-600 shrink-0 font-bold" />
                    <span>Human revision approval workflows</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-blue-600 shrink-0 font-bold" />
                    <span>Custom Company Logo on Quotes & PDF</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-blue-600 shrink-0 font-bold" />
                    <span>Audit history & change requests</span>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="button"
                  disabled={currentPlan === 'pro' || isProcessing}
                  onClick={() => handleSelectPlan('pro')}
                  className={`w-full py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    currentPlan === 'pro'
                      ? 'bg-neutral-200 dark:bg-neutral-800 text-neutral-400 cursor-default'
                      : 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs'
                  }`}
                >
                  {currentPlan === 'pro' ? 'Current Active Plan' : 'Switch to Pro Plan ($29/mo)'}
                </button>
              </div>
            </div>

            {/* Enterprise Plan */}
            <div
              className={`p-5 rounded-xl border flex flex-col justify-between transition-all ${
                currentPlan === 'enterprise'
                  ? 'border-blue-600 bg-blue-50/20 dark:bg-blue-950/20 shadow-xs'
                  : 'border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/60'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                    Enterprise
                  </span>
                  {currentPlan === 'enterprise' && (
                    <span className="px-2 py-0.5 bg-blue-600 text-white rounded text-[10px] font-bold">
                      CURRENT
                    </span>
                  )}
                </div>

                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold font-mono text-neutral-900 dark:text-neutral-100">
                    ${interval === 'monthly' ? '79' : '65'}
                  </span>
                  <span className="text-xs text-neutral-500">/ mo</span>
                </div>

                <p className="text-[11px] text-neutral-500">
                  For engineering firms, MEP operators & commercial builders.
                </p>

                <div className="space-y-2 pt-2 border-t border-neutral-200/60 dark:border-neutral-800 text-xs text-neutral-600 dark:text-neutral-300">
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span><strong>Unlimited Team Seats</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Dedicated n8n cloud webhook SLA</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Multi-branch price catalogues</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Stage payments & escrow tracking</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>24/7 priority support & engineer</span>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="button"
                  disabled={currentPlan === 'enterprise' || isProcessing}
                  onClick={() => handleSelectPlan('enterprise')}
                  className={`w-full py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    currentPlan === 'enterprise'
                      ? 'bg-neutral-200 dark:bg-neutral-800 text-neutral-400 cursor-default'
                      : 'bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 hover:opacity-90'
                  }`}
                >
                  {currentPlan === 'enterprise' ? 'Current Active Plan' : 'Switch to Enterprise ($79/mo)'}
                </button>
              </div>
            </div>
          </div>

          {/* Secure Payment Note */}
          <div className="p-3 bg-neutral-50 dark:bg-neutral-800/40 rounded-xl border border-neutral-200 dark:border-neutral-700/80 flex items-center justify-between text-xs text-neutral-500">
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-neutral-400" />
              <span>Simulated payment test mode active · No credit card charge required</span>
            </div>
            <span className="font-mono text-[10px] text-emerald-600 font-semibold">SSL 256-bit Encrypted</span>
          </div>
        </div>
      </div>
    </div>
  );
};
