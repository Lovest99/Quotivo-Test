import React, { forwardRef } from 'react';
import { Quote, Customer, BusinessSettings, TemplateConfig } from '../../types';
import { CurrencyAmount } from '../ui/CurrencyAmount';
import { formatDate } from '../../utils/formatters';
import { calculateLineItem, calculateQuoteTotals } from '../../utils/calculations';
import { CheckCircle2, ShieldCheck, AlertCircle } from 'lucide-react';

interface QuoteDocumentProps {
  quote: Quote;
  customer?: Customer;
  business: BusinessSettings;
  template?: TemplateConfig;
  className?: string;
}

export const QuoteDocument = forwardRef<HTMLDivElement, QuoteDocumentProps>(
  ({ quote, customer, business, template, className = '' }, ref) => {
    const totals = calculateQuoteTotals(quote.lineItems, quote.depositPercent);
    const layout = template?.layout || 'standard';
    const isFinalized =
      quote.status === 'approved' ||
      quote.status === 'sent' ||
      quote.status === 'accepted';
    const latestApproval =
      quote.approvalHistory && quote.approvalHistory.length > 0
        ? quote.approvalHistory[quote.approvalHistory.length - 1]
        : null;

    return (
      <div
        ref={ref}
        id="quote-document-printable"
        className={`print-document bg-white text-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-4 sm:p-8 md:p-12 shadow-sm max-w-4xl mx-auto space-y-6 sm:space-y-8 font-sans relative ${className}`}
      >
      {/* Header zone */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 border-b border-neutral-200 pb-8">
        <div>
          <div className="flex items-center gap-3.5">
            {business.logoUrl ? (
              <img
                src={business.logoUrl}
                alt={`${business.name} Logo`}
                className="h-10 max-w-[140px] object-contain rounded-md border border-neutral-200/80 p-0.5 bg-white shrink-0"
              />
            ) : (
              <img
                src="/assets/aistudio/file_00000000d028821188b94c049d11936a_982d6ed1.png"
                alt="Quotivo Brand"
                className="h-8 w-auto object-contain shrink-0"
              />
            )}
            <div>
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-neutral-900 leading-tight">
                {business.name}
              </h1>
              {business.legalName && business.legalName !== business.name && (
                <p className="text-xs text-neutral-500 mt-0.5">{business.legalName}</p>
              )}
            </div>
          </div>

          <div className="mt-3 text-xs text-neutral-600 space-y-0.5">
            <p>{business?.address?.street || ''}</p>
            <p>
              {business?.address?.city || ''}{business?.address?.state ? `, ${business.address.state}` : ''} {business?.address?.postalCode || ''}
            </p>
            <p>{business?.email} · {business?.phone}</p>
            {business?.taxRegistrationNumber && (
              <p className="text-[11px] text-neutral-400 font-mono mt-1">
                Tax Reg: {business.taxRegistrationNumber}
              </p>
            )}
          </div>
        </div>

        <div className="text-left sm:text-right space-y-1">
          <span className="text-xs font-mono uppercase tracking-widest text-neutral-400 font-semibold block">
            {layout === 'service_proposal' ? 'COMMERCIAL PROPOSAL' : layout === 'construction_estimate' ? 'CONSTRUCTION ESTIMATE' : 'QUOTATION'}
          </span>
          <p className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-neutral-900">
            {quote.quoteNumber}
          </p>
          <div className="text-xs text-neutral-500 space-y-0.5 pt-1">
            <p>
              Revision: <strong className="font-mono text-neutral-900">Rev {quote.currentRevision}</strong>
            </p>
            <p>Date Issued: <span className="font-medium text-neutral-700">{formatDate(quote.issueDate)}</span></p>
            <p>Valid Until: <span className="font-medium text-neutral-700">{formatDate(quote.validUntil)}</span></p>
            {isFinalized && latestApproval ? (
              <div className="pt-1.5 flex items-center sm:justify-end gap-1.5 text-[11px] font-mono text-emerald-800">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>
                  Approved Rev {latestApproval.revisionApproved} · {latestApproval.approvedByName}
                </span>
              </div>
            ) : (
              <div className="pt-1.5 flex items-center sm:justify-end gap-1.5 text-[11px] font-mono text-amber-700">
                <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>Draft Rev {quote.currentRevision} (Pending Approval)</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Addresses / Party Details */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
        <div className="space-y-1.5 p-4 rounded-lg bg-neutral-50 border border-neutral-100">
          <p className="font-semibold uppercase tracking-wider text-neutral-400 text-[10px]">
            Quotation Prepared For
          </p>
          <p className="font-bold text-sm text-neutral-900">
            {customer?.companyName || customer?.name}
          </p>
          {customer?.companyName && customer?.name && (
            <p className="text-neutral-700 font-medium">Attn: {customer.name}</p>
          )}
          <p className="text-neutral-600">{customer?.email}</p>
          <p className="text-neutral-600">{customer?.phone}</p>
          {customer?.billingAddress && (
            <p className="text-neutral-500 pt-1 leading-relaxed">
              {customer.billingAddress.street}, {customer.billingAddress.city}, {customer.billingAddress.state} {customer.billingAddress.postalCode}
            </p>
          )}
        </div>

        <div className="space-y-1.5 p-4 rounded-lg bg-neutral-50 border border-neutral-100">
          <p className="font-semibold uppercase tracking-wider text-neutral-400 text-[10px]">
            Project & Site Location
          </p>
          <p className="font-bold text-sm text-neutral-900">{quote.title}</p>
          {customer?.siteAddress ? (
            <div className="text-neutral-600 pt-1 leading-relaxed">
              <span className="font-medium text-neutral-700 block">Site Delivery Address:</span>
              <p>{customer.siteAddress.street}</p>
              <p>
                {customer.siteAddress.city}, {customer.siteAddress.state} {customer.siteAddress.postalCode}
              </p>
            </div>
          ) : (
            <p className="text-neutral-500 italic pt-1">Site address as per client billing address</p>
          )}
        </div>
      </div>

      {/* Scope of Works Section */}
      {quote.scopeSummary && (
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
            {template?.scopeHeading || 'Scope of Works'}
          </h3>
          <p className="text-xs text-neutral-700 leading-relaxed bg-white border-l-2 border-neutral-900 pl-3 py-1">
            {quote.scopeSummary}
          </p>
        </div>
      )}

      {/* Items Table & Mobile Cards */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
          Schedule of Quantities & Rates
        </h3>

        {/* Desktop & Printable Table */}
        <div className="hidden sm:block border border-neutral-200 rounded-lg overflow-x-auto desktop-only-doc">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-neutral-100/70 border-b border-neutral-200 text-neutral-600 font-semibold">
                <th className="py-2.5 px-3 w-8">#</th>
                <th className="py-2.5 px-3">Description & Specification</th>
                <th className="py-2.5 px-3 w-20 text-right">Qty</th>
                <th className="py-2.5 px-3 w-16">Unit</th>
                <th className="py-2.5 px-3 w-24 text-right">Unit Rate</th>
                <th className="py-2.5 px-3 w-24 text-right">Line Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {quote.lineItems.map((item, index) => {
                const calc = calculateLineItem(item);
                return (
                  <tr key={item.id} className="hover:bg-neutral-50/50">
                    <td className="py-2.5 px-3 align-top font-mono text-neutral-400">{index + 1}</td>
                    <td className="py-2.5 px-3 align-top space-y-0.5">
                      <span className="font-semibold text-neutral-900 block">{item.name}</span>
                      <p className="text-[11px] text-neutral-600 leading-relaxed">{item.description}</p>
                    </td>
                    <td className="py-2.5 px-3 align-top text-right font-mono tabular-nums">
                      {item.quantity}
                    </td>
                    <td className="py-2.5 px-3 align-top text-neutral-500">{item.unit}</td>
                    <td className="py-2.5 px-3 align-top text-right font-mono tabular-nums">
                      <CurrencyAmount amount={item.unitPrice} currency={quote.currency} />
                    </td>
                    <td className="py-2.5 px-3 align-top text-right font-mono tabular-nums font-semibold">
                      <CurrencyAmount amount={calc.taxableAmount} currency={quote.currency} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile Interactive Cards (Zero horizontal scroll, full rate visibility) */}
        <div className="sm:hidden space-y-2.5 mobile-only-doc">
          {quote.lineItems.map((item, index) => {
            const calc = calculateLineItem(item);
            return (
              <div
                key={item.id}
                className="p-3.5 rounded-lg border border-neutral-200/90 bg-neutral-50/50 space-y-2 text-xs"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2">
                    <span className="font-mono text-[11px] font-semibold text-neutral-400 bg-neutral-200/60 px-1.5 py-0.5 rounded shrink-0">
                      #{index + 1}
                    </span>
                    <div>
                      <span className="font-bold text-neutral-900 block leading-snug">
                        {item.name}
                      </span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <CurrencyAmount
                      amount={calc.taxableAmount}
                      currency={quote.currency}
                      className="font-bold text-sm text-neutral-900 font-mono tabular-nums block"
                    />
                    <span className="text-[10px] text-neutral-400 uppercase font-medium">Line Total</span>
                  </div>
                </div>

                {item.description && (
                  <p className="text-[11px] text-neutral-600 leading-relaxed pl-6">
                    {item.description}
                  </p>
                )}

                <div className="flex items-center justify-between pt-1.5 border-t border-neutral-200/60 pl-6 text-[11px]">
                  <span className="text-neutral-500 font-medium">
                    Rate: <CurrencyAmount amount={item.unitPrice} currency={quote.currency} className="text-neutral-800 font-mono font-semibold" /> / {item.unit}
                  </span>
                  <span className="font-mono text-neutral-800 font-semibold bg-white px-2 py-0.5 rounded border border-neutral-200">
                    Qty: {item.quantity} {item.unit}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Totals & Terms Split */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-2">
        {/* Payment Terms & Notes */}
        <div className="space-y-4 text-xs">
          {quote.paymentTerms && (
            <div>
              <span className="font-semibold text-neutral-700 block mb-1">Commercial & Payment Terms:</span>
              <p className="text-neutral-600 leading-relaxed bg-neutral-50 p-2.5 rounded border border-neutral-100">
                {quote.paymentTerms}
              </p>
            </div>
          )}

          {quote.exclusions && (
            <div>
              <span className="font-semibold text-neutral-700 block mb-1">Exclusions & Site Conditions:</span>
              <p className="text-neutral-500 text-[11px] leading-relaxed">{quote.exclusions}</p>
            </div>
          )}

          {quote.notes && (
            <div>
              <span className="font-semibold text-neutral-700 block mb-1">Notes:</span>
              <p className="text-neutral-500 text-[11px] leading-relaxed">{quote.notes}</p>
            </div>
          )}
        </div>

        {/* Financial Breakdown Table */}
        <div className="space-y-2 text-xs bg-neutral-50 p-4 rounded-lg border border-neutral-100">
          <div className="flex items-center justify-between text-neutral-600">
            <span>Subtotal (Net Items)</span>
            <CurrencyAmount amount={totals.subtotal} currency={quote.currency} className="font-medium" />
          </div>

          {totals.discountTotal > 0 && (
            <div className="flex items-center justify-between text-emerald-700">
              <span>Discounts Applied</span>
              <span className="font-mono">
                -<CurrencyAmount amount={totals.discountTotal} currency={quote.currency} />
              </span>
            </div>
          )}

          <div className="flex items-center justify-between text-neutral-600">
            <span>Applicable Tax</span>
            <CurrencyAmount amount={totals.taxTotal} currency={quote.currency} className="font-medium" />
          </div>

          <div className="pt-2 border-t border-neutral-200 flex items-center justify-between text-base font-bold text-neutral-900">
            <span>Grand Total</span>
            <CurrencyAmount amount={totals.grandTotal} currency={quote.currency} className="text-lg" />
          </div>

          {totals.depositAmount > 0 && (
            <div className="pt-2 border-t border-neutral-200 space-y-1 text-[11px]">
              <div className="flex items-center justify-between font-semibold text-neutral-800">
                <span>Deposit Payable ({quote.depositPercent}%):</span>
                <CurrencyAmount amount={totals.depositAmount} currency={quote.currency} />
              </div>
              <div className="flex items-center justify-between text-neutral-500">
                <span>Balance on Handover:</span>
                <CurrencyAmount amount={totals.remainingBalance} currency={quote.currency} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Signature & Sign-off footer */}
      <div className="pt-8 border-t border-neutral-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-neutral-500">
        <div>
          <p className="font-medium text-neutral-800">
            {template?.preparedByHeading || 'Quotation Prepared by'}: {quote.createdByName}
          </p>
          <p className="text-[11px] text-neutral-400">
            {business.name} · Estimating & Commercial Division
          </p>
          {isFinalized && latestApproval && (
            <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-neutral-50 border border-neutral-200 text-[11px] text-neutral-700 font-mono">
              <ShieldCheck className="w-3.5 h-3.5 text-neutral-800" />
              <span>
                Certified Finalized Quote · Rev {latestApproval.revisionApproved} approved by {latestApproval.approvedByName}
              </span>
            </div>
          )}
        </div>
        <p className="text-[11px] text-neutral-400 sm:text-right max-w-xs">
          {template?.footerMessage || 'This quotation is valid subject to standard trading terms.'}
        </p>
      </div>
    </div>
  );
});

QuoteDocument.displayName = 'QuoteDocument';
