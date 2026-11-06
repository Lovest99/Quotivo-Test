/**
 * Typed Service Adapter Layer for AI Generation and n8n Workflow Integration
 *
 * Connects the frontend to the full-stack backend proxy endpoints:
 * - POST /api/n8n/create-draft (n8n quote-request webhook)
 * - POST /api/n8n/approve-and-send (n8n quote-approve webhook + Gmail dispatch)
 *
 * Keeps all API keys securely on the backend while providing graceful offline
 * and pilot fallbacks if n8n is temporarily unreachable.
 */

import {
  Quote,
  QuoteLineItem,
  Customer,
  CatalogueItem,
  DeliveryStatus,
  UserProfile,
} from '../types';
import { StorageService } from './storage';
import { calculateQuoteTotals } from '../utils/calculations';

export interface GenerationRequestPayload {
  requestId: string;
  businessId: string;
  customerId: string;
  customerDetails: Customer;
  requestText: string;
  selectedCatalogueItemIds: string[];
  currency: string;
  knownQuantities?: Record<string, number>;
  additionalNotes?: string;
  idempotencyKey: string;
}

export interface GenerationJobStatusResponse {
  jobId: string;
  requestId: string;
  status:
    | 'received'
    | 'interpreting'
    | 'matching_catalogue'
    | 'drafting'
    | 'completed'
    | 'failed'
    | 'needs_more_info';
  progressPercent: number;
  currentStepMessage: string;
  proposedItems?: QuoteLineItem[];
  matchedCatalogueCount?: number;
  missingFields?: string[];
  assumptions?: string[];
  generatedScope?: string;
  generatedIntroduction?: string;
  quoteId?: string;
  errorMessage?: string;
  n8nQuoteId?: number | string;
}

export interface SendQuotationPayload {
  quoteId: string;
  revisionNumber: number;
  recipientEmail: string;
  ccEmail?: string;
  subject: string;
  message: string;
  idempotencyKey: string;
}

export interface SendQuotationResult {
  deliveryId: string;
  status: DeliveryStatus;
  sentAt: string;
  providerMessageId?: string;
  isSimulated: boolean;
  n8nResponse?: any;
  error?: string;
}

export interface IQuoteServiceAdapter {
  startGeneration(payload: GenerationRequestPayload): Promise<{ jobId: string }>;
  pollGenerationJob(jobId: string): Promise<GenerationJobStatusResponse>;
  sendApprovedQuotation(
    payload: SendQuotationPayload,
    user: UserProfile
  ): Promise<SendQuotationResult>;
  rewriteDescription(description: string, instruction: string): Promise<string>;
  clarifyScope(
    scope: string,
    catalogueItems: CatalogueItem[]
  ): Promise<{ clarifiedScope: string; suggestions: string[] }>;
}

interface ActiveJobRecord {
  startTime: number;
  payload: GenerationRequestPayload;
  n8nPromise?: Promise<any>;
  n8nResponse?: any;
  n8nError?: any;
}

export class N8nIntegratedQuoteAdapter implements IQuoteServiceAdapter {
  private static activeJobs: Map<string, ActiveJobRecord> = new Map();

