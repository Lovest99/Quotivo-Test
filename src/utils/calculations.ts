/**
 * Decimal-safe Financial Calculation Engine for AI Quote Generator
 *
 * Implements authoritative deterministic calculation order:
 * 1. Line Amount = round(Quantity * UnitPrice)
 * 2. Line Discount = round(Line Amount * (DiscountPercent / 100))
 * 3. Line Net (Taxable) = Line Amount - Line Discount
 * 4. Line Tax = round(Line Net * (TaxRate / 100))
 * 5. Subtotal = sum of all Line Amounts
 * 6. Total Discounts = sum of all Line Discounts
 * 7. Total Tax = sum of all Line Taxes
 * 8. Grand Total = Subtotal - Total Discounts + Total Tax
 * 9. Deposit Amount = round(Grand Total * (DepositPercent / 100))
 * 10. Remaining Balance = Grand Total - Deposit Amount
 */

import { QuoteLineItem } from '../types';

export interface CalculatedLine {
  lineAmount: number;
  discountAmount: number;
  taxableAmount: number;
  taxAmount: number;
  totalWithTax: number;
  hasMissingPrice: boolean;
}

export interface QuoteTotalsBreakdown {
  subtotal: number;
  discountTotal: number;
  taxableTotal: number;
  taxTotal: number;
  grandTotal: number;
  depositAmount: number;
  remainingBalance: number;
  hasMissingPrices: boolean;
  hasUnmatchedItems: boolean;
  hasAssumedQuantities: boolean;
  lineCalculations: Record<string, CalculatedLine>;
}

/**
 * Rounds a number strictly to two decimal places (cents)
 */
export function roundCurrency(val: number): number {
  if (isNaN(val) || !isFinite(val)) return 0;
  return Math.round((val + Number.EPSILON) * 100) / 100;
}

export function calculateLineItem(item: QuoteLineItem): CalculatedLine {
  const quantity = Math.max(0, item.quantity || 0);
  const unitPrice = item.unitPrice !== undefined && item.unitPrice !== null ? item.unitPrice : 0;
  const isMissing = item.isPriceRequired || item.unitPrice === undefined || item.unitPrice === null || item.unitPrice === 0;

  const lineAmount = roundCurrency(quantity * unitPrice);

  const discountPercent = Math.min(100, Math.max(0, item.discountPercent || 0));
  const discountAmount = discountPercent > 0 ? roundCurrency(lineAmount * (discountPercent / 100)) : 0;

  const taxableAmount = Math.max(0, roundCurrency(lineAmount - discountAmount));

  const taxRate = Math.max(0, item.taxRate || 0);
  const taxAmount = taxRate > 0 ? roundCurrency(taxableAmount * (taxRate / 100)) : 0;

  const totalWithTax = roundCurrency(taxableAmount + taxAmount);

  return {
    lineAmount,
    discountAmount,
    taxableAmount,
    taxAmount,
    totalWithTax,
    hasMissingPrice: isMissing,
  };
}

export function calculateQuoteTotals(
  items: QuoteLineItem[],
  depositPercent: number = 0
): QuoteTotalsBreakdown {
  let subtotal = 0;
  let discountTotal = 0;
  let taxableTotal = 0;
  let taxTotal = 0;
  let hasMissingPrices = false;
  let hasUnmatchedItems = false;
  let hasAssumedQuantities = false;

  const lineCalculations: Record<string, CalculatedLine> = {};

  for (const item of items) {
    const calc = calculateLineItem(item);
    lineCalculations[item.id] = calc;

    subtotal = roundCurrency(subtotal + calc.lineAmount);
    discountTotal = roundCurrency(discountTotal + calc.discountAmount);
    taxableTotal = roundCurrency(taxableTotal + calc.taxableAmount);
    taxTotal = roundCurrency(taxTotal + calc.taxAmount);

    if (calc.hasMissingPrice || item.isPriceRequired) {
      hasMissingPrices = true;
    }
    if (item.isCustom && !item.catalogueItemId) {
      hasUnmatchedItems = true;
    }
    if (item.isAssumedQuantity) {
      hasAssumedQuantities = true;
    }
  }

  const grandTotal = roundCurrency(subtotal - discountTotal + taxTotal);

  const safeDepositPct = Math.min(100, Math.max(0, depositPercent || 0));
  const depositAmount = safeDepositPct > 0 ? roundCurrency(grandTotal * (safeDepositPct / 100)) : 0;
  const remainingBalance = roundCurrency(grandTotal - depositAmount);

  return {
    subtotal,
    discountTotal,
    taxableTotal,
    taxTotal,
    grandTotal,
    depositAmount,
    remainingBalance,
    hasMissingPrices,
    hasUnmatchedItems,
    hasAssumedQuantities,
    lineCalculations,
  };
}
