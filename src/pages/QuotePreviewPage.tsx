import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { StorageService } from '../services/storage';
import { Quote } from '../types';
import { QuoteDocument } from '../components/quote/QuoteDocument';
import { SendQuoteModal } from '../components/quote/SendQuoteModal';
import { exportQuoteToPdf } from '../utils/pdfExport';
import { formatDate } from '../utils/formatters';
import {
  Printer,
  Download,
  ArrowLeft,
  Edit,
  Send,
  CheckCircle2,
  AlertCircle,
  Loader2,
  FileCheck2,
  SlidersHorizontal,
  X,
  FileDown,
  ShieldCheck,
} from 'lucide-react';

export const QuotePreviewPage: React.FC = () => {
  const { quoteId } = useParams<{ quoteId: string }>();
  const navigate = useNavigate();
  const { customers, business, templates, showToast, currentUser, refreshActivities } = useApp();

  const [quote, setQuote] = useState<Quote | null>(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('tpl_standard');
  const [isSendModalOpen, setIsSendModalOpen] = useState(false);

  // PDF Export states
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState<string>('');
  const [isDraftWarningModalOpen, setIsDraftWarningModalOpen] = useState(false);
  const [isExportOptionsModalOpen, setIsExportOptionsModalOpen] = useState(false);
  const [customFileName, setCustomFileName] = useState('');
  const [includeDraftWatermark, setIncludeDraftWatermark] = useState(true);

  const documentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!quoteId) return;
    const found = StorageService.getQuoteById(quoteId);
    if (found) {
      setQuote(found);
      const defaultName = `${found.quoteNumber.replace(/[^a-zA-Z0-9-_]/g, '_')}_Rev${found.currentRevision}_Quotation.pdf`;
      setCustomFileName(defaultName);
    } else {
      showToast('Quotation not found', 'error');
      navigate('/app/quotes');
    }
  }, [quoteId, navigate, showToast]);

  if (!quote) {
    return (
      <div className="p-8 text-center text-xs text-neutral-500 flex items-center justify-center gap-2">
        <Loader2 className="w-4 h-4 animate-spin text-neutral-400" />
        <span>Loading document preview...</span>
      </div>
    );
  }

  const customer = customers.find((c) => c.id === quote.customerId);
  const activeTemplate = templates.find((t) => t.id === selectedTemplateId) || templates[0];
  const isFinalized =
    quote.status === 'approved' ||
    quote.status === 'sent' ||
    quote.status === 'accepted';
  const latestApproval =
    quote.approvalHistory && quote.approvalHistory.length > 0
      ? quote.approvalHistory[quote.approvalHistory.length - 1]
      : null;

  const handlePrint = () => {
    window.print();
  };

  const handleExportPdf = async (forceDraftExport = false) => {
    if (!documentRef.current) {
      showToast('Document container not ready for capture', 'error');
      return;
    }

    // If not finalized and user hasn't explicitly confirmed draft export, prompt them
    if (!isFinalized && !forceDraftExport) {
      setIsDraftWarningModalOpen(true);
      return;
    }

    try {
      setIsExporting(true);
      setExportProgress('Preparing document...');

      const targetFileName = customFileName.trim().length > 0
        ? (customFileName.endsWith('.pdf') ? customFileName : `${customFileName}.pdf`)
        : undefined;

      await exportQuoteToPdf(documentRef.current, {
        fileName: targetFileName,
        quoteNumber: quote.quoteNumber,
        revision: quote.currentRevision,
        businessName: business.name,
        isDraft: !isFinalized,
        watermarkText: !isFinalized && includeDraftWatermark ? 'DRAFT — NOT FINALIZED' : undefined,
        onProgress: (status) => setExportProgress(status),
      });

      // Record activity log
      StorageService.addActivity({
        quoteId: quote.id,
        customerId: quote.customerId,
        type: 'quote_exported',
        title: isFinalized
          ? `Finalized Quote PDF Exported`
          : `Draft Quote PDF Exported`,
        description: isFinalized
          ? `Exported official certified quotation ${quote.quoteNumber} (Rev ${quote.currentRevision}) as PDF.`
          : `Exported draft preview ${quote.quoteNumber} (Rev ${quote.currentRevision}) as PDF with draft notice.`,
        performedBy: currentUser.id,
        performedByName: currentUser.name,
        timestamp: new Date().toISOString(),
        metadata: {
          revisionNumber: quote.currentRevision,
          status: quote.status,
          fileFormat: 'PDF',
          isFinalized,
        },
      });

      refreshActivities();
      showToast(`Exported ${quote.quoteNumber} (Rev ${quote.currentRevision}) as PDF`, 'success');
      setIsDraftWarningModalOpen(false);
      setIsExportOptionsModalOpen(false);
    } catch (err) {
      console.error('PDF export failed:', err);
      showToast('Failed to export PDF. Please try again or use the print dialog.', 'error');
    } finally {
      setIsExporting(false);
      setExportProgress('');
    }
  };

  return (
    <div className="px-2 py-3 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-4 sm:space-y-6">
      {/* Sticky Document Action Header (hidden in print) */}
      <div className="no-print sticky top-14 z-20 -mx-2 sm:-mx-6 lg:-mx-8 -mt-2 sm:-mt-6 lg:-mt-8 px-3 sm:px-6 lg:px-8 py-2 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md border-b border-neutral-200/90 dark:border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4 mb-4 sm:mb-6 transition-all shadow-2xs">
        <div className="flex items-center justify-between sm:justify-start gap-2.5">
          <div className="flex items-center gap-2">
            <Link
              to={`/app/quotes/${quote.id}`}
              className="p-1.5 text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              title="Back to quote"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-bold text-sm text-neutral-900 dark:text-neutral-100">
                  {quote.quoteNumber}
                </span>
                <span className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-semibold">
                  Rev {quote.currentRevision}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {isFinalized ? (
              <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                <CheckCircle2 className="w-3 h-3" />
                <span>Approved</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-semibold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-800">
                <AlertCircle className="w-3 h-3" />
                <span>Draft</span>
              </span>
            )}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
          {/* Template Switcher */}
          <select
            value={selectedTemplateId}
            onChange={(e) => setSelectedTemplateId(e.target.value)}
            className="flex-1 sm:flex-none px-2 py-1.5 text-xs bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg font-medium text-neutral-700 dark:text-neutral-200 focus:outline-none"
          >
            {templates.map((tpl) => (
              <option key={tpl.id} value={tpl.id}>
                Template: {tpl.name}
              </option>
            ))}
          </select>

          {/* Edit Shortcut */}
          <Link
            to={`/app/quotes/${quote.id}/edit`}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-750 text-neutral-800 dark:text-neutral-200 rounded-lg text-xs font-medium shadow-2xs transition-colors"
          >
            <Edit className="w-3.5 h-3.5 text-neutral-500" />
            <span className="hidden xs:inline">Edit</span>
          </Link>

          {/* Export Options trigger */}
          <button
            type="button"
            onClick={() => setIsExportOptionsModalOpen(true)}
            className="p-1.5 text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 transition-colors"
            title="PDF Export Configuration"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
          </button>

          {/* Primary Direct Export PDF Button */}
          <button
            type="button"
            onClick={() => handleExportPdf(false)}
            disabled={isExporting}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold shadow-xs transition-all ${
              isFinalized
                ? 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white'
                : 'bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-neutral-100 dark:text-neutral-900'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isExporting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Exporting...</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5" />
                <span>{isFinalized ? 'PDF' : 'Draft PDF'}</span>
              </>
            )}
          </button>

          {/* Secondary Print / Browser Dialog */}
          <button
            type="button"
            onClick={handlePrint}
            className="p-1.5 sm:px-3 sm:py-1.5 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-750 text-neutral-800 dark:text-neutral-200 rounded-lg text-xs font-medium shadow-2xs transition-colors"
            title="Print using browser dialog"
          >
            <Printer className="w-3.5 h-3.5 text-neutral-500" />
            <span className="hidden sm:inline ml-1">Print</span>
          </button>

          {/* Send by Email (for approved quotes) */}
          {isFinalized && (
            <button
              type="button"
              onClick={() => setIsSendModalOpen(true)}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send</span>
            </button>
          )}
        </div>
      </div>

      {/* Progress banner during active PDF export */}
      {isExporting && (
        <div className="no-print p-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 rounded-lg flex items-center justify-between text-xs text-blue-900 dark:text-blue-200 animate-in fade-in">
          <div className="flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-blue-600 dark:text-blue-400" />
            <span className="font-medium">{exportProgress || 'Generating PDF document...'}</span>
          </div>
          <span className="font-mono text-[11px] text-blue-600 dark:text-blue-400">
            A4 210mm × 297mm · 2x Resolution
          </span>
        </div>
      )}

      {/* Finalized Status Assurance Notice */}
      <div className="no-print">
        {isFinalized && latestApproval ? (
          <div className="p-3 bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-900/40 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-emerald-900 dark:text-emerald-200">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-700 dark:text-emerald-400 shrink-0" />
              <div>
                <span className="font-semibold">Official Finalized Quotation</span>
                <span className="text-emerald-700 dark:text-emerald-300 ml-1.5">
                  Rev {latestApproval.revisionApproved} approved by {latestApproval.approvedByName} on {formatDate(latestApproval.approvedAt)}.
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-emerald-700 dark:text-emerald-400 font-mono">
              <span>Ready for legal delivery</span>
            </div>
          </div>
        ) : (
          <div className="p-3 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-neutral-600 dark:text-neutral-400">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                <strong>Unapproved Draft Revision:</strong> This revision has not been approved. PDF export includes a draft watermark until approved.
              </span>
            </div>
            <Link
              to={`/app/quotes/${quote.id}`}
              className="text-blue-600 dark:text-blue-400 font-medium hover:underline text-xs"
            >
              Submit for Approval &rarr;
            </Link>
          </div>
        )}
      </div>

      {/* Render Quotation Document */}
      <QuoteDocument
        ref={documentRef}
        quote={quote}
        customer={customer}
        business={business}
        template={activeTemplate}
      />

      {/* Send by Email Modal */}
      {isSendModalOpen && (
        <SendQuoteModal
          quote={quote}
          customer={customer}
          isOpen={isSendModalOpen}
          onClose={() => setIsSendModalOpen(false)}
          onSentSuccess={() => {
            setIsSendModalOpen(false);
            const reloaded = StorageService.getQuoteById(quote.id);
            if (reloaded) setQuote(reloaded);
          }}
        />
      )}

      {/* Export Options Modal */}
      {isExportOptionsModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-6 max-w-md w-full shadow-lg space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3">
              <div className="flex items-center gap-2">
                <FileDown className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                  PDF Export Settings
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsExportOptionsModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-neutral-700 dark:text-neutral-300 font-medium mb-1">
                  Export Filename
                </label>
                <input
                  type="text"
                  value={customFileName}
                  onChange={(e) => setCustomFileName(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg font-mono text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="ApexCivil_QT-2027-0104.pdf"
                />
                <p className="text-[11px] text-neutral-500 mt-1">
                  Generated file will be downloaded directly into your browser downloads.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200/60 dark:border-neutral-700/60 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                    Document Specification:
                  </span>
                  <span className="font-mono text-neutral-600 dark:text-neutral-400">
                    ISO A4 (210 × 297 mm)
                  </span>
                </div>
                <div className="flex items-center justify-between text-neutral-500">
                  <span>Typography & Resolution:</span>
                  <span>Plus Jakarta Sans · 2× Scale</span>
                </div>
                <div className="flex items-center justify-between text-neutral-500">
                  <span>Layout Source:</span>
                  <span>Print Stylesheet Layout</span>
                </div>
              </div>

              {!isFinalized && (
                <div className="flex items-start gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="includeWatermark"
                    checked={includeDraftWatermark}
                    onChange={(e) => setIncludeDraftWatermark(e.target.checked)}
                    className="mt-0.5 rounded border-neutral-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="includeWatermark" className="text-neutral-600 dark:text-neutral-400 cursor-pointer">
                    Apply diagonal <strong className="text-neutral-900 dark:text-neutral-200">DRAFT</strong> watermark across unfinalized pages
                  </label>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-100 dark:border-neutral-800">
              <button
                type="button"
                onClick={() => setIsExportOptionsModalOpen(false)}
                className="px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 text-xs font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleExportPdf(true)}
                disabled={isExporting}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs"
              >
                {isExporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                <span>Download PDF Now</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Unapproved Draft Confirmation Modal */}
      {isDraftWarningModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-6 max-w-md w-full shadow-lg space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-amber-50 dark:bg-amber-950/40 text-amber-600 rounded-lg shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                  Export Unapproved Revision?
                </h3>
                <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1 leading-relaxed">
                  Quotation <strong>{quote.quoteNumber} (Rev {quote.currentRevision})</strong> has not been approved by an authorized approver.
                </p>
                <p className="text-xs text-neutral-500 mt-2 leading-relaxed">
                  Finalized exports carry an official approval certification. You can still export a draft PDF with a DRAFT watermark for preliminary internal review.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2 pt-2 border-t border-neutral-100 dark:border-neutral-800">
              <button
                type="button"
                onClick={() => setIsDraftWarningModalOpen(false)}
                className="px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 text-xs font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  navigate(`/app/quotes/${quote.id}`);
                }}
                className="px-3 py-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 hover:bg-neutral-200 text-xs font-medium"
              >
                Go to Approval
              </button>
              <button
                type="button"
                onClick={() => handleExportPdf(true)}
                className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-neutral-100 dark:text-neutral-900 rounded-lg text-xs font-semibold shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Draft PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
