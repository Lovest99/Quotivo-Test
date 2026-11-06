import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { CatalogueItem } from '../types';
import { CurrencyAmount } from '../components/ui/CurrencyAmount';
import { CatalogueCsvImportModal } from './CatalogueCsvImportModal';
import {
  BookOpen,
  Search,
  Plus,
  UploadCloud,
  Edit,
  CheckCircle2,
  XCircle,
  Filter,
} from 'lucide-react';

export const CatalogueListPage: React.FC = () => {
  const { catalogue, refreshCatalogue, saveCatalogueItem } = useApp();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);

  const categories = Array.from(new Set(catalogue.map((c) => c.category)));

  const filteredItems = catalogue.filter((item) => {
    const q = search.toLowerCase();
    const matchesSearch =
      item.name.toLowerCase().includes(q) ||
      item.code.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q);

    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && item.isActive) ||
      (statusFilter === 'inactive' && !item.isActive);

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleToggleActive = (item: CatalogueItem) => {
    saveCatalogueItem({
      ...item,
      isActive: !item.isActive,
    });
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200 dark:border-neutral-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-600" />
            <span>Price Catalogue & Rates</span>
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Trade items, standardized unit rates, and service descriptions matched by the AI generator.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIsCsvModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 text-neutral-800 dark:text-neutral-200 rounded-lg text-xs font-medium shadow-xs transition-colors"
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span>CSV Bulk Import</span>
          </button>

          <Link
            to="/app/catalogue/new"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Trade Item</span>
          </Link>
        </div>
      </div>

      {/* Sticky Filter and Search Bar */}
      <div className="sticky top-14 z-20 -mx-3 sm:-mx-6 lg:-mx-8 px-3 sm:px-6 lg:px-8 py-2.5 bg-[#fafaf9]/95 dark:bg-neutral-950/95 backdrop-blur-md border-b border-neutral-200/80 dark:border-neutral-800 shadow-2xs">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 text-xs">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-neutral-400" />
            <input
              type="text"
              placeholder="Search items by name, SKU code, or trade description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-xs"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="flex-1 sm:flex-none px-2.5 py-1.5 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-xs"
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="flex-1 sm:flex-none px-2.5 py-1.5 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-xs"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-x-auto bg-white dark:bg-neutral-900 shadow-2xs">
        <table className="w-full text-xs text-left border-collapse">
          <thead className="sticky top-0 z-10 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md">
            <tr className="bg-neutral-50/80 dark:bg-neutral-800/60 border-b border-neutral-200 dark:border-neutral-800 text-neutral-500 font-medium">
              <th className="py-2.5 px-3">SKU</th>
              <th className="py-2.5 px-3 min-w-[240px]">Item Name & Description</th>
              <th className="py-2.5 px-3">Category</th>
              <th className="py-2.5 px-3">Unit</th>
              <th className="py-2.5 px-3 text-right">Standard Rate</th>
              <th className="py-2.5 px-3">Tax</th>
              <th className="py-2.5 px-3 text-center">Status</th>
              <th className="py-2.5 px-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
            {filteredItems.map((item) => (
              <tr key={item.id} className="hover:bg-neutral-50/60 dark:hover:bg-neutral-800/40 transition-colors">
                <td className="py-3 px-3 font-mono text-[11px] text-neutral-400">{item.code}</td>

                <td className="py-3 px-3">
                  <Link
                    to={`/app/catalogue/${item.id}/edit`}
                    className="font-semibold text-neutral-900 dark:text-neutral-100 hover:text-blue-600 block"
                  >
                    {item.name}
                  </Link>
                  <p className="text-[11px] text-neutral-500 leading-relaxed truncate max-w-md">
                    {item.description}
                  </p>
                </td>

                <td className="py-3 px-3 text-neutral-600 dark:text-neutral-400">{item.category}</td>

                <td className="py-3 px-3 font-mono text-neutral-500">{item.unit}</td>

                <td className="py-3 px-3 text-right font-mono tabular-nums font-bold text-neutral-900 dark:text-neutral-100">
                  <CurrencyAmount amount={item.unitPrice} currency={item.currency} />
                </td>

                <td className="py-3 px-3 capitalize text-neutral-500">{item.taxCategory}</td>

                <td className="py-3 px-3 text-center">
                  <button
                    type="button"
                    onClick={() => handleToggleActive(item)}
                    className={`inline-flex items-center gap-1 text-[11px] font-medium transition-colors ${
                      item.isActive
                        ? 'text-emerald-700 dark:text-emerald-400'
                        : 'text-neutral-400 hover:text-neutral-600'
                    }`}
                  >
                    {item.isActive ? 'Active' : 'Inactive'}
                  </button>
                </td>

                <td className="py-3 px-3 text-right">
                  <Link
                    to={`/app/catalogue/${item.id}/edit`}
                    className="px-2 py-1 text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 font-medium"
                  >
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards (< md) */}
      <div className="md:hidden space-y-3">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 space-y-2 shadow-xs"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="font-mono text-[10px] text-neutral-400 block">{item.code}</span>
                <Link
                  to={`/app/catalogue/${item.id}/edit`}
                  className="font-bold text-sm text-neutral-900 dark:text-neutral-100 hover:underline block"
                >
                  {item.name}
                </Link>
                <span className="text-[11px] text-neutral-500">{item.category}</span>
              </div>

              <div className="text-right shrink-0">
                <CurrencyAmount
                  amount={item.unitPrice}
                  currency={item.currency}
                  className="font-bold text-sm text-neutral-900 dark:text-neutral-100 block"
                />
                <span className="text-[10px] text-neutral-400">per {item.unit}</span>
              </div>
            </div>

            <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed pt-1">
              {item.description}
            </p>

            <div className="flex items-center justify-between pt-2 border-t border-neutral-100 dark:border-neutral-800 text-xs">
              <span className={`text-[11px] font-medium ${item.isActive ? 'text-emerald-600' : 'text-neutral-400'}`}>
                {item.isActive ? 'Active in matcher' : 'Inactive'}
              </span>
              <Link
                to={`/app/catalogue/${item.id}/edit`}
                className="text-blue-600 font-semibold"
              >
                Edit Item
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* CSV Modal */}
      {isCsvModalOpen && (
        <CatalogueCsvImportModal
          isOpen={isCsvModalOpen}
          onClose={() => setIsCsvModalOpen(false)}
          onImportSuccess={() => {
            refreshCatalogue();
          }}
        />
      )}
    </div>
  );
};