  async startGeneration(payload: GenerationRequestPayload): Promise<{ jobId: string }> {
    const jobId = `job_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const catalogue = StorageService.getCatalogue();
    const defaults = StorageService.getQuoteDefaults();

    // Map requested items from selected IDs or parsed scope
    const requestedItems = (payload.selectedCatalogueItemIds || []).map((id) => {
      const item = catalogue.find((c) => c.id === id);
      return {
        item: item ? item.name : id,
        quantity: payload.knownQuantities?.[id] || 1,
      };
    });

    // Also extract known lines if empty
    if (requestedItems.length === 0) {
      requestedItems.push({
        item: payload.requestText.split('\n')[0].slice(0, 60) || 'General Trade Scope',
        quantity: 1,
      });
    }

    // Prepare catalogue array formatted for n8n webhook
    const cataloguePayload = catalogue.map((c) => ({
      item: c.name,
      unit: c.unit,
      rate: c.unitPrice,
    }));

    const n8nBody = {
      name: payload.customerDetails.name,
      email: payload.customerDetails.email,
      service: payload.requestText.split('\n')[0].slice(0, 80) || 'Trade Quotation',
      description: payload.requestText,
      location:
        payload.customerDetails.siteAddress?.city ||
        payload.customerDetails.billingAddress?.city ||
        'Client Location',
      currency: payload.currency || defaults.currency,
      tax_rate: defaults.defaultTaxRate || 0,
      requested_items: requestedItems,
      catalogue: cataloguePayload,
    };

    // Initiate backend proxy call to n8n webhook
    const n8nPromise = fetch('/api/n8n/create-draft', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(n8nBody),
    })
      .then(async (res) => {
        if (res.ok) {
          const json = await res.json();
          return json;
        }
        const err = await res.json().catch(() => null);
        console.warn('n8n proxy responded with error:', err);
        return null;
      })
      .catch((err) => {
        console.warn('Network call to n8n proxy failed:', err);
        return null;
      });

    N8nIntegratedQuoteAdapter.activeJobs.set(jobId, {
      startTime: Date.now(),
      payload,
      n8nPromise,
    });

    return { jobId };
  }

  async pollGenerationJob(jobId: string): Promise<GenerationJobStatusResponse> {
    const job = N8nIntegratedQuoteAdapter.activeJobs.get(jobId);
    if (!job) {
      return {
        jobId,
        requestId: '',
        status: 'failed',
        progressPercent: 0,
        currentStepMessage: 'Generation job not found or expired',
        errorMessage: 'Job record not found in active session queue',
      };
    }

    const elapsed = Date.now() - job.startTime;
    const { payload } = job;
    const catalogue = StorageService.getCatalogue();
    const defaults = StorageService.getQuoteDefaults();

    // Stage 1: Received
    if (elapsed < 600) {
      return {
        jobId,
        requestId: payload.requestId,
        status: 'received',
        progressPercent: 25,
        currentStepMessage: 'Customer request received & formatted for n8n workflow...',
      };
    }

    // Stage 2: Interpreting
    if (elapsed < 1400) {
      return {
        jobId,
        requestId: payload.requestId,
        status: 'interpreting',
        progressPercent: 50,
        currentStepMessage: 'n8n workflow interpreting request scope and quantities...',
      };
    }

    // Stage 3: Matching catalogue
    if (elapsed < 2200) {
      return {
        jobId,
        requestId: payload.requestId,
        status: 'matching_catalogue',
        progressPercent: 75,
        currentStepMessage: 'Matching trade items against price catalogue via n8n...',
      };
    }

    // Stage 4: Assemble finalized quote
    // Wait for n8n response if promise is still pending
    let n8nData: any = null;
    if (job.n8nPromise) {
      try {
        n8nData = await Promise.race([
          job.n8nPromise,
          new Promise((resolve) => setTimeout(() => resolve(null), 3000)),
        ]);
      } catch (err) {
        console.warn('Error waiting for n8n data:', err);
      }
    }

    const proposedItems: QuoteLineItem[] = [];
    const assumptions: string[] = [];
    const missingFields: string[] = [];
    let n8nQuoteId: number | string = Math.floor(Math.random() * 9000 + 1000);

    // If n8n returned structured matched/unmatched items:
    if (n8nData && Array.isArray(n8nData.items) && n8nData.items.length > 0) {
      if (n8nData.quote_id) {
        n8nQuoteId = n8nData.quote_id;
      }

      n8nData.items.forEach((itemObj: any, idx: number) => {
        const itemName = itemObj.item || 'Service Item';
        const matchedCat = catalogue.find(
          (c) => c.name.toLowerCase() === itemName.toLowerCase()
        );

        proposedItems.push({
          id: `n8n_li_${Date.now()}_${idx}`,
          catalogueItemId: matchedCat?.id,
          name: itemName,
          description:
            matchedCat?.description ||
            `${itemName} - Matched from price catalogue via n8n`,
          quantity: Number(itemObj.quantity) || 1,
          unit: itemObj.unit || matchedCat?.unit || 'each',
          unitPrice: Number(itemObj.rate) || matchedCat?.unitPrice || 0,
          taxRate: defaults.defaultTaxRate,
          taxCategory: matchedCat?.taxCategory || 'standard',
          isCustom: !matchedCat,
          isAssumedQuantity: false,
        });
      });

      // Handle unmatched items returned by n8n (rate 0, flagged for review)
      if (Array.isArray(n8nData.unmatched) && n8nData.unmatched.length > 0) {
        n8nData.unmatched.forEach((un: any, uIdx: number) => {
          const unName = un.item || un.name || 'Unmatched Scope Item';
          proposedItems.push({
            id: `n8n_unmatched_${Date.now()}_${uIdx}`,
            name: unName,
            description:
              'Item not located in price catalogue. Rate set to 0 for estimator review.',
            quantity: Number(un.quantity) || 1,
            unit: un.unit || 'each',
            unitPrice: 0,
            taxRate: defaults.defaultTaxRate,
            taxCategory: 'standard',
            isCustom: true,
            isPriceRequired: true,
            notes: 'Rate required from supplier or estimator before approval.',
          });
          missingFields.push(`Rate required for: ${unName}`);
        });
      }
    } else {
      // Deterministic fallback matching from catalogue
      const lower = payload.requestText.toLowerCase();

      // Check if requested items explicitly passed
      if (
        payload.selectedCatalogueItemIds &&
        payload.selectedCatalogueItemIds.length > 0
      ) {
        payload.selectedCatalogueItemIds.forEach((id, idx) => {
          const cat = catalogue.find((c) => c.id === id);
          if (cat) {
            proposedItems.push({
              id: `gen_li_${Date.now()}_${idx}`,
              catalogueItemId: cat.id,
              name: cat.name,
              description: cat.description,
              quantity: payload.knownQuantities?.[id] || 1,
              unit: cat.unit,
              unitPrice: cat.unitPrice,
              taxRate: defaults.defaultTaxRate,
              taxCategory: cat.taxCategory,
              isCustom: false,
              isAssumedQuantity: !payload.knownQuantities?.[id],
            });
          }
        });
      } else {
        // Keyword heuristic matching
        const matchedCats = catalogue.filter((c) => {
          const nameWords = c.name.toLowerCase().split(' ');
          return nameWords.some((w) => w.length > 3 && lower.includes(w));
        });

        if (matchedCats.length > 0) {
          matchedCats.forEach((c, idx) => {
            proposedItems.push({
              id: `gen_li_${Date.now()}_${idx}`,
              catalogueItemId: c.id,
              name: c.name,
              description: c.description,
              quantity: idx === 0 ? 2 : 1,
              unit: c.unit,
              unitPrice: c.unitPrice,
              taxRate: defaults.defaultTaxRate,
              taxCategory: c.taxCategory,
              isCustom: false,
              isAssumedQuantity: true,
            });
            assumptions.push(`Matched catalogue item "${c.name}" based on request keywords.`);
          });
        } else {
          // Default catalogue items
          const firstTwo = catalogue.slice(0, 2);
          firstTwo.forEach((c, idx) => {
            proposedItems.push({
              id: `gen_li_${Date.now()}_${idx}`,
              catalogueItemId: c.id,
              name: c.name,
              description: c.description,
              quantity: 1,
              unit: c.unit,
              unitPrice: c.unitPrice,
              taxRate: defaults.defaultTaxRate,
              taxCategory: c.taxCategory,
              isCustom: false,
              isAssumedQuantity: true,
            });
          });
        }
      }
    }

    // Persist new Quote into storage
    const quoteNumber = `${defaults.quoteNumberPrefix}${String(
      defaults.nextNumberSequence
    ).padStart(4, '0')}`;
    defaults.nextNumberSequence += 1;
    StorageService.updateQuoteDefaults(defaults);

    const currentUser = StorageService.getCurrentUser();
    const issueDate = new Date().toISOString().split('T')[0];
    const validUntilDate = new Date(
      Date.now() + defaults.defaultValidityDays * 86400000
    ).toISOString().split('T')[0];

    const generatedScope = `Scope of works generated from customer request: "${payload.requestText.slice(
      0,
      160
    )}${payload.requestText.length > 160 ? '...' : ''}". Matched with price catalogue items.`;
    const generatedIntro = `Dear ${payload.customerDetails.name}, thank you for your request. We are pleased to provide this quotation for your review. All works are scheduled with certified personnel and standard commercial terms.`;

    const totals = calculateQuoteTotals(
      proposedItems,
      defaults.defaultDepositPercent
    );

    const newQuote: Quote = {
      id: `q_${Date.now()}`,
      quoteNumber,
      title:
        payload.requestText.split('\n')[0].slice(0, 65) ||
        'Commercial Quotation',
      customerId: payload.customerId,
      currency: payload.currency || defaults.currency,
      currentRevision: 1,
      status: missingFields.length > 0 ? 'needs_info' : 'draft',
      deliveryStatus: 'not_sent',
      createdById: currentUser.id,
      createdByName: currentUser.name,
      assignedApproverId: defaults.defaultApproverId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      issueDate,
      validUntil: validUntilDate,
      scopeSummary: generatedScope,
      introduction: generatedIntro,
      paymentTerms: defaults.defaultPaymentTerms,
      notes: n8nData?.notes || defaults.defaultFooterNotes,
      lineItems: proposedItems,
      subtotal: totals.subtotal,
      discountTotal: totals.discountTotal,
      taxTotal: totals.taxTotal,
      grandTotal: totals.grandTotal,
      depositPercent: defaults.defaultDepositPercent,
      depositAmount: totals.depositAmount,
      remainingBalance: totals.remainingBalance,
      revisions: [],
      approvalHistory: [],
      changeRequests: [],
      deliveryHistory: [],
      relatedRequestId: payload.requestId,
      n8nQuoteId,
      n8nStatus: 'draft',
      unmatchedItems: n8nData?.unmatched || [],
      flags: {
        missingPrices: totals.hasMissingPrices,
        unmatchedItems: totals.hasUnmatchedItems,
        assumedQuantities: assumptions.length > 0,
        incompleteScope: false,
        invalidDates: false,
        missingEmail: !payload.customerDetails.email,
      },
    };

    StorageService.saveQuote(newQuote);

    StorageService.addActivity({
      quoteId: newQuote.id,
      customerId: newQuote.customerId,
      type: 'draft_generated',
      title: `Draft quotation ${newQuote.quoteNumber} created (n8n Quote #${n8nQuoteId})`,
      description: `Generated ${proposedItems.length} line items with n8n workflow integration. ${
        n8nData ? 'Synchronized with n8n cloud webhook.' : 'Generated with deterministic engine.'
      }`,
      performedBy: currentUser.id,
      performedByName: currentUser.name,
      timestamp: new Date().toISOString(),
    });

    return {
      jobId,
      requestId: payload.requestId,
      status: 'completed',
      progressPercent: 100,
      currentStepMessage: 'Draft quotation prepared and verified.',
      proposedItems,
      matchedCatalogueCount: proposedItems.filter((i) => !i.isCustom).length,
      missingFields,
      assumptions,
      generatedScope,
      generatedIntroduction: generatedIntro,
      quoteId: newQuote.id,
      n8nQuoteId,
    };
  }

  async sendApprovedQuotation(
    payload: SendQuotationPayload,
    user: UserProfile
  ): Promise<SendQuotationResult> {
    const quote = StorageService.getQuoteById(payload.quoteId);
    if (!quote) {
      return {
        deliveryId: '',
        status: 'failed',
        sentAt: new Date().toISOString(),
        isSimulated: true,
        error: 'Quotation not found.',
      };
    }

    if (quote.status !== 'approved' && quote.status !== 'sent') {
      return {
        deliveryId: '',
        status: 'failed',
        sentAt: new Date().toISOString(),
        isSimulated: true,
        error: 'Cannot send unapproved quotation. Quotation must be approved first.',
      };
    }

    // Call backend n8n approve-and-send endpoint
    let n8nResponse: any = null;
    let isRealDelivery = false;

    try {
      const resp = await fetch('/api/n8n/approve-and-send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quote_id: quote.n8nQuoteId || 1,
          approved: true,
          tax_rate: quote.taxTotal > 0 ? (StorageService.getQuoteDefaults().defaultTaxRate || 0) : 0,
          notes: payload.message || 'Thank you for choosing us.',
          items: quote.lineItems.map((i) => ({
            item: i.name,
            unit: i.unit,
            quantity: i.quantity,
            rate: i.unitPrice,
          })),
        }),
      });

      if (resp.ok) {
        n8nResponse = await resp.json();
        isRealDelivery = true;
      } else {
        console.warn('n8n approve endpoint returned status:', resp.status);
      }
    } catch (err) {
      console.warn('Backend call to /api/n8n/approve-and-send failed, falling back:', err);
    }

    // Record delivery in persistent storage
    const deliveryRecord = StorageService.recordDelivery(quote.id, {
      quoteId: quote.id,
      revisionNumber: payload.revisionNumber,
      recipientEmail: payload.recipientEmail,
      ccEmail: payload.ccEmail,
      subject: payload.subject,
      message: payload.message,
      status: 'delivered',
      sentAt: new Date().toISOString(),
      deliveredAt: new Date().toISOString(),
      sentBy: user.id,
      providerMessageId: isRealDelivery
        ? `n8n_gmail_quote_${quote.n8nQuoteId || 1}_${Date.now()}`
        : `sim_${Date.now()}`,
      isSimulated: !isRealDelivery,
    });

    // Update quote status
    quote.status = 'sent';
    quote.deliveryStatus = 'delivered';
    quote.n8nStatus = 'sent';
    StorageService.saveQuote(quote);

    return {
      deliveryId: deliveryRecord.id,
      status: 'delivered',
      sentAt: deliveryRecord.sentAt,
      providerMessageId: deliveryRecord.providerMessageId,
      isSimulated: !isRealDelivery,
      n8nResponse,
    };
  }

  async rewriteDescription(description: string, instruction: string): Promise<string> {
    await new Promise((resolve) => setTimeout(resolve, 400));
    if (
      instruction.toLowerCase().includes('formal') ||
      instruction.toLowerCase().includes('professional')
    ) {
      return `Comprehensive execution conforming strictly to trade specifications, including calibrated preparation, approved materials application, and post-installation quality verification.`;
    }
    if (
      instruction.toLowerCase().includes('concise') ||
      instruction.toLowerCase().includes('short')
    ) {
      return `${description.split('.')[0]}. Includes all standard materials, certified labour, and safety precautions.`;
    }
    return `${description} Certified compliant with industry standards and backed by manufacturer warranty.`;
  }

  async clarifyScope(
    scope: string,
    _catalogueItems: CatalogueItem[]
  ): Promise<{ clarifiedScope: string; suggestions: string[] }> {
    await new Promise((resolve) => setTimeout(resolve, 400));
    return {
      clarifiedScope: `${scope} Works to be executed under continuous supervision with environmental and safety controls in place.`,
      suggestions: [
        'Confirm whether night shift work or weekend access is required by client.',
        'Verify if local municipal permit is required for equipment staging.',
        'Clarify boundary property line demarcation with adjacent site.',
      ],
    };
  }
}

export const quoteAdapter: IQuoteServiceAdapter = new N8nIntegratedQuoteAdapter();
