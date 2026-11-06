import React, { useState } from 'react';
import { Quote, QuoteRevision } from '../../types';
import { formatDateTime } from '../../utils/formatters';
import { CurrencyAmount } from '../ui/CurrencyAmount';
import { QuoteStatusBadge } from '../ui/StatusBadges';
import { History, Eye, X } from 'lucide-react';

interface VersionListProps {
  quote: Quote;
}

export const VersionList: React.FC<VersionListProps> = ({ quote }) => {
  const [inspectedRevision, setInspectedRevision] = useState<QuoteRevision | null>(null);

  const revisions = quote.revisions || [];

  return (
    <div className="space-y-4 text-xs">
      <div className="flex items-center justify-between pb-2 border-b border-neutral-100 dark:border-neutral-800">
        <div>
          <h4 className="font-semibold text-neutral-900 dark:text-neutral-100">
            Immutable Revision Audit Trail
          </h4>
          <p className="text-[11px] text-neutral-500">
            Active working version is <strong className="font-mono text-neutral-800 dark:text-neutral-200">Revision {quote.currentRevision}</strong>.
          </p>
        </div>
        <span className="font-mono text-[11px] text-neutral-400">
          {revisions.length} archived snapshots
        </span>
      </div>

      {/* Current Active Working Version */}
      <div className="p-3.5 rounded-xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/40 dark:bg-blue-950/20 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-bold font-mono text-blue-700 dark:text-blue-300">
              Revision {quote.currentRevision} (Current)
            </span>
            <QuoteStatusBadge status={quote.status} />
          </div>
          <CurrencyAmount
            amount={quote.grandTotal}
            currency={quote.currency}
            className="font-bold text-neutral-900 dark:text-neutral-100"
          />
        </div>
        <p className="text-[11px] text-neutral-600 dark:text-neutral-400">
          Updated {formatDateTime(quote.updatedAt)} by {quote.createdByName}
        </p>
      </div>

      {/* Previous Preserved Revisions */}
      {revisions.length === 0 ? (
        <div className="py-6 text-center text-neutral-400 text-xs">
          No prior superseded revisions recorded.
        </div>
      ) : (
        <div className="space-y-2">
          {revisions.map((rev) => (
            <div
              key={rev.revisionNumber}
              className="p-3 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 flex items-center justify-between gap-3"
            >
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-semibold text-neutral-900 dark:text-neutral-100">
                    Revision {rev.revisionNumber}
                  </span>
                  <QuoteStatusBadge status={rev.statusAtRevision} />
                </div>
                <p className="text-[11px] text-neutral-500">
                  {rev.changeSummary} · {formatDateTime(rev.createdAt)} by {rev.createdByName}
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <CurrencyAmount
                  amount={rev.grandTotal}
                  currency={quote.currency}
                  className="font-mono font-medium text-neutral-700 dark:text-neutral-300"
                />
                <button
                  type="button"
                  onClick={() => setInspectedRevision(rev)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded transition-colors"
                >
                  <Eye className="w-3 h-3" />
                  <span>Inspect</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Snapshot Modal */}
      {inspectedRevision && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150"
        >
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden">
            <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-neutral-500" />
                <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                  Archived Snapshot: Revision {inspectedRevision.revisionNumber}
                </h3>
              </div>
              <button
                onClick={() => setInspectedRevision(null)}
                className="p-1 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 overflow-y-auto text-xs">
              <div className="p-3 bg-neutral-50 dark:bg-neutral-800/60 rounded-lg space-y-1">
                <p className="font-semibold text-neutral-900 dark:text-neutral-100">
                  Snapshot Meta
                </p>
                <p className="text-neutral-500 text-[11px]">
                  Preserved on {formatDateTime(inspectedRevision.createdAt)} by {inspectedRevision.createdByName}
                </p>
                <p className="text-neutral-600 dark:text-neutral-300 text-[11px] font-mono mt-1">
                  Change Note: {inspectedRevision.changeSummary}
                </p>
              </div>

              <div>
                <p className="font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
                  Scope Summary at Revision
                </p>
                <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed bg-white dark:bg-neutral-800/40 p-2.5 rounded border border-neutral-200 dark:border-neutral-700">
                  {inspectedRevision.scopeSummary || 'No scope notes recorded'}
                </p>
              </div>

              <div>
                <p className="font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
                  Line Items in Snapshot ({inspectedRevision.lineItems.length})
                </p>
                <div className="border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-neutral-50 dark:bg-neutral-800/60 border-b border-neutral-200 dark:border-neutral-800 text-neutral-500">
                      <tr>
                        <th className="p-2">Item</th>
                        <th className="p-2 text-right">Qty</th>
                        <th className="p-2 text-right">Rate</th>
                        <th className="p-2 text-right">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                      {inspectedRevision.lineItems.map((li) => (
                        <tr key={li.id}>
                          <td className="p-2">
                            <span className="font-medium">{li.name}</span>
                            <span className="text-[10px] text-neutral-500 block truncate">{li.description}</span>
                          </td>
                          <td className="p-2 text-right font-mono">{li.quantity} {li.unit}</td>
                          <td className="p-2 text-right font-mono">
                            <CurrencyAmount amount={li.unitPrice} currency={quote.currency} />
                          </td>
                          <td className="p-2 text-right font-mono font-medium">
                            <CurrencyAmount amount={li.quantity * li.unitPrice} currency={quote.currency} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg flex items-center justify-between font-bold">
                <span>Grand Total at Revision {inspectedRevision.revisionNumber}:</span>
                <CurrencyAmount amount={inspectedRevision.grandTotal} currency={quote.currency} className="text-sm" />
              </div>
            </div>

            <div className="p-3 bg-neutral-50 dark:bg-neutral-800/60 border-t border-neutral-200 dark:border-neutral-800 flex justify-end">
              <button
                type="button"
                onClick={() => setInspectedRevision(null)}
                className="px-3.5 py-1.5 text-xs font-medium text-neutral-700 dark:text-neutral-300 bg-white dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 rounded-lg"
              >
                Close Snapshot
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
