import React, { useState } from 'react';
import { StorageService } from '../services/storage';
import { CatalogueItem, TaxCategory } from '../types';
import { useApp } from '../context/AppContext';
import { UploadCloud, CheckCircle2, AlertCircle, Download, X } from 'lucide-react';

interface CatalogueCsvImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess: (count: number) => void;
}

export const CatalogueCsvImportModal: React.FC<CatalogueCsvImportModalProps> = ({
  isOpen,
  onClose,
  onImportSuccess,
}) => {
  const { quoteDefaults, showToast } = useApp();

  const [step, setStep] = useState<'upload' | 'preview' | 'summary'>('upload');
  const [parsedRows, setParsedRows] = useState<Omit<CatalogueItem, 'id' | 'createdAt'>[]>([]);
  const [rowErrors, setRowErrors] = useState<{ row: number; error: string }[]>([]);
  const [importedCount, setImportedCount] = useState(0);

  if (!isOpen) return null;

  // Sample CSV template content
  const sampleCsvContent = `Item Name,SKU Code,Category,Unit,Unit Price,Tax Category,Description
Structural Steel Beam S275,STL-BM-01,Structural Steel,linear m,145.50,standard,Universal column beam supply and erection
Ready-Mix Concrete C30/37,CON-MX-01,Concrete & Groundworks,cu m,132.00,standard,Delivered pumped concrete pour
Site Security Floodlight Tower,EQP-LGT-01,Plant & Equipment,week,210.00,standard,Diesel mobile floodlight mast hire
Timber Hoarding Wall 2.4m,FNC-HRD-01,Site Safety & Setup,linear m,48.00,standard,Painted exterior timber boundary hoarding`;

  const handleDownloadTemplate = () => {
    const blob = new Blob([sampleCsvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'catalogue_import_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Downloaded sample CSV template', 'info');
  };

  const handleSimulateCsvUpload = () => {
    // Parse sample CSV data with realistic validation
    const lines = sampleCsvContent.split('\n').filter((l) => l.trim().length > 0);
    const rows: Omit<CatalogueItem, 'id' | 'createdAt'>[] = [];
    const errors: { row: number; error: string }[] = [];

    lines.slice(1).forEach((line, idx) => {
      const parts = line.split(',');
      if (parts.length >= 5) {
        const name = parts[0]?.trim();
        const code = parts[1]?.trim() || `ITM-${idx}`;
        const category = parts[2]?.trim() || 'General';
        const unit = parts[3]?.trim() || 'unit';
        const price = parseFloat(parts[4]?.trim() || '0');
        const taxCategory = (parts[5]?.trim() as TaxCategory) || 'standard';
        const description = parts[6]?.trim() || '';

        if (!name) {
          errors.push({ row: idx + 2, error: 'Item Name is missing' });
        } else if (isNaN(price) || price < 0) {
          errors.push({ row: idx + 2, error: `Invalid unit price: ${parts[4]}` });
        } else {
          rows.push({
            name,
            code,
            category,
            unit,
            unitPrice: price,
            currency: quoteDefaults.currency,
            taxCategory,
            description,
            isActive: true,
          });
        }
      }
    });

    setParsedRows(rows);
    setRowErrors(errors);
    setStep('preview');
  };

  const handleConfirmImport = () => {
    const count = StorageService.importCatalogueItems(parsedRows);
    setImportedCount(count);
    setStep('summary');
    onImportSuccess(count);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col text-xs">
        {/* Header */}
        <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 text-sm">
              Import Price Catalogue via CSV
            </h3>
            <p className="text-[11px] text-neutral-500">
              Bulk update or append trade rates into your business catalogue.
            </p>
          </div>
          <button onClick={onClose} className="p-1 text-neutral-400 hover:text-neutral-600">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
          {step === 'upload' && (
            <div className="space-y-4">
              <div className="p-4 border-2 border-dashed border-neutral-200 dark:border-neutral-700 rounded-xl text-center space-y-3">
                <UploadCloud className="w-8 h-8 text-neutral-400 mx-auto" />
                <div>
                  <p className="font-semibold text-neutral-900 dark:text-neutral-100">
                    Upload your CSV price file
                  </p>
                  <p className="text-[11px] text-neutral-500 mt-0.5">
                    Required headers: Item Name, SKU Code, Category, Unit, Unit Price, Tax Category, Description
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleSimulateCsvUpload}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-xs shadow-xs"
                >
                  Load Sample CSV Data
                </button>
              </div>

              <div className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-800/60 rounded-lg border border-neutral-100 dark:border-neutral-800">
                <span className="text-neutral-600 dark:text-neutral-400">
                  Need the template spreadsheet with correct headers?
                </span>
                <button
                  type="button"
                  onClick={handleDownloadTemplate}
                  className="inline-flex items-center gap-1.5 text-blue-600 dark:text-blue-400 font-semibold hover:underline"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Template</span>
                </button>
              </div>
            </div>
          )}

          {step === 'preview' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                  Validation Preview ({parsedRows.length} valid rows)
                </span>
                {rowErrors.length > 0 && (
                  <span className="text-rose-600 font-medium text-[11px]">
                    {rowErrors.length} errors flagged
                  </span>
                )}
              </div>

              {rowErrors.length > 0 && (
                <div className="p-2.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 rounded text-rose-800 text-[11px]">
                  {rowErrors.map((e, idx) => (
                    <p key={idx}>Row {e.row}: {e.error}</p>
                  ))}
                </div>
              )}

              <div className="border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden max-h-60 overflow-y-auto">
                <table className="w-full text-left">
                  <thead className="bg-neutral-50 dark:bg-neutral-800 text-neutral-500">
                    <tr>
                      <th className="p-2">Name</th>
                      <th className="p-2">SKU</th>
                      <th className="p-2">Category</th>
                      <th className="p-2">Unit</th>
                      <th className="p-2 text-right">Price</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                    {parsedRows.map((r, idx) => (
                      <tr key={idx}>
                        <td className="p-2 font-medium">{r.name}</td>
                        <td className="p-2 font-mono text-[10px] text-neutral-400">{r.code}</td>
                        <td className="p-2 text-neutral-500">{r.category}</td>
                        <td className="p-2 text-neutral-500">{r.unit}</td>
                        <td className="p-2 text-right font-mono font-bold">{r.unitPrice.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {step === 'summary' && (
            <div className="py-6 text-center space-y-3">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
              <div>
                <h4 className="font-bold text-neutral-900 dark:text-neutral-100 text-sm">
                  Import Successful
                </h4>
                <p className="text-neutral-500 text-[11px] mt-1">
                  Added {importedCount} new items to your price catalogue.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-neutral-50 dark:bg-neutral-800/60 border-t border-neutral-200 dark:border-neutral-800 flex justify-end gap-2">
          {step === 'upload' && (
            <button onClick={onClose} className="px-3 py-1.5 text-neutral-600">Cancel</button>
          )}

          {step === 'preview' && (
            <>
              <button onClick={() => setStep('upload')} className="px-3 py-1.5 text-neutral-600">
                Back
              </button>
              <button
                onClick={handleConfirmImport}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded font-semibold shadow-xs"
              >
                Confirm Import ({parsedRows.length} Items)
              </button>
            </>
          )}

          {step === 'summary' && (
            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 rounded font-semibold"
            >
              Done
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
