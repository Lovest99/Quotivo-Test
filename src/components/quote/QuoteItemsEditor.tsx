import React, { useState } from 'react';
import { QuoteLineItem, CatalogueItem } from '../../types';
import { useApp } from '../../context/AppContext';
import { calculateLineItem } from '../../utils/calculations';
import { CurrencyAmount } from '../ui/CurrencyAmount';
import { quoteAdapter } from '../../services/quoteAdapter';
import {
  Plus,
  BookOpen,
  Trash2,
  Copy,
  ChevronUp,
  ChevronDown,
  Wand2,
  AlertCircle,
  HelpCircle,
  Check,
  X,
  Loader2,
} from 'lucide-react';

interface QuoteItemsEditorProps {
  items: QuoteLineItem[];
  currency: string;
  onChange: (items: QuoteLineItem[]) => void;
  isEditable?: boolean;
}

export const QuoteItemsEditor: React.FC<QuoteItemsEditorProps> = ({
  items,
  currency,
  onChange,
  isEditable = true,
}) => {
  const { catalogue, showToast } = useApp();

  const [isCataloguePickerOpen, setIsCataloguePickerOpen] = useState(false);
  const [catalogueSearch, setCatalogueSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // AI Assistant active state per line item
  const [rewritingItemId, setRewritingItemId] = useState<string | null>(null);
  const [activeProposal, setActiveProposal] = useState<{
    itemId: string;
    originalText: string;
    proposedText: string;
  } | null>(null);

  // Line item field update
  const handleUpdateItem = (id: string, updates: Partial<QuoteLineItem>) => {
    if (!isEditable) return;
    const updated = items.map((item) => {
      if (item.id === id) {
        const next = { ...item, ...updates };
        // If price is updated to > 0, clear price required flag
        if (updates.unitPrice !== undefined && updates.unitPrice > 0) {
          next.isPriceRequired = false;
        }
        return next;
      }
      return item;
    });
    onChange(updated);
  };

  // Add Item from Catalogue
  const handleAddFromCatalogue = (catItem: CatalogueItem) => {
    const newItem: QuoteLineItem = {
      id: `li_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      catalogueItemId: catItem.id,
      name: catItem.name,
      description: catItem.description,
      quantity: 1,
      unit: catItem.unit,
      unitPrice: catItem.unitPrice,
      discountPercent: 0,
      taxRate: 8.5,
      taxCategory: catItem.taxCategory,
      isCustom: false,
      isAssumedQuantity: false,
      isPriceRequired: false,
      category: catItem.category,
    };
    onChange([...items, newItem]);
    showToast(`Added "${catItem.name}" to quotation`, 'info');
  };

  // Add Custom blank line
  const handleAddCustomItem = () => {
    const newItem: QuoteLineItem = {
      id: `li_cust_${Date.now()}`,
      name: '',
      description: '',
      quantity: 1,
      unit: 'item',
      unitPrice: 0,
      discountPercent: 0,
      taxRate: 8.5,
      taxCategory: 'standard',
      isCustom: true,
      isPriceRequired: true,
    };
    onChange([...items, newItem]);
  };

  // Duplicate item
  const handleDuplicateItem = (index: number) => {
    if (!isEditable) return;
    const item = items[index];
    const clone: QuoteLineItem = {
      ...item,
      id: `li_dup_${Date.now()}`,
      name: `${item.name} (Copy)`,
    };
    const next = [...items];
    next.splice(index + 1, 0, clone);
    onChange(next);
    showToast('Line item duplicated', 'info');
  };

  // Remove item
  const handleRemoveItem = (id: string) => {
    if (!isEditable) return;
    onChange(items.filter((i) => i.id !== id));
  };

  // Reorder items
  const handleMove = (index: number, direction: 'up' | 'down') => {
    if (!isEditable) return;
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= items.length) return;
    const next = [...items];
    const [moved] = next.splice(index, 1);
    next.splice(targetIdx, 0, moved);
    onChange(next);
  };

  // AI Description Rewrite feature
  const handleTriggerRewrite = async (item: QuoteLineItem, style: 'formal' | 'concise' | 'technical') => {
    setRewritingItemId(item.id);
    try {
      const rewritten = await quoteAdapter.rewriteDescription(item.description, style);
      setActiveProposal({
        itemId: item.id,
        originalText: item.description,
        proposedText: rewritten,
      });
    } catch {
      showToast('Could not generate description rewrite', 'error');
    } finally {
      setRewritingItemId(null);
    }
  };

  const categories = Array.from(new Set(catalogue.map((c) => c.category)));

  const filteredCatalogue = catalogue.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(catalogueSearch.toLowerCase()) ||
      item.code.toLowerCase().includes(catalogueSearch.toLowerCase()) ||
      item.description.toLowerCase().includes(catalogueSearch.toLowerCase());
    const matchesCat = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
            Quotation Schedule of Works ({items.length} items)
          </h3>
          <p className="text-xs text-neutral-500">
            Verify quantities, catalogue price matching, and descriptions.
          </p>
        </div>

        {isEditable && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsCataloguePickerOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-700 dark:text-neutral-300 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-700/60 rounded-lg shadow-xs transition-colors"
            >
              <BookOpen className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>Add from Catalogue</span>
            </button>
            <button
              type="button"
              onClick={handleAddCustomItem}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-700 dark:text-neutral-300 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-700/60 rounded-lg shadow-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Custom Item</span>
            </button>
          </div>
        )}
      </div>

      {/* AI Rewrite Proposal Banner if active */}
      {activeProposal && (
        <div className="p-3.5 bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 rounded-xl space-y-2 text-xs animate-in fade-in duration-150">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-blue-900 dark:text-blue-200 flex items-center gap-1.5">
              <Wand2 className="w-3.5 h-3.5 text-blue-600" />
              Proposed Description Revision
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  handleUpdateItem(activeProposal.itemId, { description: activeProposal.proposedText });
                  setActiveProposal(null);
                  showToast('Description updated with proposed copy', 'success');
                }}
                className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium shadow-xs"
              >
                <Check className="w-3 h-3" />
                <span>Accept Proposal</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveProposal(null)}
                className="inline-flex items-center gap-1 px-2 py-1 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded"
              >
                <X className="w-3 h-3" />
                <span>Dismiss</span>
              </button>
            </div>
          </div>
          <div className="p-2.5 bg-white dark:bg-neutral-900 border border-blue-100 dark:border-blue-900/40 rounded-lg text-neutral-800 dark:text-neutral-200 leading-relaxed font-mono text-[11px]">
            {activeProposal.proposedText}
          </div>
        </div>
      )}

      {/* Desktop Line Items Table */}
      <div className="hidden lg:block border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-x-auto bg-white dark:bg-neutral-900 shadow-2xs">
        <table className="w-full text-xs text-left border-collapse">
          <thead className="sticky top-0 z-10 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md">
            <tr className="bg-neutral-50/80 dark:bg-neutral-800/60 border-b border-neutral-200 dark:border-neutral-800 text-neutral-500 font-medium">
              <th className="py-2.5 px-3 w-8">#</th>
              <th className="py-2.5 px-3 min-w-[260px]">Item & Scope Description</th>
              <th className="py-2.5 px-3 w-24 text-right">Quantity</th>
              <th className="py-2.5 px-3 w-20">Unit</th>
              <th className="py-2.5 px-3 w-28 text-right">Unit Price</th>
              <th className="py-2.5 px-3 w-20 text-right">Disc %</th>
              <th className="py-2.5 px-3 w-28 text-right">Amount</th>
              {isEditable && <th className="py-2.5 px-3 w-20 text-center">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
            {items.map((item, index) => {
              const calc = calculateLineItem(item);
              const isRewriting = rewritingItemId === item.id;

              return (
                <tr
                  key={item.id}
                  className={`hover:bg-neutral-50/60 dark:hover:bg-neutral-800/40 transition-colors ${
                    item.isPriceRequired ? 'bg-rose-50/30 dark:bg-rose-950/20' : ''
                  }`}
                >
                  {/* Reorder / Index */}
                  <td className="py-3 px-3 align-top text-neutral-400 font-mono text-[11px]">
                    <div className="flex flex-col items-center gap-0.5">
                      <span>{index + 1}</span>
                      {isEditable && (
                        <div className="flex flex-col">
                          <button
                            type="button"
                            disabled={index === 0}
                            onClick={() => handleMove(index, 'up')}
                            className="text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 disabled:opacity-20"
                            aria-label="Move item up"
                          >
                            <ChevronUp className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            disabled={index === items.length - 1}
                            onClick={() => handleMove(index, 'down')}
                            className="text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 disabled:opacity-20"
                            aria-label="Move item down"
                          >
                            <ChevronDown className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Name & Description & AI rewrite trigger */}
                  <td className="py-3 px-3 align-top space-y-1.5">
                    {isEditable ? (
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) => handleUpdateItem(item.id, { name: e.target.value })}
                        placeholder="Item title..."
                        className="w-full font-semibold text-neutral-900 dark:text-neutral-100 bg-transparent border-b border-transparent hover:border-neutral-300 dark:hover:border-neutral-700 focus:border-blue-600 focus:outline-hidden py-0.5"
                      />
                    ) : (
                      <span className="font-semibold text-neutral-900 dark:text-neutral-100 block">
                        {item.name}
                      </span>
                    )}

                    {isEditable ? (
                      <textarea
                        value={item.description}
                        onChange={(e) => handleUpdateItem(item.id, { description: e.target.value })}
                        rows={2}
                        placeholder="Detailed specification of materials, workmanship, and scope..."
                        className="w-full text-[11px] text-neutral-600 dark:text-neutral-300 bg-neutral-50/50 dark:bg-neutral-800/40 border border-neutral-200 dark:border-neutral-700/60 rounded p-1.5 focus:border-blue-600 focus:outline-hidden resize-y leading-relaxed"
                      />
                    ) : (
                      <p className="text-[11px] text-neutral-600 dark:text-neutral-400 leading-relaxed">
                        {item.description}
                      </p>
                    )}

                    {/* Metadata & Flags: Catalogue matching status & AI rewrite */}
                    <div className="flex flex-wrap items-center gap-2 pt-0.5 text-[10px]">
                      {item.catalogueItemId ? (
                        <span className="text-neutral-500">
                          Matched catalogue · SKU verified
                        </span>
                      ) : (
                        <span className="text-amber-600 dark:text-amber-400 font-medium">
                          Custom trade item
                        </span>
                      )}

                      {item.isAssumedQuantity && (
                        <>
                          <span className="text-neutral-300">·</span>
                          <span className="text-neutral-500 inline-flex items-center gap-1">
                            <HelpCircle className="w-2.5 h-2.5" /> Assumed quantity (site verify)
                          </span>
                        </>
                      )}

                      {item.isPriceRequired && (
                        <>
                          <span className="text-neutral-300">·</span>
                          <span className="text-rose-600 font-semibold inline-flex items-center gap-1">
                            <AlertCircle className="w-2.5 h-2.5" /> Price required
                          </span>
                        </>
                      )}

                      {isEditable && (
                        <div className="ml-auto flex items-center gap-1 text-[10px] text-neutral-400">
                          <span className="text-neutral-400">AI polish:</span>
                          <button
                            type="button"
                            disabled={isRewriting}
                            onClick={() => handleTriggerRewrite(item, 'formal')}
                            className="hover:text-blue-600 dark:hover:text-blue-400 hover:underline px-1 py-0.5"
                          >
                            Formal
                          </button>
                          <span>·</span>
                          <button
                            type="button"
                            disabled={isRewriting}
                            onClick={() => handleTriggerRewrite(item, 'concise')}
                            className="hover:text-blue-600 dark:hover:text-blue-400 hover:underline px-1 py-0.5"
                          >
                            Concise
                          </button>
                          {isRewriting && <Loader2 className="w-2.5 h-2.5 animate-spin text-blue-600 ml-1" />}
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Quantity */}
                  <td className="py-3 px-3 align-top text-right">
                    {isEditable ? (
                      <input
                        type="number"
                        min="0.01"
                        step="any"
                        value={item.quantity}
                        onChange={(e) => handleUpdateItem(item.id, { quantity: parseFloat(e.target.value) || 0 })}
                        className="w-20 px-2 py-1 text-right font-mono tabular-nums text-xs border border-neutral-200 dark:border-neutral-700 rounded bg-white dark:bg-neutral-800"
                      />
                    ) : (
                      <span className="font-mono tabular-nums text-neutral-900 dark:text-neutral-100">
                        {item.quantity}
                      </span>
                    )}
                  </td>

                  {/* Unit */}
                  <td className="py-3 px-3 align-top">
                    {isEditable ? (
                      <input
                        type="text"
                        value={item.unit}
                        onChange={(e) => handleUpdateItem(item.id, { unit: e.target.value })}
                        className="w-16 px-1.5 py-1 text-xs border border-neutral-200 dark:border-neutral-700 rounded bg-white dark:bg-neutral-800"
                      />
                    ) : (
                      <span className="text-neutral-600 dark:text-neutral-400">{item.unit}</span>
                    )}
                  </td>

                  {/* Unit Price */}
                  <td className="py-3 px-3 align-top text-right">
                    {isEditable ? (
                      <div className="relative inline-block w-24">
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.unitPrice}
                          onChange={(e) => handleUpdateItem(item.id, { unitPrice: parseFloat(e.target.value) || 0 })}
                          className={`w-full px-2 py-1 text-right font-mono tabular-nums text-xs border rounded bg-white dark:bg-neutral-800 ${
                            item.isPriceRequired || item.unitPrice === 0
                              ? 'border-rose-400 bg-rose-50/20 text-rose-700'
                              : 'border-neutral-200 dark:border-neutral-700'
                          }`}
                        />
                      </div>
                    ) : (
                      <CurrencyAmount
                        amount={item.unitPrice}
                        currency={currency}
                        className="text-neutral-900 dark:text-neutral-100 font-medium"
                      />
                    )}
                  </td>

                  {/* Discount % */}
                  <td className="py-3 px-3 align-top text-right">
                    {isEditable ? (
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="1"
                        value={item.discountPercent || 0}
                        onChange={(e) =>
                          handleUpdateItem(item.id, { discountPercent: parseFloat(e.target.value) || 0 })
                        }
                        className="w-16 px-1.5 py-1 text-right font-mono tabular-nums text-xs border border-neutral-200 dark:border-neutral-700 rounded bg-white dark:bg-neutral-800"
                      />
                    ) : (
                      <span className="font-mono text-neutral-500">
                        {item.discountPercent ? `${item.discountPercent}%` : '0%'}
                      </span>
                    )}
                  </td>

                  {/* Line Total */}
                  <td className="py-3 px-3 align-top text-right">
                    <CurrencyAmount
                      amount={calc.taxableAmount}
                      currency={currency}
                      className="font-bold text-neutral-900 dark:text-neutral-100 text-xs"
                    />
                    {calc.discountAmount > 0 && (
                      <span className="block text-[10px] text-emerald-600 font-mono">
                        Saved {currency} {calc.discountAmount.toFixed(2)}
                      </span>
                    )}
                  </td>

                  {/* Actions */}
                  {isEditable && (
                    <td className="py-3 px-3 align-top text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleDuplicateItem(index)}
                          className="p-1 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors"
                          title="Duplicate item"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(item.id)}
                          className="p-1 text-neutral-400 hover:text-rose-600 transition-colors"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Line Item Cards (< lg) */}
      <div className="lg:hidden space-y-3">
        {items.map((item, index) => {
          const calc = calculateLineItem(item);
          const isRewriting = rewritingItemId === item.id;

          return (
            <div
              key={item.id}
              className={`p-4 rounded-xl border bg-white dark:bg-neutral-900 space-y-3 shadow-xs ${
                item.isPriceRequired
                  ? 'border-rose-300 dark:border-rose-900 bg-rose-50/20'
                  : 'border-neutral-200 dark:border-neutral-800'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-semibold text-neutral-400">#{index + 1}</span>
                  {item.catalogueItemId ? (
                    <span className="text-[11px] text-neutral-500">Catalogue matched</span>
                  ) : (
                    <span className="text-[11px] text-amber-600 font-medium">Custom item</span>
                  )}
                </div>

                {isEditable && (
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => handleMove(index, 'up')}
                      className="p-1 text-neutral-400 hover:text-neutral-700 disabled:opacity-20"
                    >
                      <ChevronUp className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      disabled={index === items.length - 1}
                      onClick={() => handleMove(index, 'down')}
                      className="p-1 text-neutral-400 hover:text-neutral-700 disabled:opacity-20"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDuplicateItem(index)}
                      className="p-1 text-neutral-400 hover:text-neutral-700"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(item.id)}
                      className="p-1 text-neutral-400 hover:text-rose-600"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {/* Title & Description */}
              <div className="space-y-1.5">
                {isEditable ? (
                  <input
                    type="text"
                    value={item.name}
                    onChange={(e) => handleUpdateItem(item.id, { name: e.target.value })}
                    placeholder="Item title..."
                    className="w-full font-semibold text-sm text-neutral-900 dark:text-neutral-100 border border-neutral-200 dark:border-neutral-700 rounded-lg px-2.5 py-1.5 bg-neutral-50 dark:bg-neutral-800"
                  />
                ) : (
                  <span className="font-semibold text-sm text-neutral-900 dark:text-neutral-100 block">
                    {item.name}
                  </span>
                )}

                {isEditable ? (
                  <textarea
                    value={item.description}
                    onChange={(e) => handleUpdateItem(item.id, { description: e.target.value })}
                    rows={2}
                    placeholder="Description..."
                    className="w-full text-xs text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700 rounded-lg p-2 bg-neutral-50 dark:bg-neutral-800"
                  />
                ) : (
                  <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                    {item.description}
                  </p>
                )}
              </div>

              {/* Numbers grid on mobile */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs">
                <div>
                  <label className="text-[10px] text-neutral-500 uppercase block mb-1">Quantity</label>
                  {isEditable ? (
                    <input
                      type="number"
                      step="any"
                      value={item.quantity}
                      onChange={(e) => handleUpdateItem(item.id, { quantity: parseFloat(e.target.value) || 0 })}
                      className="w-full px-2 py-1 text-right font-mono border border-neutral-200 dark:border-neutral-700 rounded bg-white dark:bg-neutral-800"
                    />
                  ) : (
                    <span className="font-mono">{item.quantity}</span>
                  )}
                </div>

                <div>
                  <label className="text-[10px] text-neutral-500 uppercase block mb-1">Unit</label>
                  {isEditable ? (
                    <input
                      type="text"
                      value={item.unit}
                      onChange={(e) => handleUpdateItem(item.id, { unit: e.target.value })}
                      className="w-full px-2 py-1 text-xs border border-neutral-200 dark:border-neutral-700 rounded bg-white dark:bg-neutral-800"
                    />
                  ) : (
                    <span>{item.unit}</span>
                  )}
                </div>

                <div>
                  <label className="text-[10px] text-neutral-500 uppercase block mb-1">Price</label>
                  {isEditable ? (
                    <input
                      type="number"
                      step="0.01"
                      value={item.unitPrice}
                      onChange={(e) => handleUpdateItem(item.id, { unitPrice: parseFloat(e.target.value) || 0 })}
                      className={`w-full px-2 py-1 text-right font-mono border rounded bg-white dark:bg-neutral-800 ${
                        item.isPriceRequired ? 'border-rose-400 text-rose-700' : 'border-neutral-200 dark:border-neutral-700'
                      }`}
                    />
                  ) : (
                    <CurrencyAmount amount={item.unitPrice} currency={currency} />
                  )}
                </div>

                <div>
                  <label className="text-[10px] text-neutral-500 uppercase block mb-1">Line Total</label>
                  <div className="py-1">
                    <CurrencyAmount
                      amount={calc.taxableAmount}
                      currency={currency}
                      className="font-bold text-neutral-900 dark:text-neutral-100"
                    />
                  </div>
                </div>
              </div>

              {/* Polish tools */}
              {isEditable && (
                <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-[11px] text-neutral-500">
                  <span className="flex items-center gap-1">
                    <Wand2 className="w-3 h-3 text-blue-500" />
                    AI polish:
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={isRewriting}
                      onClick={() => handleTriggerRewrite(item, 'formal')}
                      className="text-blue-600 hover:underline"
                    >
                      Formal
                    </button>
                    <span>·</span>
                    <button
                      type="button"
                      disabled={isRewriting}
                      onClick={() => handleTriggerRewrite(item, 'concise')}
                      className="text-blue-600 hover:underline"
                    >
                      Concise
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Catalogue Picker Modal */}
      {isCataloguePickerOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150"
        >
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden">
            <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                  Select Items from Business Catalogue
                </h3>
                <p className="text-xs text-neutral-500">
                  Click an item to insert with preset rates and descriptions.
                </p>
              </div>
              <button
                onClick={() => setIsCataloguePickerOpen(false)}
                className="p-1 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Filter controls */}
            <div className="p-3 bg-neutral-50 dark:bg-neutral-800/60 border-b border-neutral-200 dark:border-neutral-800 flex flex-wrap gap-2 text-xs">
              <input
                type="text"
                placeholder="Search catalogue..."
                value={catalogueSearch}
                onChange={(e) => setCatalogueSearch(e.target.value)}
                className="flex-1 min-w-[180px] px-3 py-1.5 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-xs"
              />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-1.5 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-xs"
              >
                <option value="all">All Categories</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Items list */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2 text-xs">
              {filteredCatalogue.map((catItem) => (
                <div
                  key={catItem.id}
                  className="p-3 rounded-lg border border-neutral-200 dark:border-neutral-800 hover:border-blue-400 dark:hover:border-blue-600 bg-white dark:bg-neutral-900 flex items-center justify-between gap-3 transition-colors"
                >
                  <div className="truncate flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] text-neutral-400">{catItem.code}</span>
                      <span className="font-semibold text-neutral-900 dark:text-neutral-100">{catItem.name}</span>
                    </div>
                    <p className="text-[11px] text-neutral-500 truncate mt-0.5">{catItem.description}</p>
                    <span className="text-[10px] text-neutral-400">{catItem.category}</span>
                  </div>

                  <div className="text-right shrink-0">
                    <CurrencyAmount
                      amount={catItem.unitPrice}
                      currency={catItem.currency}
                      className="font-bold text-neutral-900 dark:text-neutral-100 block"
                    />
                    <span className="text-[10px] text-neutral-400 block">per {catItem.unit}</span>
                    <button
                      type="button"
                      onClick={() => {
                        handleAddFromCatalogue(catItem);
                        setIsCataloguePickerOpen(false);
                      }}
                      className="mt-1.5 px-2.5 py-1 bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 rounded font-medium text-[11px] hover:bg-neutral-800 transition-colors"
                    >
                      Insert Item
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
