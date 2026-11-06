import React, { useState } from 'react';
import { Quote, Customer } from '../../types';
import { useApp } from '../../context/AppContext';
import { quoteAdapter } from '../../services/quoteAdapter';
import { CurrencyAmount } from '../ui/CurrencyAmount';
import {
  Send,
  X,
  FileCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  RotateCcw,
} from 'lucide-react';

interface SendQuoteModalProps {
  quote: Quote;
  customer?: Customer;
  isOpen: boolean;
  onClose: () => void;
  onSentSuccess: () => void;
}

export const SendQuoteModal: React.FC<SendQuoteModalProps> = ({
  quote,
  customer,
  isOpen,
  onClose,
  onSentSuccess,
}) => {
  const { currentUser, showToast, refreshQuotes, refreshActivities } = useApp();

  const [recipient, setRecipient] = useState(customer?.email || '');
  const [cc, setCc] = useState('');
  const [subject, setSubject] = useState(
    `Quotation ${quote.quoteNumber}: ${quote.title}`
  );
  const [message, setMessage] = useState(
    `Dear ${customer?.name || 'Customer'},\n\nPlease review our formal quotation (${quote.quoteNumber}, Revision ${quote.currentRevision}) for your project.\n\nAll rates, scope of works, and commercial terms are itemized in the attached quotation document. Feel free to contact us with any questions.\n\nWarm regards,\n${currentUser.name}\nApex Civil & Building Services`
  );

  const [sendState, setSendState] = useState<'idle' | 'sending' | 'accepted' | 'failed'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleSend = async () => {
    if (!recipient || !recipient.includes('@')) {
      showToast('Please provide a valid recipient email address', 'warning');
      return;
    }

    setSendState('sending');
    setErrorMessage('');

    try {
      const result = await quoteAdapter.sendApprovedQuotation(
        {
          quoteId: quote.id,
          revisionNumber: quote.currentRevision,
          recipientEmail: recipient,
          ccEmail: cc,
          subject,
          message,
          idempotencyKey: `send_${quote.id}_rev${quote.currentRevision}_${Date.now()}`,
        },
        currentUser
      );

      if (result.status === 'delivered' || result.status === 'provider_accepted') {
        setSendState('accepted');
        refreshQuotes();
        refreshActivities();
        if (result.isSimulated) {
          showToast('Quotation recorded and sent via simulated dispatch', 'success');
        } else {
          showToast('Quotation sent to client via n8n & Gmail successfully!', 'success');
        }
        setTimeout(() => {
          onSentSuccess();
        }, 1200);
      } else {
        setSendState('failed');
        setErrorMessage(result.error || 'Mail delivery was rejected by gateway.');
      }
    } catch {
      setSendState('failed');
      setErrorMessage('Unexpected delivery timeout. Safe retry available.');
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-2xl max-w-xl w-full overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Send className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
              Deliver Approved Quotation
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-5 space-y-4 text-xs overflow-y-auto max-h-[75vh]">
          {/* n8n delivery note */}
          <div className="p-2.5 rounded-lg bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 text-blue-800 dark:text-blue-200">
            <span className="font-semibold block flex items-center gap-1.5">
              <span>n8n Cloud Automation Dispatch</span>
              <span className="px-1.5 py-0.2 text-[9px] font-bold bg-blue-200 text-blue-900 rounded">LIVE</span>
            </span>
            <p className="text-[11px] text-blue-700 dark:text-blue-300 mt-0.5">
              Connected to n8n webhook (<code className="font-mono">mawamehar21@gmail.com</code>). Approved revision (Rev {quote.currentRevision}) and itemized breakdown will be delivered to the client.
            </p>
          </div>

          {/* Attachment Preview Capsule */}
          <div className="p-3 bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700/80 rounded-lg flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded bg-white dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 flex items-center justify-center text-blue-600 shrink-0">
                <FileCheck className="w-4 h-4" />
              </div>
              <div>
                <span className="font-semibold text-neutral-900 dark:text-neutral-100 block">
                  {quote.quoteNumber}_Rev{quote.currentRevision}.pdf
                </span>
                <span className="text-[10px] text-neutral-500">
                  Approved Revision {quote.currentRevision} · Immutable Snapshot
                </span>
              </div>
            </div>
            <div className="text-right shrink-0">
              <CurrencyAmount
                amount={quote.grandTotal}
                currency={quote.currency}
                className="font-bold text-neutral-900 dark:text-neutral-100"
              />
            </div>
          </div>

          {/* Form fields */}
          <div className="space-y-3">
            <div>
              <label className="font-medium text-neutral-700 dark:text-neutral-300 block mb-1">
                Recipient Email:
              </label>
              <input
                type="email"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="client@company.com"
                className="w-full px-3 py-1.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-xs font-mono"
              />
            </div>

            <div>
              <label className="font-medium text-neutral-700 dark:text-neutral-300 block mb-1">
                CC (Optional):
              </label>
              <input
                type="email"
                value={cc}
                onChange={(e) => setCc(e.target.value)}
                placeholder="estimating@apexcivil.example.com"
                className="w-full px-3 py-1.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-xs font-mono"
              />
            </div>

            <div>
              <label className="font-medium text-neutral-700 dark:text-neutral-300 block mb-1">
                Subject Line:
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3 py-1.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-xs font-medium"
              />
            </div>

            <div>
              <label className="font-medium text-neutral-700 dark:text-neutral-300 block mb-1">
                Cover Message:
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={5}
                className="w-full p-2.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-xs leading-relaxed resize-y font-mono text-[11px]"
              />
            </div>
          </div>

          {/* Error Message if failed */}
          {sendState === 'failed' && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 rounded-lg flex items-start gap-2 text-rose-800 dark:text-rose-200">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <strong className="font-semibold block">Delivery Failed</strong>
                <p className="text-[11px] text-rose-700 dark:text-rose-300 mt-0.5">{errorMessage}</p>
              </div>
            </div>
          )}

          {/* Success State */}
          {sendState === 'accepted' && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900 rounded-lg flex items-center gap-2 text-emerald-800 dark:text-emerald-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <div>
                <strong className="font-semibold block">Simulated Email Sent</strong>
                <p className="text-[11px] text-emerald-700 dark:text-emerald-300">
                  Delivery recorded to {recipient}. Quote marked as Sent.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-neutral-50 dark:bg-neutral-800/60 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-2 text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-lg transition-colors"
          >
            Cancel
          </button>

          {sendState === 'failed' ? (
            <button
              type="button"
              onClick={handleSend}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg text-xs font-semibold shadow-xs"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Retry Send</span>
            </button>
          ) : (
            <button
              type="button"
              disabled={sendState === 'sending' || sendState === 'accepted'}
              onClick={handleSend}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
            >
              {sendState === 'sending' ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Transmitting...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Quotation Email</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
