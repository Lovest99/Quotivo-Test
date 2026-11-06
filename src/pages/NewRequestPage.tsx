import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { StorageService } from '../services/storage';
import { quoteAdapter } from '../services/quoteAdapter';
import { Customer, CustomerRequestDraft } from '../types';
import { CurrencyAmount } from '../components/ui/CurrencyAmount';
import {
  User,
  MessageSquare,
  BookOpen,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  UploadCloud,
  FileText,
  X,
  Sparkles,
  AlertCircle,
  HelpCircle,
  Loader2,
} from 'lucide-react';

export const NewRequestPage: React.FC = () => {
  const navigate = useNavigate();
  const { customers, catalogue, quoteDefaults, saveCustomer, showToast } = useApp();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Step 1: Customer state
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('cust_01');
  const [isAddingNewCustomer, setIsAddingNewCustomer] = useState(false);
  const [newCustType, setNewCustType] = useState<'business' | 'individual'>('business');
  const [newCustName, setNewCustName] = useState('');
  const [newCustCompany, setNewCustCompany] = useState('');
  const [newCustEmail, setNewCustEmail] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');
  const [newCustStreet, setNewCustStreet] = useState('');
  const [newCustCity, setNewCustCity] = useState('');
  const [newCustState, setNewCustState] = useState('');
  const [newCustPostal, setNewCustPostal] = useState('');
  const [newCustSiteAddress, setNewCustSiteAddress] = useState('');

  // Step 2: Request description & attachments
  const [requestTitle, setRequestTitle] = useState('Boundary Wall Structural Reinstatement');
  const [serviceCategory, setServiceCategory] = useState('Masonry & Civil Engineering');
  const [requestText, setRequestText] = useState(
    'Please quote for repairing a damaged boundary wall, including labour, materials, and site cleanup. Struck by truck at south perimeter.'
  );
  const [requestedDate, setRequestedDate] = useState('');
  const [budgetRange, setBudgetRange] = useState('');
  const [attachments, setAttachments] = useState<CustomerRequestDraft['attachments']>([
    {
      id: 'att_01',
      name: 'site_photo_south_perimeter.jpg',
      size: '2.4 MB',
      type: 'image/jpeg',
    },
  ]);

  // Step 3: Pricing context
  const [currency, setCurrency] = useState(quoteDefaults.currency);
  const [selectedCatalogueIds, setSelectedCatalogueIds] = useState<string[]>([
    'cat_01',
    'cat_03',
    'cat_06',
    'cat_08',
  ]);
  const [knownQuantities, setKnownQuantities] = useState<Record<string, number>>({
    cat_01: 25.2,
    cat_03: 6,
    cat_06: 24,
    cat_08: 14,
  });
  const [additionalNotes, setAdditionalNotes] = useState('Wall length estimated at 14m. Height 1.8m. Confirm on site.');

  // Autosave Draft restoration
  useEffect(() => {
    const saved = StorageService.getCustomerRequestDraft();
    if (saved) {
      setSelectedCustomerId(saved.customerId || 'cust_01');
      setRequestTitle(saved.title || '');
      setServiceCategory(saved.category || '');
      setRequestText(saved.description || '');
      setCurrency(saved.currency || quoteDefaults.currency);
      setSelectedCatalogueIds(saved.selectedCatalogueIds || []);
      setAdditionalNotes(saved.additionalInstructions || '');
      if (saved.attachments) setAttachments(saved.attachments);
    }
  }, [quoteDefaults.currency]);

  // Save draft on changes
  const saveDraftLocally = () => {
    const draft: CustomerRequestDraft = {
      id: `draft_${Date.now()}`,
      customerId: selectedCustomerId,
      title: requestTitle,
      category: serviceCategory,
      description: requestText,
      requestedDate,
      budgetRange,
      currency,
      selectedCatalogueIds,
      additionalInstructions: additionalNotes,
      attachments,
      createdAt: new Date().toISOString(),
    };
    StorageService.saveCustomerRequestDraft(draft);
    showToast('Request draft saved locally', 'info');
  };

  const handleCreateCustomerInline = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustName || !newCustEmail) {
      showToast('Name and email are required for the customer record', 'warning');
      return;
    }

    const created = saveCustomer({
      type: newCustType,
      name: newCustName,
      companyName: newCustCompany,
      email: newCustEmail,
      phone: newCustPhone,
      billingAddress: {
        street: newCustStreet,
        city: newCustCity,
        state: newCustState,
        postalCode: newCustPostal,
        country: 'United States',
      },
      siteAddress: newCustSiteAddress
        ? {
            street: newCustSiteAddress,
            city: newCustCity,
            state: newCustState,
            postalCode: newCustPostal,
            country: 'United States',
          }
        : undefined,
    });

    setSelectedCustomerId(created.id);
    setIsAddingNewCustomer(false);
  };

  const handleCatalogueToggle = (id: string) => {
    if (selectedCatalogueIds.includes(id)) {
      setSelectedCatalogueIds(selectedCatalogueIds.filter((i) => i !== id));
      const copy = { ...knownQuantities };
      delete copy[id];
      setKnownQuantities(copy);
    } else {
      setSelectedCatalogueIds([...selectedCatalogueIds, id]);
      setKnownQuantities({ ...knownQuantities, [id]: 1 });
    }
  };

  const handleSimulateAttachmentUpload = () => {
    const id = `att_${Date.now()}`;
    const newAtt = {
      id,
      name: `customer_scope_brief_${attachments.length + 1}.pdf`,
      size: '1.1 MB',
      type: 'application/pdf',
    };
    setAttachments([...attachments, newAtt]);
    showToast('Attachment uploaded (Simulated file storage)', 'info');
  };

  const handleRemoveAttachment = (id: string) => {
    setAttachments(attachments.filter((a) => a.id !== id));
  };

  // Submit and launch Generation Job
  const handleGenerateQuote = async () => {
    const activeCustomer = customers.find((c) => c.id === selectedCustomerId);
    if (!activeCustomer) {
      showToast('Please select or specify a customer first.', 'warning');
      setStep(1);
      return;
    }
    if (!requestText.trim()) {
      showToast('Please provide the customer request details.', 'warning');
      setStep(2);
      return;
    }

    const requestId = `req_${Date.now()}`;
    const idempotencyKey = `idem_${requestId}_${Date.now()}`;

    // Start generation with typed service adapter
    const { jobId } = await quoteAdapter.startGeneration({
      requestId,
      businessId: 'biz_apex_01',
      customerId: activeCustomer.id,
      customerDetails: activeCustomer,
      requestText: `${requestTitle}\n\n${requestText}`,
      selectedCatalogueItemIds: selectedCatalogueIds,
      currency,
      knownQuantities,
      additionalNotes,
      idempotencyKey,
    });

    // Clear draft and navigate to generating screen
    StorageService.clearCustomerRequestDraft();
    navigate(`/app/requests/${jobId}/generating`);
  };

  const activeCustomer = customers.find((c) => c.id === selectedCustomerId);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-8 animate-in fade-in duration-200">
      {/* Wizard Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200 dark:border-neutral-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
            New Customer Request to Quotation
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Step {step} of 4 · AI will interpret details and match items against your price catalogue.
          </p>
        </div>

        <button
          type="button"
          onClick={saveDraftLocally}
          className="text-xs text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 underline self-start sm:self-auto"
        >
          Save Draft & Resume Later
        </button>
      </div>

      {/* Sticky Step Indicator Bar */}
      <div className="sticky top-14 z-20 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-3 bg-[#fafaf9]/95 dark:bg-neutral-950/95 backdrop-blur-md border-b border-neutral-200/80 dark:border-neutral-800 shadow-2xs">
        <div className="grid grid-cols-4 gap-2 text-xs max-w-4xl mx-auto">
          {[
            { num: 1, title: 'Customer', icon: User },
            { num: 2, title: 'Request Text', icon: MessageSquare },
            { num: 3, title: 'Price Context', icon: BookOpen },
            { num: 4, title: 'Review & Run', icon: Sparkles },
          ].map((s) => {
            const Icon = s.icon;
            const isActive = step === s.num;
            const isPassed = step > s.num;

            return (
              <button
                key={s.num}
                onClick={() => setStep(s.num as any)}
                className={`p-2.5 sm:p-3 rounded-xl border text-left transition-all flex items-center gap-2 sm:gap-2.5 cursor-pointer ${
                  isActive
                    ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/30 text-blue-900 dark:text-blue-100 font-semibold shadow-xs'
                    : isPassed
                    ? 'border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300'
                    : 'border-neutral-100 dark:border-neutral-800/60 bg-neutral-50/50 dark:bg-neutral-900/40 text-neutral-400'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center font-mono text-xs shrink-0 ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : isPassed
                      ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                      : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-500'
                  }`}
                >
                  {isPassed ? <CheckCircle2 className="w-3.5 h-3.5" /> : s.num}
                </div>
                <span className="hidden sm:inline truncate">{s.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* STEP 1: Customer Selection or Inline Creation */}
      {step === 1 && (
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-5 sm:p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
              Select or Register Client
            </h2>
            <button
              type="button"
              onClick={() => setIsAddingNewCustomer(!isAddingNewCustomer)}
              className="text-xs text-blue-600 dark:text-blue-400 font-medium hover:underline"
            >
              {isAddingNewCustomer ? 'Choose existing customer' : '+ Add new customer inline'}
            </button>
          </div>

          {!isAddingNewCustomer ? (
            <div className="space-y-4">
              <label className="text-xs text-neutral-600 dark:text-neutral-400 block">
                Existing Customer Directory:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {customers.map((c) => {
                  const isSelected = selectedCustomerId === c.id;
                  return (
                    <div
                      key={c.id}
                      onClick={() => setSelectedCustomerId(c.id)}
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50/30 dark:bg-blue-950/20 ring-1 ring-blue-600'
                          : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 bg-white dark:bg-neutral-900'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-semibold text-neutral-900 dark:text-neutral-100">{c.name}</p>
                          {c.companyName && (
                            <p className="text-[11px] text-neutral-600 dark:text-neutral-400">{c.companyName}</p>
                          )}
                        </div>
                        <span className="text-[10px] uppercase font-mono text-neutral-400">{c.type}</span>
                      </div>
                      <p className="text-[11px] text-neutral-500 mt-2 truncate">{c.email} · {c.phone}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <form onSubmit={handleCreateCustomerInline} className="space-y-4 text-xs">
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="custType"
                    checked={newCustType === 'business'}
                    onChange={() => setNewCustType('business')}
                  />
                  <span>Commercial / Business</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="custType"
                    checked={newCustType === 'individual'}
                    onChange={() => setNewCustType('individual')}
                  />
                  <span>Individual / Residential</span>
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 text-neutral-600 dark:text-neutral-400">Contact Name *</label>
                  <input
                    type="text"
                    required
                    value={newCustName}
                    onChange={(e) => setNewCustName(e.target.value)}
                    placeholder="Jane Doe"
                    className="w-full px-3 py-1.5 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-neutral-50 dark:bg-neutral-800"
                  />
                </div>
                {newCustType === 'business' && (
                  <div>
                    <label className="block mb-1 text-neutral-600 dark:text-neutral-400">Company Name</label>
                    <input
                      type="text"
                      value={newCustCompany}
                      onChange={(e) => setNewCustCompany(e.target.value)}
                      placeholder="Acme Construction Ltd"
                      className="w-full px-3 py-1.5 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-neutral-50 dark:bg-neutral-800"
                    />
                  </div>
                )}
                <div>
                  <label className="block mb-1 text-neutral-600 dark:text-neutral-400">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={newCustEmail}
                    onChange={(e) => setNewCustEmail(e.target.value)}
                    placeholder="jane@company.com"
                    className="w-full px-3 py-1.5 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-neutral-50 dark:bg-neutral-800"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-neutral-600 dark:text-neutral-400">Phone</label>
                  <input
                    type="text"
                    value={newCustPhone}
                    onChange={(e) => setNewCustPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="w-full px-3 py-1.5 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-neutral-50 dark:bg-neutral-800"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1 text-neutral-600 dark:text-neutral-400">Billing Street Address</label>
                <input
                  type="text"
                  value={newCustStreet}
                  onChange={(e) => setNewCustStreet(e.target.value)}
                  placeholder="100 Industrial Parkway"
                  className="w-full px-3 py-1.5 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-neutral-50 dark:bg-neutral-800"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <input
                  type="text"
                  value={newCustCity}
                  onChange={(e) => setNewCustCity(e.target.value)}
                  placeholder="City"
                  className="px-3 py-1.5 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-neutral-50 dark:bg-neutral-800"
                />
                <input
                  type="text"
                  value={newCustState}
                  onChange={(e) => setNewCustState(e.target.value)}
                  placeholder="State"
                  className="px-3 py-1.5 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-neutral-50 dark:bg-neutral-800"
                />
                <input
                  type="text"
                  value={newCustPostal}
                  onChange={(e) => setNewCustPostal(e.target.value)}
                  placeholder="Zip"
                  className="px-3 py-1.5 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-neutral-50 dark:bg-neutral-800"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="px-4 py-2 bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 rounded-lg font-medium"
                >
                  Save & Select Customer
                </button>
              </div>
            </form>
          )}

          <div className="flex justify-end pt-4 border-t border-neutral-100 dark:border-neutral-800">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold"
            >
              <span>Continue to Request Details</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Customer Request & Message Paste */}
      {step === 2 && (
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-5 sm:p-6 space-y-6">
          <div>
            <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
              Customer Brief & Scope Description
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              Paste directly from WhatsApp, email, or client voicemail transcript.
            </p>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block mb-1 font-medium text-neutral-700 dark:text-neutral-300">
                Quotation Working Title:
              </label>
              <input
                type="text"
                value={requestTitle}
                onChange={(e) => setRequestTitle(e.target.value)}
                placeholder="e.g. Boundary Wall Structural Reinstatement"
                className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-neutral-50 dark:bg-neutral-800 text-sm font-semibold text-neutral-900 dark:text-neutral-100"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block mb-1 font-medium text-neutral-700 dark:text-neutral-300">
                  Service Category:
                </label>
                <input
                  type="text"
                  value={serviceCategory}
                  onChange={(e) => setServiceCategory(e.target.value)}
                  placeholder="e.g. Masonry & Civil Works"
                  className="w-full px-3 py-1.5 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-neutral-50 dark:bg-neutral-800"
                />
              </div>

              <div>
                <label className="block mb-1 font-medium text-neutral-700 dark:text-neutral-300">
                  Target Completion Date (Optional):
                </label>
                <input
                  type="date"
                  value={requestedDate}
                  onChange={(e) => setRequestedDate(e.target.value)}
                  className="w-full px-3 py-1.5 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-neutral-50 dark:bg-neutral-800"
                />
              </div>
            </div>

            {/* Quick Demo Scope Fillers */}
            <div className="p-3 rounded-lg bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-900/40 space-y-1.5">
              <span className="text-[10px] uppercase font-bold text-blue-700 dark:text-blue-400 tracking-wider flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                <span>Auto-Fill Sample Commercial Scope</span>
              </span>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setRequestTitle('Split AC 2-ton installation & Copper Piping');
                    setServiceCategory('HVAC & Climate Control');
                    setRequestText('2-ton split AC, 2-bedroom apartment, ground floor. Urgent supply & installation before summer with 10 meters copper pipe.');
                    setCurrency('PKR');
                    // Find or create customer John Doe
                    const john = customers.find((c) => c.email === 'john@example.com');
                    if (john) {
                      setSelectedCustomerId(john.id);
                    } else {
                      const created = saveCustomer({
                        type: 'individual',
                        name: 'John Doe',
                        email: 'john@example.com',
                        phone: '+92 300 1234567',
                        billingAddress: {
                          street: 'Model Town, Block C',
                          city: 'Lahore',
                          state: 'Punjab',
                          postalCode: '54700',
                          country: 'Pakistan',
                        },
                      });
                      setSelectedCustomerId(created.id);
                    }
                    showToast('Loaded n8n verified test case: AC Installation (PKR · Lahore)', 'success');
                  }}
                  className="px-2.5 py-1 rounded-md bg-blue-600 text-white text-[11px] font-semibold hover:bg-blue-700 transition-colors shadow-2xs flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3 text-blue-200" />
                  <span>n8n Test: AC Install (PKR / Lahore)</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setRequestTitle('5,000 sq ft Office Acoustic Partitions & Power');
                    setServiceCategory('Commercial Fit-Out');
                    setRequestText('We need a full turnkey quotation for fitting out our 5,000 sq ft office: 85 linear m of acoustic double-plasterboard stud walls, 4 solid core doorsets with vision panels, 18 ring main twin sockets, and final power sweep handover.');
                    setSelectedCatalogueIds(['cat_01', 'cat_03', 'cat_08']);
                  }}
                  className="px-2 py-0.5 rounded bg-white dark:bg-neutral-800 border border-blue-200 dark:border-blue-800 text-[11px] text-blue-700 dark:text-blue-300 font-medium hover:bg-blue-100/50 transition-colors"
                >
                  Office Fit-Out
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setRequestTitle('Dual 14kW Server Room AC & Fresh Air Ducting');
                    setServiceCategory('Specialist MEP');
                    setRequestText('Supply and installation of two 14kW ceiling cassette inverter heat pumps, 35m of 200mm spiral galvanized ducting with diffusers, BMS digital wall touch controller, and certified pressure testing commissioning.');
                  }}
                  className="px-2 py-0.5 rounded bg-white dark:bg-neutral-800 border border-blue-200 dark:border-blue-800 text-[11px] text-blue-700 dark:text-blue-300 font-medium hover:bg-blue-100/50 transition-colors"
                >
                  Server Room HVAC
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setRequestTitle('Boundary Wall Structural Reinstatement');
                    setServiceCategory('Masonry & Civil Works');
                    setRequestText('Repair damaged boundary wall: mechanical demolition and disposal of 25 tonnes of collapsed masonry, 14m of concrete foundation footing, 24 sq m of double-skin Class B engineering brickwork, and coping stones.');
                  }}
                  className="px-2 py-0.5 rounded bg-white dark:bg-neutral-800 border border-blue-200 dark:border-blue-800 text-[11px] text-blue-700 dark:text-blue-300 font-medium hover:bg-blue-100/50 transition-colors"
                >
                  Masonry & Earthworks
                </button>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-medium text-neutral-700 dark:text-neutral-300">
                  Detailed Free-Text Request Description:
                </label>
                <span className="text-[11px] text-neutral-400">
                  WhatsApp or Email Paste Supported
                </span>
              </div>
              <textarea
                value={requestText}
                onChange={(e) => setRequestText(e.target.value)}
                rows={5}
                placeholder="Please quote for repairing a damaged boundary wall, including labour, materials, and site cleanup..."
                className="w-full p-3 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-neutral-50 dark:bg-neutral-800 text-xs leading-relaxed font-mono"
              />
            </div>

            {/* Attachments Section */}
            <div className="space-y-2 pt-2">
              <label className="font-medium text-neutral-700 dark:text-neutral-300 block">
                Attachments & Site Photos:
              </label>
              <div className="flex flex-wrap items-center gap-2">
                {attachments.map((att) => (
                  <div
                    key={att.id}
                    className="flex items-center gap-2 px-3 py-1.5 bg-neutral-100 dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 text-xs"
                  >
                    <FileText className="w-3.5 h-3.5 text-blue-600" />
                    <span className="font-medium text-neutral-800 dark:text-neutral-200">{att.name}</span>
                    <span className="text-[10px] text-neutral-400">({att.size})</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveAttachment(att.id)}
                      className="p-0.5 text-neutral-400 hover:text-rose-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={handleSimulateAttachmentUpload}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-dashed border-neutral-300 dark:border-neutral-700 hover:border-neutral-400 rounded-lg text-xs text-neutral-600 dark:text-neutral-400"
                >
                  <UploadCloud className="w-3.5 h-3.5" />
                  <span>Upload Document / Photo</span>
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-neutral-100 dark:border-neutral-800">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="inline-flex items-center gap-1 px-3 py-2 text-xs font-medium text-neutral-600 hover:text-neutral-900"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
            <button
              type="button"
              onClick={() => setStep(3)}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold"
            >
              <span>Continue to Price Context</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Pricing Context & Known Quantities */}
      {step === 3 && (
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-5 sm:p-6 space-y-6">
          <div>
            <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
              Pricing Context & Catalogue Guidance
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              Highlight known catalogue items or quantities to seed the AI matcher.
            </p>
          </div>

          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block mb-1 font-medium text-neutral-700 dark:text-neutral-300">
                  Quotation Currency:
                </label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full px-3 py-1.5 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-neutral-50 dark:bg-neutral-800 font-mono text-xs"
                >
                  <option value="USD">USD ($) - US Dollar</option>
                  <option value="EUR">EUR (€) - Euro</option>
                  <option value="GBP">GBP (£) - British Pound</option>
                  <option value="CAD">CAD (C$) - Canadian Dollar</option>
                  <option value="AUD">AUD (A$) - Australian Dollar</option>
                </select>
              </div>

              <div>
                <label className="block mb-1 font-medium text-neutral-700 dark:text-neutral-300">
                  Client Budget Range (Optional):
                </label>
                <input
                  type="text"
                  value={budgetRange}
                  onChange={(e) => setBudgetRange(e.target.value)}
                  placeholder="e.g. $8,000 - $12,000"
                  className="w-full px-3 py-1.5 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-neutral-50 dark:bg-neutral-800"
                />
              </div>
            </div>

            {/* Relevant Catalogue Selector */}
            <div className="space-y-2">
              <label className="block font-medium text-neutral-700 dark:text-neutral-300">
                Recommended Price Catalogue Items (Tick to guide generation):
              </label>
              <div className="max-h-60 overflow-y-auto border border-neutral-200 dark:border-neutral-800 rounded-lg p-2 space-y-1.5">
                {catalogue.slice(0, 10).map((item) => {
                  const isChecked = selectedCatalogueIds.includes(item.id);
                  return (
                    <div
                      key={item.id}
                      className={`flex items-center justify-between p-2 rounded-lg transition-colors ${
                        isChecked ? 'bg-blue-50/50 dark:bg-blue-950/30' : 'hover:bg-neutral-50 dark:hover:bg-neutral-800/50'
                      }`}
                    >
                      <label className="flex items-center gap-2.5 cursor-pointer flex-1 truncate">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleCatalogueToggle(item.id)}
                          className="rounded text-blue-600"
                        />
                        <div className="truncate">
                          <span className="font-semibold text-neutral-900 dark:text-neutral-100">{item.name}</span>
                          <span className="text-[10px] text-neutral-400 block font-mono">{item.code} · {item.category}</span>
                        </div>
                      </label>
                      <div className="text-right shrink-0">
                        <CurrencyAmount amount={item.unitPrice} currency={item.currency} className="font-semibold" />
                        <span className="text-[10px] text-neutral-400 block">/ {item.unit}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block mb-1 font-medium text-neutral-700 dark:text-neutral-300">
                Estimator Notes / Site Assumptions:
              </label>
              <textarea
                value={additionalNotes}
                onChange={(e) => setAdditionalNotes(e.target.value)}
                rows={2}
                placeholder="Mention access restrictions, working hour caps, or unmeasured components..."
                className="w-full p-2.5 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-neutral-50 dark:bg-neutral-800 text-xs"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-neutral-100 dark:border-neutral-800">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="inline-flex items-center gap-1 px-3 py-2 text-xs font-medium text-neutral-600 hover:text-neutral-900"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
            <button
              type="button"
              onClick={() => setStep(4)}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold"
            >
              <span>Review & Confirm</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: Review Request & Generate */}
      {step === 4 && (
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-5 sm:p-6 space-y-6">
          <div>
            <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
              Ready to Generate Draft Quotation
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              Review details below before dispatching to the catalogue matching engine.
            </p>
          </div>

          <div className="space-y-4 text-xs">
            {/* Customer Summary Box */}
            <div className="p-3.5 bg-neutral-50 dark:bg-neutral-800/60 rounded-xl space-y-1">
              <span className="font-semibold text-neutral-500 text-[10px] uppercase">Client Target:</span>
              <p className="font-bold text-neutral-900 dark:text-neutral-100 text-sm">
                {activeCustomer?.companyName ? `${activeCustomer.companyName} (${activeCustomer.name})` : activeCustomer?.name}
              </p>
              <p className="text-neutral-500">{activeCustomer?.email} · {activeCustomer?.phone}</p>
            </div>

            {/* Scope Summary Box */}
            <div className="p-3.5 bg-neutral-50 dark:bg-neutral-800/60 rounded-xl space-y-1">
              <span className="font-semibold text-neutral-500 text-[10px] uppercase">Quotation Title & Scope:</span>
              <p className="font-bold text-neutral-900 dark:text-neutral-100">{requestTitle}</p>
              <p className="text-neutral-700 dark:text-neutral-300 font-mono text-[11px] leading-relaxed bg-white dark:bg-neutral-900 p-2 rounded border border-neutral-200 dark:border-neutral-700 mt-1">
                {requestText}
              </p>
            </div>

            {/* Context Box */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg border border-neutral-200 dark:border-neutral-800">
                <span className="text-[10px] text-neutral-400 block uppercase">Currency</span>
                <span className="font-bold font-mono text-neutral-900 dark:text-neutral-100">{currency}</span>
              </div>
              <div className="p-3 rounded-lg border border-neutral-200 dark:border-neutral-800">
                <span className="text-[10px] text-neutral-400 block uppercase">Selected Trade Items</span>
                <span className="font-bold font-mono text-neutral-900 dark:text-neutral-100">{selectedCatalogueIds.length} items</span>
              </div>
            </div>

            {/* Clarification banner */}
            <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 rounded-lg text-amber-800 dark:text-amber-200 text-xs flex items-start gap-2">
              <HelpCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong className="font-semibold">Deterministic Financial Rule:</strong>
                <p className="text-[11px] text-amber-700 dark:text-amber-300 mt-0.5 leading-relaxed">
                  The AI matches your catalogue and proposes scope descriptions. You retain authoritative human control over final quantities, prices, discounts, and terms before approval.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-neutral-100 dark:border-neutral-800">
            <button
              type="button"
              onClick={() => setStep(3)}
              className="inline-flex items-center gap-1 px-3 py-2 text-xs font-medium text-neutral-600 hover:text-neutral-900"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>

            <button
              type="button"
              onClick={handleGenerateQuote}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              <span>Generate Quotation Draft</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
