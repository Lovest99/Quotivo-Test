import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { quoteAdapter, GenerationJobStatusResponse } from '../services/quoteAdapter';
import { useApp } from '../context/AppContext';
import {
  Sparkles,
  CheckCircle2,
  Clock,
  AlertTriangle,
  RotateCcw,
  ArrowRight,
  Loader2,
  FileText,
} from 'lucide-react';

export const GeneratingQuotePage: React.FC = () => {
  const { requestId } = useParams<{ requestId: string }>();
  const navigate = useNavigate();
  const { refreshQuotes, refreshActivities, showToast } = useApp();

  const [jobStatus, setJobStatus] = useState<GenerationJobStatusResponse | null>(null);
  const [hasTimedOut, setHasTimedOut] = useState(false);
  const [isBackgrounded, setIsBackgrounded] = useState(false);

  useEffect(() => {
    if (!requestId) return;

    let isMounted = true;
    let pollInterval: any = null;

    // Timeout fallback after 15 seconds
    const timeoutTimer = setTimeout(() => {
      if (isMounted && (!jobStatus || jobStatus.status !== 'completed')) {
        setHasTimedOut(true);
      }
    }, 15000);

    const poll = async () => {
      try {
        const response = await quoteAdapter.pollGenerationJob(requestId);
        if (!isMounted) return;
        setJobStatus(response);

        if (response.status === 'completed' && response.quoteId) {
          clearInterval(pollInterval);
          clearTimeout(timeoutTimer);
          refreshQuotes();
          refreshActivities();

          // Smooth transition to quote editor after brief confirmation
          setTimeout(() => {
            if (isMounted) {
              showToast('Quotation draft ready for human review', 'success');
              navigate(`/app/quotes/${response.quoteId}/edit`);
            }
          }, 600);
        } else if (response.status === 'failed') {
          clearInterval(pollInterval);
        }
      } catch (err) {
        console.error('Polling error:', err);
      }
    };

    poll();
    pollInterval = setInterval(poll, 700);

    return () => {
      isMounted = false;
      clearInterval(pollInterval);
      clearTimeout(timeoutTimer);
    };
  }, [requestId, navigate, refreshQuotes, refreshActivities, showToast]);

  const steps = [
    { key: 'received', label: 'Customer Request Received', desc: 'Verified customer details & scope prompt' },
    { key: 'interpreting', label: 'Interpreting Scope & Trade Items', desc: 'Decomposing materials, labour & plant requirements' },
    { key: 'matching_catalogue', label: 'Matching Business Price Catalogue', desc: 'Assigning trade SKUs, unit rates, and sales taxes' },
    { key: 'drafting', label: 'Preparing Quotation Draft', desc: 'Assembling revisions, payment terms & calculations' },
  ];

  const currentPercent = jobStatus?.progressPercent || 15;

  return (
    <div className="min-h-[75vh] flex items-center justify-center p-4">
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 sm:p-8 max-w-lg w-full shadow-lg space-y-6 text-center animate-in zoom-in-95 duration-200">
        {/* Animated Icon */}
        <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900/60 mx-auto flex items-center justify-center text-blue-600 dark:text-blue-400">
          <Sparkles className="w-6 h-6 animate-pulse" />
        </div>

        <div>
          <h2 className="text-lg font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
            {jobStatus?.status === 'completed'
              ? 'Quotation Draft Created!'
              : jobStatus?.status === 'failed'
              ? 'Generation Encountered an Issue'
              : 'Generating Quotation Draft'}
          </h2>
          <p className="text-xs text-neutral-500 mt-1">
            {jobStatus?.currentStepMessage || 'Matching trade items against price catalogue...'}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1.5">
          <div className="h-1.5 w-full bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 transition-all duration-300 ease-out"
              style={{ width: `${currentPercent}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] font-mono text-neutral-400">
            <span>Progress</span>
            <span>{currentPercent}%</span>
          </div>
        </div>

        {/* Staged Step Indicators */}
        <div className="space-y-3 text-left pt-2">
          {steps.map((st, index) => {
            const isDone =
              currentPercent >= (index + 1) * 25 ||
              jobStatus?.status === 'completed';
            const isCurrent =
              !isDone && currentPercent >= index * 25;

            return (
              <div
                key={st.key}
                className={`p-3 rounded-lg border text-xs flex items-center justify-between gap-3 transition-colors ${
                  isDone
                    ? 'border-neutral-200 dark:border-neutral-800 bg-neutral-50/60 dark:bg-neutral-800/40 text-neutral-900 dark:text-neutral-100'
                    : isCurrent
                    ? 'border-blue-300 dark:border-blue-800 bg-blue-50/30 dark:bg-blue-950/20 text-blue-900 dark:text-blue-100 font-medium'
                    : 'border-transparent text-neutral-400'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <div className="shrink-0">
                    {isDone ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : isCurrent ? (
                      <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                    ) : (
                      <Clock className="w-4 h-4 text-neutral-300" />
                    )}
                  </div>
                  <div className="truncate">
                    <p className="font-semibold truncate">{st.label}</p>
                    <p className="text-[10px] text-neutral-500 truncate">{st.desc}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Options for slow responses or background handling */}
        <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800 space-y-2">
          {!hasTimedOut ? (
            <button
              type="button"
              onClick={() => {
                setIsBackgrounded(true);
                showToast('Generation continuing in background. Check your quotes list.', 'info');
                navigate('/app/quotes');
              }}
              className="text-xs text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 underline"
            >
              Continue in Background
            </button>
          ) : (
            <div className="p-3 bg-amber-50 dark:bg-amber-950/50 rounded-lg border border-amber-200 text-xs text-amber-800 dark:text-amber-200 space-y-2 text-left">
              <div className="flex items-center gap-1.5 font-semibold">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Operation taking longer than usual</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                The mock generator or n8n workflow webhook is still processing. You can safely return to the dashboard or retry without creating duplicates.
              </p>
              <div className="flex items-center gap-2 pt-1">
                <Link
                  to="/app/quotes"
                  className="px-3 py-1.5 bg-neutral-900 text-white rounded text-[11px] font-medium"
                >
                  View Quotes
                </Link>
                <button
                  onClick={() => window.location.reload()}
                  className="px-3 py-1.5 border border-neutral-300 rounded text-[11px] font-medium"
                >
                  Retry Polling
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
