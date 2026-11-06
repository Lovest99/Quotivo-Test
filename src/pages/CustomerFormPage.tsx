import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Customer } from '../types';
import { ArrowLeft, Save, AlertTriangle } from 'lucide-react';

export const CustomerFormPage: React.FC = () => {
  const { customerId } = useParams<{ customerId?: string }>();
  const navigate = useNavigate();
  const { customers, saveCustomer, showToast } = useApp();

  const isEdit = Boolean(customerId);
  const existing = customerId ? customers.find((c) => c.id === customerId) : null;

  const [type, setType] = useState<'business' | 'individual'>(existing?.type || 'business');
  const [name, setName] = useState(existing?.name || '');
  const [companyName, setCompanyName] = useState(existing?.companyName || '');
  const [email, setEmail] = useState(existing?.email || '');
  const [phone, setPhone] = useState(existing?.phone || '');
  const [street, setStreet] = useState(existing?.billingAddress?.street || '');
  const [city, setCity] = useState(existing?.billingAddress?.city || '');
  const [state, setState] = useState(existing?.billingAddress?.state || '');
  const [postalCode, setPostalCode] = useState(existing?.billingAddress?.postalCode || '');
  const [siteStreet, setSiteStreet] = useState(existing?.siteAddress?.street || '');
  const [siteCity, setSiteCity] = useState(existing?.siteAddress?.city || '');
  const [notes, setNotes] = useState(existing?.notes || '');

  useEffect(() => {
    if (existing) {
      setType(existing.type);
      setName(existing.name);
      setCompanyName(existing.companyName || '');
      setEmail(existing.email);
      setPhone(existing.phone || '');
      setStreet(existing.billingAddress?.street || '');
      setCity(existing.billingAddress?.city || '');
      setState(existing.billingAddress?.state || '');
      setPostalCode(existing.billingAddress?.postalCode || '');
      setSiteStreet(existing.siteAddress?.street || '');
      setSiteCity(existing.siteAddress?.city || '');
      setNotes(existing.notes || '');
    }
  }, [existing]);

  // Duplicate detection check
  const likelyDuplicate = customers.find(
    (c) =>
      c.id !== customerId &&
      ((email && c.email.toLowerCase() === email.toLowerCase()) ||
        (name && c.name.toLowerCase() === name.toLowerCase()))
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      showToast('Name and email are mandatory fields', 'warning');
      return;
    }

    const payload: Partial<Customer> & { name: string; email: string } = {
      id: customerId,
      type,
      name,
      companyName: type === 'business' ? companyName : undefined,
      email,
      phone,
      billingAddress: {
        street,
        city,
        state,
        postalCode,
        country: 'United States',
      },
      siteAddress: siteStreet
        ? {
            street: siteStreet,
            city: siteCity || city,
            state: state || 'CO',
            postalCode: postalCode || '80000',
            country: 'United States',
          }
        : undefined,
      notes,
    };

    const saved = saveCustomer(payload);
    navigate(`/app/customers/${saved.id}`);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-3xl mx-auto space-y-6 animate-in fade-in duration-200">
      <div className="flex items-center justify-between pb-4 border-b border-neutral-200 dark:border-neutral-800">
        <div className="flex items-center gap-3">
          <Link
            to={customerId ? `/app/customers/${customerId}` : '/app/customers'}
            className="p-1.5 text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
              {isEdit ? `Edit Customer: ${existing?.name}` : 'New Customer Registration'}
            </h1>
            <p className="text-xs text-neutral-500">
              Client details will be linked to future quotation schedules.
            </p>
          </div>
        </div>
      </div>

      {/* Duplicate Alert Banner */}
      {likelyDuplicate && (
        <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 rounded-xl flex items-start gap-2.5 text-xs text-amber-900 dark:text-amber-200">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <strong className="font-semibold block">Potential Duplicate Customer Detected</strong>
            <p className="text-[11px] text-amber-800 dark:text-amber-300 mt-0.5 leading-relaxed">
              A customer named "{likelyDuplicate.name}" ({likelyDuplicate.email}) already exists. You may continue if this is a separate account.
            </p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-6 space-y-6 text-xs">
        {/* Type Switch */}
        <div className="space-y-2">
          <label className="font-medium text-neutral-700 dark:text-neutral-300 block">
            Customer Entity Classification:
          </label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="cType"
                checked={type === 'business'}
                onChange={() => setType('business')}
              />
              <span className="font-medium">Business / Enterprise</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="cType"
                checked={type === 'individual'}
                onChange={() => setType('individual')}
              />
              <span className="font-medium">Individual / Residential</span>
            </label>
          </div>
        </div>

        {/* Name & Company */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block mb-1 font-medium text-neutral-700 dark:text-neutral-300">
              Primary Contact Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Marcus Vance"
              className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-neutral-50 dark:bg-neutral-800 text-xs"
            />
          </div>

          {type === 'business' && (
            <div>
              <label className="block mb-1 font-medium text-neutral-700 dark:text-neutral-300">
                Company / Organization Name
              </label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g. Apex Industrial Parks"
                className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-neutral-50 dark:bg-neutral-800 text-xs"
              />
            </div>
          )}

          <div>
            <label className="block mb-1 font-medium text-neutral-700 dark:text-neutral-300">
              Email Address *
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="client@domain.com"
              className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-neutral-50 dark:bg-neutral-800 text-xs font-mono"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium text-neutral-700 dark:text-neutral-300">
              Telephone Number
            </label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1 (555) 000-0000"
              className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-neutral-50 dark:bg-neutral-800 text-xs font-mono"
            />
          </div>
        </div>

        {/* Billing Address */}
        <div className="space-y-3 pt-3 border-t border-neutral-100 dark:border-neutral-800">
          <span className="font-semibold uppercase tracking-wider text-neutral-400 text-[10px] block">
            Billing Address
          </span>
          <div>
            <input
              type="text"
              value={street}
              onChange={(e) => setStreet(e.target.value)}
              placeholder="Street address line..."
              className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-neutral-50 dark:bg-neutral-800 text-xs"
            />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="City"
              className="px-3 py-2 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-neutral-50 dark:bg-neutral-800 text-xs"
            />
            <input
              type="text"
              value={state}
              onChange={(e) => setState(e.target.value)}
              placeholder="State"
              className="px-3 py-2 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-neutral-50 dark:bg-neutral-800 text-xs"
            />
            <input
              type="text"
              value={postalCode}
              onChange={(e) => setPostalCode(e.target.value)}
              placeholder="Postal Code"
              className="px-3 py-2 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-neutral-50 dark:bg-neutral-800 text-xs font-mono"
            />
          </div>
        </div>

        {/* Site Delivery Address */}
        <div className="space-y-3 pt-3 border-t border-neutral-100 dark:border-neutral-800">
          <span className="font-semibold uppercase tracking-wider text-neutral-400 text-[10px] block">
            Job / Project Site Address (Optional)
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              value={siteStreet}
              onChange={(e) => setSiteStreet(e.target.value)}
              placeholder="Site street address..."
              className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-neutral-50 dark:bg-neutral-800 text-xs"
            />
            <input
              type="text"
              value={siteCity}
              onChange={(e) => setSiteCity(e.target.value)}
              placeholder="Site city"
              className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-neutral-50 dark:bg-neutral-800 text-xs"
            />
          </div>
        </div>

        {/* Notes */}
        <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800">
          <label className="block mb-1 font-medium text-neutral-700 dark:text-neutral-300">
            Internal Notes:
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            placeholder="Commercial terms, special safety site access passes..."
            className="w-full p-2.5 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-neutral-50 dark:bg-neutral-800 text-xs"
          />
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-3 pt-4 border-t border-neutral-100 dark:border-neutral-800">
          <Link
            to="/app/customers"
            className="px-4 py-2 text-xs font-medium text-neutral-600 hover:text-neutral-900"
          >
            Cancel
          </Link>
          <button
            type="submit"
            className="inline-flex items-center gap-1.5 px-5 py-2 bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900 text-white rounded-lg text-xs font-semibold shadow-xs"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isEdit ? 'Update Customer' : 'Save Customer'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
