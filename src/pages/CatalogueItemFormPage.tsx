import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { CatalogueItem, TaxCategory } from '../types';
import { ArrowLeft, Save, BookOpen, AlertCircle } from 'lucide-react';

export const CatalogueItemFormPage: React.FC = () => {
  const { itemId } = useParams<{ itemId?: string }>();
  const navigate = useNavigate();
  const { catalogue, saveCatalogueItem, quoteDefaults, showToast } = useApp();

  const isEdit = Boolean(itemId);
  const existing = itemId ? catalogue.find((i) => i.id === itemId) : null;

  const [name, setName] = useState(existing?.name || '');
  const [code, setCode] = useState(existing?.code || '');
  const [description, setDescription] = useState(existing?.description || '');
  const [category, setCategory] = useState(existing?.category || 'General Services');
  const [unit, setUnit] = useState(existing?.unit || 'unit');
  const [unitPrice, setUnitPrice] = useState<number>(existing?.unitPrice || 0);
  const [currency, setCurrency] = useState(existing?.currency || quoteDefaults.currency);
  const [taxCategory, setTaxCategory] = useState<TaxCategory>(existing?.taxCategory || 'standard');
  const [isActive, setIsActive] = useState<boolean>(existing?.isActive !== undefined ? existing.isActive : true);

  useEffect(() => {
    if (existing) {
      setName(existing.name);
      setCode(existing.code);
      setDescription(existing.description);
      setCategory(existing.category);
      setUnit(existing.unit);
      setUnitPrice(existing.unitPrice);
      setCurrency(existing.currency);
      setTaxCategory(existing.taxCategory);
      setIsActive(existing.isActive);
    }
  }, [existing]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Item Name is required', 'warning');
      return;
    }
    if (unitPrice < 0 || isNaN(unitPrice)) {
      showToast('Unit price must be a non-negative number', 'warning');
      return;
    }

    saveCatalogueItem({
      id: itemId,
      name,
      code: code || `SKU-${Date.now().toString().slice(-4)}`,
      description,
      category,
      unit,
      unitPrice,
      currency,
      taxCategory,
      isActive,
    });

    navigate('/app/catalogue');
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-3xl mx-auto space-y-6 animate-in fade-in duration-200">
      <div className="flex items-center justify-between pb-4 border-b border-neutral-200 dark:border-neutral-800">
        <div className="flex items-center gap-3">
          <Link
            to="/app/catalogue"
            className="p-1.5 text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-600" />
              <span>{isEdit ? `Edit Item: ${existing?.code}` : 'Add Trade Catalogue Item'}</span>
            </h1>
            <p className="text-xs text-neutral-500">
              Standard pricing rule used for AI matching and draft estimation.
            </p>
          </div>
        </div>
      </div>

      {/* Snapshot immutability notice */}
      <div className="p-3 bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl text-xs flex items-start gap-2.5 text-neutral-600 dark:text-neutral-400">
        <AlertCircle className="w-4 h-4 text-neutral-500 shrink-0 mt-0.5" />
        <p className="text-[11px] leading-relaxed">
          <strong>Snapshot Protection:</strong> Updating rates in this catalogue will apply only to new quotations and future revisions. Existing approved or sent quotation snapshots retain their locked historical rates.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-6 space-y-6 text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <label className="block mb-1 font-medium text-neutral-700 dark:text-neutral-300">
              Item Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Boundary Wall Brick Masonry (Double Wythe)"
              className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-neutral-50 dark:bg-neutral-800 text-xs font-semibold"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium text-neutral-700 dark:text-neutral-300">
              Internal SKU / Code
            </label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="e.g. MAS-BW-01"
              className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-neutral-50 dark:bg-neutral-800 text-xs font-mono"
            />
          </div>
        </div>

        <div>
          <label className="block mb-1 font-medium text-neutral-700 dark:text-neutral-300">
            Trade Description & Material Specification
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="Detailed description inserted into customer quotations..."
            className="w-full p-2.5 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-neutral-50 dark:bg-neutral-800 text-xs leading-relaxed"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block mb-1 font-medium text-neutral-700 dark:text-neutral-300">
              Category
            </label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g. Masonry & Brickwork"
              className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-neutral-50 dark:bg-neutral-800 text-xs"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium text-neutral-700 dark:text-neutral-300">
              Unit of Measure
            </label>
            <input
              type="text"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              placeholder="e.g. sq m, linear m, day, item"
              className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-neutral-50 dark:bg-neutral-800 text-xs"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium text-neutral-700 dark:text-neutral-300">
              Unit Rate Price *
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              required
              value={unitPrice}
              onChange={(e) => setUnitPrice(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-neutral-50 dark:bg-neutral-800 text-xs font-mono font-bold"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-neutral-100 dark:border-neutral-800">
          <div>
            <label className="block mb-1 font-medium text-neutral-700 dark:text-neutral-300">
              Tax Category
            </label>
            <select
              value={taxCategory}
              onChange={(e) => setTaxCategory(e.target.value as TaxCategory)}
              className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-neutral-50 dark:bg-neutral-800 text-xs"
            >
              <option value="standard">Standard Rate</option>
              <option value="reduced">Reduced Rate</option>
              <option value="zero">Zero Rated</option>
              <option value="exempt">Exempt</option>
            </select>
          </div>

          <div>
            <label className="block mb-1 font-medium text-neutral-700 dark:text-neutral-300">
              Catalogue Status
            </label>
            <label className="flex items-center gap-2 cursor-pointer mt-2.5">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="rounded text-blue-600"
              />
              <span className="font-medium text-neutral-800 dark:text-neutral-200">
                Active in AI interpretation and matching
              </span>
            </label>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-neutral-100 dark:border-neutral-800">
          <Link
            to="/app/catalogue"
            className="px-4 py-2 text-xs font-medium text-neutral-600 hover:text-neutral-900"
          >
            Cancel
          </Link>
          <button
            type="submit"
            className="inline-flex items-center gap-1.5 px-5 py-2 bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900 text-white rounded-lg text-xs font-semibold shadow-xs"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isEdit ? 'Update Catalogue Item' : 'Save Item'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
