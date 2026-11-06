import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { StorageService } from '../services/storage';
import { QuoteDocument } from '../components/quote/QuoteDocument';
import { BrandLogo } from '../components/ui/BrandLogo';
import { INDUSTRY_PRESETS, IndustryPreset } from '../services/industryPresets';
import {
  Building2,
  FileSpreadsheet,
  BookOpen,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Upload,
  Image,
  X,
  Sparkles,
  Layers,
} from 'lucide-react';

const ONBOARDING_STEP_KEY = 'aqg_onboarding_step_v1';

export const OnboardingPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    business,
    updateBusiness,
    quoteDefaults,
    updateQuoteDefaults,
    catalogue,
    quotes,
    customers,
    templates,
    completeOnboarding,
    showToast,
  } = useApp();

  const [step, setStep] = useState<number>(() => {
    const saved = localStorage.getItem(ONBOARDING_STEP_KEY);
    return saved ? parseInt(saved, 10) : 1;
  });

  // Selected Industry Preset
  const [selectedIndustryId, setSelectedIndustryId] = useState<string>('civil');

  // Step 1: Business details & Company Logo
  const [bName, setBName] = useState(business.name || 'Apex Civil & Building Services');
  const [bLegal, setBLegal] = useState(business.legalName || 'Apex Civil Contracting Ltd');
  const [bIndustry, setBIndustry] = useState(business.industry || 'Civil Engineering & Construction');
  const [bLogoUrl, setBLogoUrl] = useState(business.logoUrl || '');
  const [bEmail, setBEmail] = useState(business.email || 'estimating@apexcivil.example.com');
  const [bPhone, setBPhone] = useState(business.phone || '+1 (555) 382-9901');
  const [bStreet, setBStreet] = useState(business?.address?.street || '142 Ironworks Way');
  const [bCity, setBCity] = useState(business?.address?.city || 'Denver');
  const [bState, setBState] = useState(business?.address?.state || 'CO');
  const [bPostal, setBPostal] = useState(business?.address?.postalCode || '80202');
  const [bTax, setBTax] = useState(business?.taxRegistrationNumber || 'US-EIN-94-2849102');

  // Step 2: Quote defaults
  const [qPrefix, setQPrefix] = useState(quoteDefaults.quoteNumberPrefix || 'Q-2027-');
  const [qCurrency, setQCurrency] = useState(quoteDefaults.currency || 'USD');
  const [qValidity, setQValidity] = useState(quoteDefaults.defaultValidityDays || 30);
  const [qTaxRate, setQTaxRate] = useState(quoteDefaults.defaultTaxRate || 8.5);
  const [qDeposit, setQDeposit] = useState(quoteDefaults.defaultDepositPercent || 30);
  const [qTerms, setQTerms] = useState(
    quoteDefaults.defaultPaymentTerms ||
      '30% deposit upon acceptance, balance payable strictly 14 days following practical completion.'
  );

  // Step 4: Approval Preferences
  const [requireApproval, setRequireApproval] = useState(true);

  // Handle Industry Preset Switch
  const handleSelectIndustry = (preset: IndustryPreset) => {
    setSelectedIndustryId(preset.id);
    setBName(preset.sampleCompanyName);
    setBLegal(preset.sampleLegalName);
    setBIndustry(preset.name);
    setBEmail(preset.sampleEmail);
    setBPhone(preset.samplePhone);
    setQCurrency(preset.defaultCurrency);
    setQTaxRate(preset.defaultTaxRate);

    // Provide default logo preview if empty
    if (!bLogoUrl) {
      setBLogoUrl(
        preset.id === 'hvac'
          ? 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=200&h=80&q=80'
          : preset.id === 'electrical'
          ? 'https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?auto=format&fit=crop&w=200&h=80&q=80'
          : 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=200&h=80&q=80'
      );
    }

    showToast(`Loaded industry profile for ${preset.name}`, 'info');
  };

  // Logo file upload handler
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        showToast('Logo file size should be under 2MB', 'warning');
        return;
      }
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        const result = uploadEvent.target?.result as string;
        if (result) {
          setBLogoUrl(result);
          showToast('Company logo updated with live preview', 'success');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Persist current step
  const handleNextStep = (nextStep: number) => {
    localStorage.setItem(ONBOARDING_STEP_KEY, nextStep.toString());
    setStep(nextStep);
  };

  const handleFinishOnboarding = () => {
    // If selected industry has custom preset catalogue, update catalogue in storage
    const activePreset = INDUSTRY_PRESETS.find((p) => p.id === selectedIndustryId);
    if (activePreset) {
      const newItems = activePreset.catalogue.map((cat, idx) => ({
        ...cat,
        id: `cat_${activePreset.id}_${idx + 1}`,
        createdAt: new Date().toISOString(),
      }));
      StorageService.saveCatalogue(newItems);
    }

    // Save all business configurations including Company Logo
    updateBusiness({
      name: bName,
      legalName: bLegal,
      industry: bIndustry,
      logoUrl: bLogoUrl,
      email: bEmail,
      phone: bPhone,
      address: {
        street: bStreet,
        city: bCity,
        state: bState,
        postalCode: bPostal,
        country: 'United States',
      },
      taxRegistrationNumber: bTax,
    });

    updateQuoteDefaults({
      quoteNumberPrefix: qPrefix,
      currency: qCurrency,
      defaultValidityDays: qValidity,
      defaultTaxRate: qTaxRate,
      defaultDepositPercent: qDeposit,
      defaultPaymentTerms: qTerms,
      requireApprovalBeforeSending: requireApproval,
    });

    completeOnboarding();
    localStorage.removeItem(ONBOARDING_STEP_KEY);
    showToast('Business setup complete! Welcome to Quotivo.', 'success');
    navigate('/app');
  };

  const sampleQuote = quotes[0];
  const sampleCustomer = customers[0];
  const defaultTemplate = templates[0];

  return (
    <div className="min-h-screen bg-[#fafaf9] dark:bg-neutral-950 py-10 px-4 sm:px-6 max-w-4xl mx-auto space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="text-center space-y-3">
        <BrandLogo size="md" className="mx-auto" />
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
          Setup Your Quoting Engine
        </h1>
        <p className="text-xs text-neutral-500">
          Step {step} of 5 · Multi-industry catalogue setup, company logo & commercial rules.
        </p>
      </div>

      {/* Progress steps */}
      <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-3 text-xs">
        {[
          { num: 1, label: 'Business & Logo' },
          { num: 2, label: 'Defaults & Currency' },
          { num: 3, label: 'Price Catalogue' },
          { num: 4, label: 'Approvals' },
          { num: 5, label: 'Preview' },
        ].map((s) => (
          <div
            key={s.num}
            className={`flex items-center gap-1.5 font-medium ${
              step === s.num
                ? 'text-blue-600 dark:text-blue-400 font-semibold'
                : step > s.num
                ? 'text-emerald-600'
                : 'text-neutral-400'
            }`}
          >
            <span className="font-mono text-xs">{s.num}.</span>
            <span className="hidden sm:inline">{s.label}</span>
          </div>
        ))}
      </div>

      {/* STEP 1: Business Details & Company Logo & Industry Selector */}
      {step === 1 && (
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-6 sm:p-8 space-y-6 text-xs">
          {/* Industry Preset Selector */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-neutral-900 dark:text-neutral-100">
              Select Your Industry / Trade Sector
            </label>
            <p className="text-neutral-500 text-[11px]">
              Preloads industry-standard catalogue items, units, currency, and tax rules.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 pt-1">
              {INDUSTRY_PRESETS.map((p) => {
                const isSelected = selectedIndustryId === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleSelectIndustry(p)}
                    className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/40 text-blue-900 dark:text-blue-100 shadow-2xs font-semibold'
                        : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 bg-neutral-50/40 dark:bg-neutral-900'
                    }`}
                  >
                    <div className="text-xl mb-1.5">{p.sampleLogoBadge}</div>
                    <div>
                      <p className="text-xs font-semibold leading-tight">{p.name}</p>
                      <p className="text-[10px] text-neutral-400 font-mono mt-1">
                        {p.defaultCurrency} · {p.catalogue.length} SKUs
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Company Logo Setup Section */}
          <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-800/30 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-semibold text-neutral-900 dark:text-neutral-100 text-xs block">
                  Company Brand Logo
                </span>
                <p className="text-[11px] text-neutral-500">
                  Appears at the header of all client-facing quotations, proposals, and PDF exports.
                </p>
              </div>
              {bLogoUrl && (
                <button
                  type="button"
                  onClick={() => setBLogoUrl('')}
                  className="text-[11px] text-rose-600 hover:underline flex items-center gap-1"
                >
                  <X className="w-3 h-3" />
                  <span>Remove</span>
                </button>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              {/* Preview Box */}
              <div className="w-32 h-16 rounded-lg border border-dashed border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 flex items-center justify-center p-2 shrink-0 overflow-hidden shadow-2xs">
                {bLogoUrl ? (
                  <img
                    src={bLogoUrl}
                    alt="Company Logo Preview"
                    className="max-h-full max-w-full object-contain"
                  />
                ) : (
                  <div className="text-center text-neutral-400 text-[10px]">
                    <Image className="w-5 h-5 mx-auto mb-0.5 opacity-40" />
                    <span>No Logo</span>
                  </div>
                )}
              </div>

              {/* Upload Controls */}
              <div className="flex-1 space-y-2 w-full">
                <div className="flex items-center gap-2">
                  <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 rounded-lg text-xs font-semibold cursor-pointer hover:opacity-90 shadow-2xs">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Logo File</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                  </label>
                  <span className="text-[11px] text-neutral-400">or paste image URL:</span>
                </div>
                <input
                  type="url"
                  value={bLogoUrl}
                  onChange={(e) => setBLogoUrl(e.target.value)}
                  placeholder="https://yourcompany.com/logo.png"
                  className="w-full px-3 py-1.5 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-900 text-xs font-mono"
                />
              </div>
            </div>
          </div>

          {/* Business Core Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 font-medium text-neutral-700 dark:text-neutral-300">
                Trading / Brand Name *
              </label>
              <input
                type="text"
                required
                value={bName}
                onChange={(e) => setBName(e.target.value)}
                className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-neutral-50 dark:bg-neutral-800 text-xs font-semibold"
              />
            </div>

            <div>
              <label className="block mb-1 font-medium text-neutral-700 dark:text-neutral-300">
                Legal Entity Name
              </label>
              <input
                type="text"
                value={bLegal}
                onChange={(e) => setBLegal(e.target.value)}
                className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-neutral-50 dark:bg-neutral-800 text-xs"
              />
            </div>

            <div>
              <label className="block mb-1 font-medium text-neutral-700 dark:text-neutral-300">
                Business Email
              </label>
              <input
                type="email"
                value={bEmail}
                onChange={(e) => setBEmail(e.target.value)}
                className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-neutral-50 dark:bg-neutral-800 text-xs font-mono"
              />
            </div>

            <div>
              <label className="block mb-1 font-medium text-neutral-700 dark:text-neutral-300">
                Telephone
              </label>
              <input
                type="text"
                value={bPhone}
                onChange={(e) => setBPhone(e.target.value)}
                className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-neutral-50 dark:bg-neutral-800 text-xs font-mono"
              />
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-neutral-100 dark:border-neutral-800">
            <span className="font-semibold text-neutral-600 uppercase text-[10px] block">
              Premises Address
            </span>
            <input
              type="text"
              value={bStreet}
              onChange={(e) => setBStreet(e.target.value)}
              placeholder="Street..."
              className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-neutral-50 dark:bg-neutral-800 text-xs"
            />
            <div className="grid grid-cols-3 gap-2">
              <input
                type="text"
                value={bCity}
                onChange={(e) => setBCity(e.target.value)}
                placeholder="City"
                className="px-3 py-2 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-neutral-50 dark:bg-neutral-800 text-xs"
              />
              <input
                type="text"
                value={bState}
                onChange={(e) => setBState(e.target.value)}
                placeholder="State"
                className="px-3 py-2 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-neutral-50 dark:bg-neutral-800 text-xs"
              />
              <input
                type="text"
                value={bPostal}
                onChange={(e) => setBPostal(e.target.value)}
                placeholder="Zip / Postal"
                className="px-3 py-2 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-neutral-50 dark:bg-neutral-800 text-xs font-mono"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-neutral-100 dark:border-neutral-800">
            <button
              type="button"
              onClick={() => handleNextStep(2)}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold"
            >
              <span>Continue to Quoting Defaults</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Quote Defaults & Currencies */}
      {step === 2 && (
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-6 sm:p-8 space-y-5 text-xs">
          <div className="space-y-1">
            <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
              Quotation Defaults & Currency Rules
            </h2>
            <p className="text-neutral-500 text-[11px]">
              Set numbering sequence, default sales tax rate, and standard deposit percent.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block mb-1 font-medium text-neutral-700 dark:text-neutral-300">
                Quote Prefix
              </label>
              <input
                type="text"
                value={qPrefix}
                onChange={(e) => setQPrefix(e.target.value)}
                className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-neutral-50 dark:bg-neutral-800 text-xs font-mono"
              />
            </div>

            <div>
              <label className="block mb-1 font-medium text-neutral-700 dark:text-neutral-300">
                Quotation Currency
              </label>
              <select
                value={qCurrency}
                onChange={(e) => setQCurrency(e.target.value)}
                className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-neutral-50 dark:bg-neutral-800 text-xs font-mono"
              >
                <option value="PKR">PKR (₨) - Pakistani Rupee</option>
                <option value="USD">USD ($) - US Dollar</option>
                <option value="EUR">EUR (€) - Euro</option>
                <option value="GBP">GBP (£) - British Pound</option>
                <option value="CAD">CAD (C$) - Canadian Dollar</option>
                <option value="AUD">AUD (A$) - Australian Dollar</option>
                <option value="AED">AED (د.إ) - UAE Dirham</option>
                <option value="SAR">SAR (﷼) - Saudi Riyal</option>
              </select>
            </div>

            <div>
              <label className="block mb-1 font-medium text-neutral-700 dark:text-neutral-300">
                Validity (Days)
              </label>
              <input
                type="number"
                value={qValidity}
                onChange={(e) => setQValidity(Number(e.target.value) || 30)}
                className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-neutral-50 dark:bg-neutral-800 text-xs font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 font-medium text-neutral-700 dark:text-neutral-300">
                Default Tax Rate (%)
              </label>
              <input
                type="number"
                step="0.1"
                value={qTaxRate}
                onChange={(e) => setQTaxRate(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-neutral-50 dark:bg-neutral-800 text-xs font-mono"
              />
            </div>

            <div>
              <label className="block mb-1 font-medium text-neutral-700 dark:text-neutral-300">
                Standard Deposit Required (%)
              </label>
              <input
                type="number"
                step="5"
                min="0"
                max="100"
                value={qDeposit}
                onChange={(e) => setQDeposit(Number(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-neutral-50 dark:bg-neutral-800 text-xs font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block mb-1 font-medium text-neutral-700 dark:text-neutral-300">
              Commercial Payment Terms
            </label>
            <textarea
              value={qTerms}
              onChange={(e) => setQTerms(e.target.value)}
              rows={2}
              className="w-full p-2.5 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-neutral-50 dark:bg-neutral-800 text-xs"
            />
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-neutral-100 dark:border-neutral-800">
            <button
              type="button"
              onClick={() => handleNextStep(1)}
              className="inline-flex items-center gap-1 text-neutral-600 font-medium"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
            <button
              type="button"
              onClick={() => handleNextStep(3)}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold"
            >
              <span>Continue to Catalogue</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Price Catalogue Seed */}
      {step === 3 && (
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-6 sm:p-8 space-y-5 text-xs">
          <div className="space-y-1">
            <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
              Price Catalogue Items
            </h2>
            <p className="text-neutral-500 text-[11px]">
              Review the initial trade rate items configured for your business.
            </p>
          </div>

          {/* Active Preset Catalogue Summary */}
          {(() => {
            const currentPreset =
              INDUSTRY_PRESETS.find((p) => p.id === selectedIndustryId) ||
              INDUSTRY_PRESETS[0];
            return (
              <div className="space-y-3">
                <div className="p-4 bg-neutral-50 dark:bg-neutral-800/60 rounded-xl border border-neutral-200 dark:border-neutral-700/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                      <span>{currentPreset.sampleLogoBadge}</span>
                      <span>{currentPreset.name} Catalogue</span>
                    </span>
                    <span className="font-mono text-emerald-600 font-semibold">
                      {currentPreset.catalogue.length} Trade Items
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-500 leading-relaxed">
                    Rates are stored in <strong className="text-neutral-800 dark:text-neutral-200">{qCurrency}</strong> and synchronized with the n8n automation engine.
                  </p>
                </div>

                <div className="border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden divide-y divide-neutral-100 dark:divide-neutral-800">
                  {currentPreset.catalogue.slice(0, 5).map((item, idx) => (
                    <div key={idx} className="p-2.5 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-medium text-neutral-800 dark:text-neutral-200 block">
                          {item.name}
                        </span>
                        <span className="text-[10px] text-neutral-400 font-mono">
                          {item.code} · per {item.unit}
                        </span>
                      </div>
                      <span className="font-mono font-semibold text-neutral-900 dark:text-neutral-100">
                        {item.unitPrice.toLocaleString()} {qCurrency}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}

          <div className="flex items-center justify-between pt-4 border-t border-neutral-100 dark:border-neutral-800">
            <button
              type="button"
              onClick={() => handleNextStep(2)}
              className="inline-flex items-center gap-1 text-neutral-600 font-medium"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
            <button
              type="button"
              onClick={() => handleNextStep(4)}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold"
            >
              <span>Continue to Governance</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: Approval Preferences */}
      {step === 4 && (
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-6 sm:p-8 space-y-5 text-xs">
          <div className="space-y-1">
            <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
              Approval & Delivery Governance
            </h2>
            <p className="text-neutral-500 text-[11px]">
              Enforce human verification before quotes can be emailed to clients.
            </p>
          </div>

          <div className="space-y-3">
            <label className="flex items-start gap-3 p-3.5 rounded-lg border border-neutral-200 dark:border-neutral-800 cursor-pointer">
              <input
                type="checkbox"
                checked={requireApproval}
                onChange={(e) => setRequireApproval(e.target.checked)}
                className="mt-0.5 rounded text-blue-600"
              />
              <div>
                <span className="font-semibold text-neutral-900 dark:text-neutral-100 block">
                  Require Human Approval Before Sending (Recommended)
                </span>
                <p className="text-neutral-500 text-[11px] mt-0.5 leading-relaxed">
                  Quotations cannot be dispatched via n8n and Gmail until an Owner or Approver signs off. Unmatched items must have rates set.
                </p>
              </div>
            </label>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-neutral-100 dark:border-neutral-800">
            <button
              type="button"
              onClick={() => handleNextStep(3)}
              className="inline-flex items-center gap-1 text-neutral-600 font-medium"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
            <button
              type="button"
              onClick={() => handleNextStep(5)}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold"
            >
              <span>Preview Live Quote</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 5: Preview & Finish */}
      {step === 5 && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-6 sm:p-8 space-y-4 text-xs text-center">
            <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
            <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
              Workspace Configured & Verified
            </h2>
            <p className="text-neutral-500 max-w-md mx-auto text-xs leading-relaxed">
              Below is a live preview of how your quotes will look featuring your Company Logo and business details.
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={handleFinishOnboarding}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-xs shadow-xs"
              >
                <span>Enter Workspace Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden p-4 bg-neutral-100 dark:bg-neutral-950">
            <QuoteDocument
              quote={sampleQuote}
              customer={sampleCustomer}
              business={{
                name: bName,
                legalName: bLegal,
                industry: bIndustry,
                logoUrl: bLogoUrl,
                email: bEmail,
                phone: bPhone,
                address: {
                  street: bStreet,
                  city: bCity,
                  state: bState,
                  postalCode: bPostal,
                  country: 'United States',
                },
                taxRegistrationNumber: bTax,
              }}
              template={defaultTemplate}
            />
          </div>
        </div>
      )}
    </div>
  );
};
