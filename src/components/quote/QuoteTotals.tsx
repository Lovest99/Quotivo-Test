import React from 'react';
import { QuoteLineItem } from '../../types';
import { calculateQuoteTotals } from '../../utils/calculations';
import { CurrencyAmount } from '../ui/CurrencyAmount';
import { Percent, ShieldAlert } from 'lucide-react';

interface QuoteTotalsProps {
  items: QuoteLineItem[];
  currency: string;
  depositPercent?: number;
  onDepositPercentChange?: (val: number) => void;
  isEditable?: boolean;
}

export const QuoteTotals: React.FC<QuoteTotalsProps> = ({
  items,
  currency,
  depositPercent = 0,
  onDepositPercentChange,
  isEditable = false,
}) => {
  const totals = calculateQuoteTotals(items, depositPercent);

  return (
    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-5 space-y-4">
      <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
          Financial Summary
        </h4>
        <span className="text-xs font-mono font-medium text-neutral-400">
          Currency: {currency}
        </span>
      </div>

      <div className="space-y-2 text-xs">
        <div className="flex items-center justify-between text-neutral-600 dark:text-neutral-400">
          <span>Subtotal (Items)</span>
          <CurrencyAmount amount={totals.subtotal} currency={currency} className="text-sm font-semibold text-neutral-900 dark:text-neutral-100" />
        </div>

        {totals.discountTotal > 0 && (
          <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400">
            <span>Discounts Applied</span>
            <span className="font-mono tabular-nums font-medium">
              -<CurrencyAmount amount={totals.discountTotal} currency={currency} />
            </span>
          </div>
        )}

        <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400">
          <span>Taxable Net Amount</span>
          <CurrencyAmount amount={totals.taxableTotal} currency={currency} />
        </div>

        <div className="flex items-center justify-between text-neutral-600 dark:text-neutral-400">
          <span>Estimated Sales / Services Tax</span>
          <CurrencyAmount amount={totals.taxTotal} currency={currency} className="font-semibold text-neutral-800 dark:text-neutral-200" />
        </div>

        <div className="pt-2 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between text-sm">
          <span className="font-bold text-neutral-900 dark:text-neutral-100">Total Quotation Value</span>
          <CurrencyAmount
            amount={totals.grandTotal}
            currency={currency}
            className="text-base font-bold text-neutral-900 dark:text-neutral-100"
          />
        </div>

        {/* Deposit Terms Configuration */}
        <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800 space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs text-neutral-600 dark:text-neutral-400 flex items-center gap-1.5">
              <Percent className="w-3 h-3 text-neutral-400" />
              <span>Required Deposit</span>
            </label>
            {isEditable && onDepositPercentChange ? (
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="5"
                  value={depositPercent}
                  onChange={(e) => onDepositPercentChange(Number(e.target.value) || 0)}
                  className="w-14 px-2 py-0.5 text-xs text-right border border-neutral-200 dark:border-neutral-700 rounded bg-white dark:bg-neutral-800 font-mono"
                />
                <span className="text-xs text-neutral-500">%</span>
              </div>
            ) : (
              <span className="font-mono text-xs">{depositPercent}%</span>
            )}
          </div>

          {depositPercent > 0 && (
            <>
              <div className="flex items-center justify-between text-[11px] text-neutral-500">
                <span>Deposit Due Upon Acceptance</span>
                <CurrencyAmount amount={totals.depositAmount} currency={currency} className="font-medium text-neutral-800 dark:text-neutral-200" />
              </div>
              <div className="flex items-center justify-between text-[11px] text-neutral-500">
                <span>Remaining Balance on Completion</span>
                <CurrencyAmount amount={totals.remainingBalance} currency={currency} className="font-medium text-neutral-800 dark:text-neutral-200" />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Warnings & Missing Data Flags */}
      {totals.hasMissingPrices && (
        <div className="p-2.5 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/60 rounded-lg text-rose-800 dark:text-rose-200 text-xs flex items-start gap-2">
          <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <strong className="font-semibold">Missing Line Prices Detected</strong>
            <p className="text-[11px] text-rose-700 dark:text-rose-300 mt-0.5 leading-relaxed">
              Every item must have a valid unit price before this revision can be approved or sent.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
