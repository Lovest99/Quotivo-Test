/**
 * Core Domain Types for AI Quote Generator SaaS
 */

export type UserRole = 'owner' | 'staff' | 'approver';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  businessId: string;
}

export type QuoteStatus =
  | 'draft'
  | 'needs_info'
  | 'awaiting_approval'
  | 'changes_requested'
  | 'approved'
  | 'sent'
  | 'accepted'
  | 'declined'
  | 'expired'
  | 'archived';

export type DeliveryStatus =
  | 'not_sent'
  | 'queued'
  | 'sending'
  | 'provider_accepted'
  | 'delivered'
  | 'failed'
  | 'unknown';

export interface Address {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface Customer {
  id: string;
  type: 'business' | 'individual';
  name: string;
  companyName?: string;
  email: string;
  phone: string;
  billingAddress: Address;
  siteAddress?: Address;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type TaxCategory = 'standard' | 'reduced' | 'zero' | 'exempt';

export interface CatalogueItem {
  id: string;
  code: string;
  name: string;
  description: string;
  category: string;
  unit: string; // e.g. "sq m", "linear m", "hour", "day", "unit", "item", "kg"
  unitPrice: number;
  currency: string;
  taxCategory: TaxCategory;
  isActive: boolean;
  createdAt: string;
}

export interface QuoteLineItem {
  id: string;
  catalogueItemId?: string;
  name: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  discountPercent?: number;
  taxRate: number; // e.g., 20 for 20%
  taxCategory: TaxCategory;
  isCustom: boolean;
  isAssumedQuantity?: boolean;
  isPriceRequired?: boolean;
  notes?: string;
  category?: string;
}

export interface QuoteRevision {
  revisionNumber: number;
  createdAt: string;
  createdBy: string;
  createdByName: string;
  changeSummary: string;
  lineItems: QuoteLineItem[];
  subtotal: number;
  discountTotal: number;
  taxTotal: number;
  grandTotal: number;
  depositPercent?: number;
  depositAmount?: number;
  remainingBalance?: number;
  notes?: string;
  scopeSummary: string;
  exclusions?: string;
  paymentTerms: string;
  validUntil: string;
  issueDate: string;
  statusAtRevision: QuoteStatus;
}

export interface ApprovalRecord {
  revisionApproved: number;
  approvedBy: string;
  approvedByName: string;
  approvedAt: string;
  comments?: string;
}

export interface ChangeRequestRecord {
  revisionRequestedOn: number;
  requestedBy: string;
  requestedByName: string;
  requestedAt: string;
  feedback: string;
}

export interface DeliveryRecord {
  id: string;
  quoteId: string;
  revisionNumber: number;
  recipientEmail: string;
  ccEmail?: string;
  subject: string;
  message: string;
  status: DeliveryStatus;
  sentAt: string;
  sentBy: string;
  providerMessageId?: string;
  deliveredAt?: string;
  failureReason?: string;
  isSimulated: boolean;
}

export interface ActivityEvent {
  id: string;
  quoteId?: string;
  customerId?: string;
  type:
    | 'request_created'
    | 'draft_generated'
    | 'quote_edited'
    | 'submitted_for_approval'
    | 'changes_requested'
    | 'approved'
    | 'send_attempted'
    | 'delivered'
    | 'delivery_failed'
    | 'customer_accepted'
    | 'customer_declined'
    | 'new_revision_created'
    | 'quote_exported'
    | 'quote_archived';
  title: string;
  description: string;
  performedBy: string;
  performedByName: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'approval_requested' | 'changes_requested' | 'quote_approved' | 'delivery_failed' | 'draft_ready';
  targetUrl: string;
  read: boolean;
  createdAt: string;
  quoteId?: string;
}

export interface CustomerRequestDraft {
  id: string;
  customerId: string;
  title: string;
  category: string;
  description: string;
  rawPastedMessage?: string;
  requestedDate?: string;
  budgetRange?: string;
  currency: string;
  selectedCatalogueIds: string[];
  additionalInstructions?: string;
  attachments: {
    id: string;
    name: string;
    size: string;
    type: string;
  }[];
  createdAt: string;
}

export interface Quote {
  id: string;
  quoteNumber: string; // e.g. "Q-2027-0104"
  title: string;
  customerId: string;
  currency: string;
  currentRevision: number;
  status: QuoteStatus;
  deliveryStatus: DeliveryStatus;
  createdById: string;
  createdByName: string;
  assignedApproverId?: string;
  createdAt: string;
  updatedAt: string;
  issueDate: string;
  validUntil: string;
  scopeSummary: string;
  introduction?: string;
  exclusions?: string;
  paymentTerms: string;
  notes?: string;
  lineItems: QuoteLineItem[];
  subtotal: number;
  discountTotal: number;
  taxTotal: number;
  grandTotal: number;
  depositPercent?: number;
  depositAmount?: number;
  remainingBalance?: number;
  revisions: QuoteRevision[];
  approvalHistory: ApprovalRecord[];
  changeRequests: ChangeRequestRecord[];
  deliveryHistory: DeliveryRecord[];
  relatedRequestId?: string;
  customerResponse?: {
    status: 'accepted' | 'declined';
    recordedAt: string;
    recordedBy: string;
    note?: string;
  };
  n8nQuoteId?: number | string;
  n8nStatus?: 'draft' | 'sent' | 'not_approved';
  unmatchedItems?: Array<{
    item: string;
    unit?: string;
    quantity?: number;
    rate?: number;
    amount?: number;
    notes?: string;
  }>;
  flags: {
    missingPrices: boolean;
    unmatchedItems: boolean;
    assumedQuantities: boolean;
    incompleteScope: boolean;
    invalidDates: boolean;
    missingEmail: boolean;
  };
}

export interface BusinessSettings {
  name: string;
  legalName?: string;
  logoUrl?: string;
  industry: string;
  email: string;
  phone: string;
  website?: string;
  address: Address;
  taxRegistrationNumber?: string;
  companyNumber?: string;
}

export interface QuoteDefaults {
  currency: string;
  quoteNumberPrefix: string;
  nextNumberSequence: number;
  defaultValidityDays: number;
  defaultTaxRate: number;
  defaultTaxCategory: TaxCategory;
  defaultPaymentTerms: string;
  defaultFooterNotes: string;
  requireApprovalBeforeSending: boolean;
  defaultApproverId?: string;
  defaultDepositPercent: number;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  isActive: boolean;
  joinedAt: string;
}

export interface TemplateConfig {
  id: string;
  name: string;
  description: string;
  layout: 'standard' | 'service_proposal' | 'construction_estimate';
  accentColor: string;
  logoPlacement: 'left' | 'right' | 'center';
  showCompanyNumber: boolean;
  showTaxNumber: boolean;
  scopeHeading: string;
  preparedByHeading: string;
  defaultTerms: string;
  footerMessage: string;
  isDefault: boolean;
}

export interface IntegrationStatus {
  n8nWebhookUrl: string;
  n8nWorkflowStatus: 'connected' | 'degraded' | 'disconnected';
  generationServiceStatus: 'active' | 'demo_mode';
  emailServiceStatus: 'simulated' | 'provider_connected';
  lastSuccessfulEvent?: string;
  recentFailuresCount: number;
}
