import { pgTable, text, serial, integer, doublePrecision, boolean, timestamp, jsonb } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Users table (anchored by Firebase Auth UID)
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID
  email: text('email').notNull(),
  name: text('name').notNull().default(''),
  role: text('role').notNull().default('owner'), // 'owner' | 'staff' | 'approver'
  avatarUrl: text('avatar_url').default(''),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Business Profile & Quoting Defaults table
export const businesses = pgTable('businesses', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull(), // Links to users.uid
  name: text('name').notNull().default('Apex Civil & Building Services'),
  legalName: text('legal_name').default(''),
  industry: text('industry').default('Civil Engineering & Construction'),
  logoUrl: text('logo_url').default(''),
  email: text('email').default(''),
  phone: text('phone').default(''),
  street: text('street').default(''),
  city: text('city').default(''),
  state: text('state').default(''),
  postalCode: text('postal_code').default(''),
  taxRegistrationNumber: text('tax_registration_number').default(''),
  currency: text('currency').default('USD'),
  quoteNumberPrefix: text('quote_number_prefix').default('Q-2027-'),
  defaultValidityDays: integer('default_validity_days').default(30),
  defaultTaxRate: doublePrecision('default_tax_rate').default(10),
  defaultPaymentTerms: text('default_payment_terms').default('30% deposit upon award; balance net 14 days post-completion.'),
  defaultFooterNotes: text('default_footer_notes').default('All works guaranteed under trade compliance standards. Valid for specified duration.'),
  defaultDepositPercent: doublePrecision('default_deposit_percent').default(30),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Customers table
export const customers = pgTable('customers', {
  id: text('id').primaryKey(), // e.g. 'cust_1' or UUID
  userId: text('user_id').notNull(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  phone: text('phone').default(''),
  companyName: text('company_name').default(''),
  billingStreet: text('billing_street').default(''),
  billingCity: text('billing_city').default(''),
  billingState: text('billing_state').default(''),
  billingPostal: text('billing_postal').default(''),
  siteAddress: text('site_address').default(''),
  notes: text('notes').default(''),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Price Book Catalogue Items table
export const catalogueItems = pgTable('catalogue_items', {
  id: text('id').primaryKey(), // e.g. 'cat_1'
  userId: text('user_id').notNull(),
  code: text('code').notNull(),
  name: text('name').notNull(),
  description: text('description').notNull().default(''),
  category: text('category').notNull().default('General Works'),
  unit: text('unit').notNull().default('item'),
  unitPrice: doublePrecision('unit_price').notNull().default(0),
  currency: text('currency').notNull().default('USD'),
  isCustom: boolean('is_custom').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Commercial Quotations table
export const quotes = pgTable('quotes', {
  id: text('id').primaryKey(), // e.g. 'q_1700000000'
  userId: text('user_id').notNull(),
  customerId: text('customer_id').notNull(),
  quoteNumber: text('quote_number').notNull(),
  title: text('title').notNull(),
  scopeSummary: text('scope_summary').notNull().default(''),
  currency: text('currency').notNull().default('USD'),
  subtotal: doublePrecision('subtotal').notNull().default(0),
  taxRate: doublePrecision('tax_rate').notNull().default(0),
  taxAmount: doublePrecision('tax_amount').notNull().default(0),
  grandTotal: doublePrecision('grand_total').notNull().default(0),
  depositPercent: doublePrecision('deposit_percent').default(0),
  depositAmount: doublePrecision('deposit_amount').default(0),
  paymentTerms: text('payment_terms').default(''),
  validityDays: integer('validity_days').default(30),
  issueDate: text('issue_date').notNull(),
  validUntil: text('valid_until').notNull(),
  exclusions: text('exclusions').default(''),
  footerNotes: text('footer_notes').default(''),
  status: text('status').notNull().default('draft'), // 'draft' | 'needs_info' | 'awaiting_approval' | 'changes_requested' | 'approved' | 'sent' | 'accepted' | 'declined' | 'archived'
  currentRevision: integer('current_revision').notNull().default(1),
  deliveryStatus: text('delivery_status').notNull().default('not_sent'), // 'not_sent' | 'sent' | 'delivered' | 'failed'
  n8nQuoteId: text('n8n_quote_id').default(''),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Quote Line Items table
export const quoteLineItems = pgTable('quote_line_items', {
  id: text('id').primaryKey(),
  quoteId: text('quote_id').notNull().references(() => quotes.id, { onDelete: 'cascade' }),
  catalogueItemId: text('catalogue_item_id').default(''),
  code: text('code').notNull().default(''),
  name: text('name').notNull(),
  description: text('description').notNull().default(''),
  quantity: doublePrecision('quantity').notNull().default(1),
  unit: text('unit').notNull().default('item'),
  unitPrice: doublePrecision('unit_price').notNull().default(0),
  subtotal: doublePrecision('subtotal').notNull().default(0),
  isCustom: boolean('is_custom').default(false),
  isPriceRequired: boolean('is_price_required').default(false),
  orderIndex: integer('order_index').default(0),
});

// Quote Revision History snapshots (Immutable audit trail)
export const quoteRevisions = pgTable('quote_revisions', {
  id: serial('id').primaryKey(),
  quoteId: text('quote_id').notNull().references(() => quotes.id, { onDelete: 'cascade' }),
  revisionNumber: integer('revision_number').notNull(),
  snapshotData: jsonb('snapshot_data').notNull(), // Full JSON snapshot of the quote at this revision
  changeSummary: text('change_summary').default(''),
  createdBy: text('created_by').default(''),
  createdByName: text('created_by_name').default(''),
  createdAt: timestamp('created_at').defaultNow(),
});

// Activity / Audit Logs
export const activityLogs = pgTable('activity_logs', {
  id: text('id').primaryKey(),
  quoteId: text('quote_id').default(''),
  customerId: text('customer_id').default(''),
  type: text('type').notNull(), // 'quote_created' | 'quote_updated' | 'revision_created' | 'approval_requested' | 'quote_approved' | 'quote_sent' | 'quote_accepted' | 'quote_exported'
  title: text('title').notNull(),
  description: text('description').notNull().default(''),
  performedBy: text('performed_by').default(''),
  performedByName: text('performed_by_name').default(''),
  metadata: jsonb('metadata'),
  timestamp: timestamp('timestamp').defaultNow(),
});

// N8N Inbox & Webhook Events table (Tracks all incoming and outgoing n8n automation requests)
export const n8nWebhookEvents = pgTable('n8n_webhook_events', {
  id: serial('id').primaryKey(),
  quoteId: text('quote_id').default(''),
  direction: text('direction').notNull().default('inbound'), // 'inbound' | 'outbound'
  eventType: text('event_type').notNull(), // 'quote_request' | 'quote_approval' | 'client_response' | 'status_sync'
  payload: jsonb('payload').notNull(),
  status: text('status').notNull().default('processed'), // 'pending' | 'processed' | 'failed'
  errorMessage: text('error_message').default(''),
  createdAt: timestamp('created_at').defaultNow(),
});

// Drizzle Relations
export const quotesRelations = relations(quotes, ({ many }) => ({
  lineItems: many(quoteLineItems),
  revisions: many(quoteRevisions),
}));

export const quoteLineItemsRelations = relations(quoteLineItems, ({ one }) => ({
  quote: one(quotes, {
    fields: [quoteLineItems.quoteId],
    references: [quotes.id],
  }),
}));

export const quoteRevisionsRelations = relations(quoteRevisions, ({ one }) => ({
  quote: one(quotes, {
    fields: [quoteRevisions.quoteId],
    references: [quotes.id],
  }),
}));
