import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import {
  Search,
  FileSpreadsheet,
  Users,
  BookOpen,
  ArrowRight,
  Plus,
  CheckSquare,
  Settings,
  X,
} from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

export const CommandPalette: React.FC = () => {
  const navigate = useNavigate();
  const { isCommandPaletteOpen, setCommandPaletteOpen, quotes, customers, catalogue } = useApp();
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isCommandPaletteOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isCommandPaletteOpen]);

  if (!isCommandPaletteOpen) return null;

  const q = query.toLowerCase().trim();

  // Filtered results
  const matchingQuotes = q
    ? quotes
        .filter(
          (item) =>
            item.quoteNumber.toLowerCase().includes(q) ||
            item.title.toLowerCase().includes(q) ||
            customers.find((c) => c.id === item.customerId)?.name.toLowerCase().includes(q)
        )
        .slice(0, 4)
    : quotes.slice(0, 3);

  const matchingCustomers = q
    ? customers
        .filter(
          (c) =>
            c.name.toLowerCase().includes(q) ||
            (c.companyName && c.companyName.toLowerCase().includes(q)) ||
            c.email.toLowerCase().includes(q)
        )
        .slice(0, 3)
    : [];

  const matchingCatalogue = q
    ? catalogue
        .filter(
          (i) =>
            i.name.toLowerCase().includes(q) ||
            i.code.toLowerCase().includes(q) ||
            i.category.toLowerCase().includes(q)
        )
        .slice(0, 3)
    : [];

  const handleSelect = (url: string) => {
    setCommandPaletteOpen(false);
    navigate(url);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={() => setCommandPaletteOpen(false)}
    >
      <div
        className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-2xl max-w-xl w-full overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3 border-b border-neutral-200 dark:border-neutral-800 gap-3">
          <Search className="w-4 h-4 text-neutral-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command, quote #, customer, or catalogue service..."
            className="w-full text-sm bg-transparent outline-hidden text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono text-neutral-400 bg-neutral-100 dark:bg-neutral-800 rounded">
            ESC
          </kbd>
        </div>

        {/* Results Container */}
        <div className="max-h-[60vh] overflow-y-auto p-2 space-y-4 text-xs">
          {/* Quick Actions */}
          <div>
            <p className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
              Quick Actions
            </p>
            <div className="space-y-0.5">
              <button
                onClick={() => handleSelect('/app/requests/new')}
                className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-200 text-left transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center">
                    <Plus className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="font-medium">New Customer Request</span>
                    <span className="text-[11px] text-neutral-500 ml-2">Generate quote with AI</span>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-neutral-400" />
              </button>

              <button
                onClick={() => handleSelect('/app/approvals')}
                className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-200 text-left transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 flex items-center justify-center">
                    <CheckSquare className="w-3.5 h-3.5" />
                  </div>
                  <span className="font-medium">Open Approvals Queue</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-neutral-400" />
              </button>

              <button
                onClick={() => handleSelect('/app/settings/integrations')}
                className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-200 text-left transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 flex items-center justify-center">
                    <Settings className="w-3.5 h-3.5" />
                  </div>
                  <span className="font-medium">n8n Automation Settings</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-neutral-400" />
              </button>
            </div>
          </div>

          {/* Quotations */}
          {matchingQuotes.length > 0 && (
            <div>
              <p className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
                Quotations
              </p>
              <div className="space-y-0.5">
                {matchingQuotes.map((quote) => {
                  const cust = customers.find((c) => c.id === quote.customerId);
                  return (
                    <button
                      key={quote.id}
                      onClick={() => handleSelect(`/app/quotes/${quote.id}`)}
                      className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-200 text-left transition-colors"
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <FileSpreadsheet className="w-4 h-4 text-neutral-400 shrink-0" />
                        <div className="truncate">
                          <span className="font-mono font-medium text-blue-600 dark:text-blue-400 mr-2">
                            {quote.quoteNumber}
                          </span>
                          <span className="font-medium truncate">{quote.title}</span>
                          <span className="text-[11px] text-neutral-500 block truncate">
                            {cust?.name || 'Unknown'} · Rev {quote.currentRevision}
                          </span>
                        </div>
                      </div>
                      <span className="font-mono text-neutral-600 dark:text-neutral-300 shrink-0 ml-2">
                        {formatCurrency(quote.grandTotal, quote.currency)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Customers */}
          {matchingCustomers.length > 0 && (
            <div>
              <p className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
                Customers
              </p>
              <div className="space-y-0.5">
                {matchingCustomers.map((cust) => (
                  <button
                    key={cust.id}
                    onClick={() => handleSelect(`/app/customers/${cust.id}`)}
                    className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-200 text-left transition-colors"
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <Users className="w-4 h-4 text-neutral-400 shrink-0" />
                      <div className="truncate">
                        <span className="font-medium">{cust.name}</span>
                        {cust.companyName && (
                          <span className="text-neutral-500 ml-1.5">({cust.companyName})</span>
                        )}
                        <span className="text-[11px] text-neutral-400 block truncate">{cust.email}</span>
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-neutral-400" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Catalogue */}
          {matchingCatalogue.length > 0 && (
            <div>
              <p className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
                Price Catalogue Items
              </p>
              <div className="space-y-0.5">
                {matchingCatalogue.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleSelect(`/app/catalogue/${item.id}/edit`)}
                    className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-200 text-left transition-colors"
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <BookOpen className="w-4 h-4 text-neutral-400 shrink-0" />
                      <div className="truncate">
                        <span className="font-mono text-neutral-400 mr-2 text-[11px]">{item.code}</span>
                        <span className="font-medium truncate">{item.name}</span>
                        <span className="text-[11px] text-neutral-500 block truncate">{item.category}</span>
                      </div>
                    </div>
                    <span className="font-mono text-neutral-600 dark:text-neutral-300 shrink-0 ml-2">
                      {formatCurrency(item.unitPrice, item.currency)} / {item.unit}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {q &&
            matchingQuotes.length === 0 &&
            matchingCustomers.length === 0 &&
            matchingCatalogue.length === 0 && (
              <div className="py-8 text-center text-neutral-500">
                <p>No results found for "{query}"</p>
              </div>
            )}
        </div>
      </div>
    </div>
  );
};
