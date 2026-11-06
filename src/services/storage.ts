/**
 * LocalStorage Persistence & Data Access Layer
 * Provides deterministic state persistence, revision management, and demo reset.
 */

import {
  Customer,
  CatalogueItem,
  Quote,
  QuoteRevision,
  BusinessSettings,
  QuoteDefaults,
  TeamMember,
  TemplateConfig,
  AppNotification,
  ActivityEvent,
  UserProfile,
  CustomerRequestDraft,
  DeliveryRecord,
  ApprovalRecord,
  ChangeRequestRecord,
} from '../types';

import {
  SEED_CURRENT_USER,
  SEED_USERS,
  SEED_BUSINESS,
  SEED_QUOTE_DEFAULTS,
  SEED_TEAM,
  SEED_CUSTOMERS,
  SEED_CATALOGUE,
  SEED_TEMPLATES,
  SEED_QUOTES,
  SEED_NOTIFICATIONS,
  SEED_ACTIVITIES,
} from './seedData';

import { calculateQuoteTotals } from '../utils/calculations';

const STORAGE_KEYS = {
  CURRENT_USER: 'aqg_current_user_v1',
  BUSINESS: 'aqg_business_v1',
  QUOTE_DEFAULTS: 'aqg_quote_defaults_v1',
  TEAM: 'aqg_team_v1',
  CUSTOMERS: 'aqg_customers_v1',
  CATALOGUE: 'aqg_catalogue_v1',
  TEMPLATES: 'aqg_templates_v1',
  QUOTES: 'aqg_quotes_v1',
  NOTIFICATIONS: 'aqg_notifications_v1',
  ACTIVITIES: 'aqg_activities_v1',
  REQUEST_DRAFT: 'aqg_request_draft_v1',
  ONBOARDING_DONE: 'aqg_onboarding_done_v1',
  THEME: 'aqg_theme_v1',
};

function safeGet<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    if (!item) return fallback;
    return JSON.parse(item) as T;
  } catch (err) {
    console.warn(`Error loading ${key} from storage:`, err);
    return fallback;
  }
}

function safeSet<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.warn(`Error writing ${key} to storage:`, err);
  }
}

export const StorageService = {
  // Reset all data to pristine initial seed state
  resetAllDemoData(): void {
    safeSet(STORAGE_KEYS.CURRENT_USER, SEED_CURRENT_USER);
    safeSet(STORAGE_KEYS.BUSINESS, SEED_BUSINESS);
    safeSet(STORAGE_KEYS.QUOTE_DEFAULTS, SEED_QUOTE_DEFAULTS);
    safeSet(STORAGE_KEYS.TEAM, SEED_TEAM);
    safeSet(STORAGE_KEYS.CUSTOMERS, SEED_CUSTOMERS);
    safeSet(STORAGE_KEYS.CATALOGUE, SEED_CATALOGUE);
    safeSet(STORAGE_KEYS.TEMPLATES, SEED_TEMPLATES);
    safeSet(STORAGE_KEYS.QUOTES, SEED_QUOTES);
    safeSet(STORAGE_KEYS.NOTIFICATIONS, SEED_NOTIFICATIONS);
    safeSet(STORAGE_KEYS.ACTIVITIES, SEED_ACTIVITIES);
    safeSet(STORAGE_KEYS.ONBOARDING_DONE, true);
    localStorage.removeItem(STORAGE_KEYS.REQUEST_DRAFT);
  },

  // Initialize if empty
  initialize(): void {
    if (!localStorage.getItem(STORAGE_KEYS.QUOTES)) {
      this.resetAllDemoData();
    }
  },

  // Onboarding
  isOnboardingCompleted(): boolean {
    return safeGet<boolean>(STORAGE_KEYS.ONBOARDING_DONE, true);
  },

  setOnboardingCompleted(completed: boolean): void {
    safeSet(STORAGE_KEYS.ONBOARDING_DONE, completed);
  },

  // User & Role Switching
  getCurrentUser(): UserProfile {
    return safeGet<UserProfile>(STORAGE_KEYS.CURRENT_USER, SEED_CURRENT_USER);
  },

  setCurrentUser(user: UserProfile): void {
    safeSet(STORAGE_KEYS.CURRENT_USER, user);
  },

  getAvailableUsers(): UserProfile[] {
    return SEED_USERS;
  },

  // Business & Settings
  getBusiness(): BusinessSettings {
    return safeGet<BusinessSettings>(STORAGE_KEYS.BUSINESS, SEED_BUSINESS);
  },

  updateBusiness(settings: Partial<BusinessSettings>): BusinessSettings {
    const current = this.getBusiness();
    const updated = { ...current, ...settings };
    safeSet(STORAGE_KEYS.BUSINESS, updated);
    return updated;
  },

  getQuoteDefaults(): QuoteDefaults {
    return safeGet<QuoteDefaults>(STORAGE_KEYS.QUOTE_DEFAULTS, SEED_QUOTE_DEFAULTS);
  },

  updateQuoteDefaults(defaults: Partial<QuoteDefaults>): QuoteDefaults {
    const current = this.getQuoteDefaults();
    const updated = { ...current, ...defaults };
    safeSet(STORAGE_KEYS.QUOTE_DEFAULTS, updated);
    return updated;
  },

  // Team
  getTeam(): TeamMember[] {
    return safeGet<TeamMember[]>(STORAGE_KEYS.TEAM, SEED_TEAM);
  },

  saveTeam(team: TeamMember[]): void {
    safeSet(STORAGE_KEYS.TEAM, team);
  },

  addTeamMember(member: Omit<TeamMember, 'id' | 'joinedAt'>): TeamMember {
    const team = this.getTeam();
    const newMember: TeamMember = {
      ...member,
      id: `usr_${Date.now()}`,
      joinedAt: new Date().toISOString(),
    };
    team.push(newMember);
    this.saveTeam(team);
    return newMember;
  },

  // Customers
  getCustomers(): Customer[] {
    return safeGet<Customer[]>(STORAGE_KEYS.CUSTOMERS, SEED_CUSTOMERS);
  },

  getCustomerById(id: string): Customer | undefined {
    return this.getCustomers().find((c) => c.id === id);
  },

  saveCustomer(customer: Partial<Customer> & { name: string; email: string }): Customer {
    const customers = this.getCustomers();
    const now = new Date().toISOString();

    if (customer.id) {
      const idx = customers.findIndex((c) => c.id === customer.id);
      if (idx !== -1) {
        customers[idx] = { ...customers[idx], ...customer, updatedAt: now } as Customer;
        safeSet(STORAGE_KEYS.CUSTOMERS, customers);
        return customers[idx];
      }
    }

    const newCustomer: Customer = {
      id: `cust_${Date.now()}`,
      type: customer.type || 'business',
      name: customer.name,
      companyName: customer.companyName,
      email: customer.email,
      phone: customer.phone || '',
      billingAddress: customer.billingAddress || {
        street: '',
        city: '',
        state: '',
        postalCode: '',
        country: 'United States',
      },
      siteAddress: customer.siteAddress,
      notes: customer.notes,
      createdAt: now,
      updatedAt: now,
    };
    customers.unshift(newCustomer);
    safeSet(STORAGE_KEYS.CUSTOMERS, customers);
    return newCustomer;
  },

  // Catalogue
  getCatalogue(): CatalogueItem[] {
    return safeGet<CatalogueItem[]>(STORAGE_KEYS.CATALOGUE, SEED_CATALOGUE);
  },

  saveCatalogue(items: CatalogueItem[]): void {
    safeSet(STORAGE_KEYS.CATALOGUE, items);
  },

  getCatalogueItemById(id: string): CatalogueItem | undefined {
    return this.getCatalogue().find((i) => i.id === id);
  },

  saveCatalogueItem(item: Partial<CatalogueItem> & { name: string; unitPrice: number }): CatalogueItem {
    const catalogue = this.getCatalogue();
    const now = new Date().toISOString();

    if (item.id) {
      const idx = catalogue.findIndex((i) => i.id === item.id);
      if (idx !== -1) {
        catalogue[idx] = { ...catalogue[idx], ...item } as CatalogueItem;
        safeSet(STORAGE_KEYS.CATALOGUE, catalogue);
        return catalogue[idx];
      }
    }

    const newItem: CatalogueItem = {
      id: `cat_${Date.now()}`,
      code: item.code || `ITM-${Date.now().toString().slice(-4)}`,
      name: item.name,
      description: item.description || '',
      category: item.category || 'General Services',
      unit: item.unit || 'unit',
      unitPrice: item.unitPrice,
      currency: item.currency || 'USD',
      taxCategory: item.taxCategory || 'standard',
      isActive: item.isActive !== undefined ? item.isActive : true,
      createdAt: now,
    };
    catalogue.unshift(newItem);
    safeSet(STORAGE_KEYS.CATALOGUE, catalogue);
    return newItem;
  },

  importCatalogueItems(items: Omit<CatalogueItem, 'id' | 'createdAt'>[]): number {
    const catalogue = this.getCatalogue();
    const now = new Date().toISOString();
    let count = 0;
    for (const it of items) {
      catalogue.push({
        ...it,
        id: `cat_imp_${Date.now()}_${count++}`,
        createdAt: now,
      });
    }
    safeSet(STORAGE_KEYS.CATALOGUE, catalogue);
    return count;
  },

  // Templates
  getTemplates(): TemplateConfig[] {
    return safeGet<TemplateConfig[]>(STORAGE_KEYS.TEMPLATES, SEED_TEMPLATES);
  },

  saveTemplate(template: TemplateConfig): void {
    const tpls = this.getTemplates();
    const idx = tpls.findIndex((t) => t.id === template.id);
    if (idx !== -1) {
      tpls[idx] = template;
    } else {
      tpls.push(template);
    }
    safeSet(STORAGE_KEYS.TEMPLATES, tpls);
  },

  // Quotes
  getQuotes(): Quote[] {
    return safeGet<Quote[]>(STORAGE_KEYS.QUOTES, SEED_QUOTES);
  },

  getQuoteById(id: string): Quote | undefined {
    return this.getQuotes().find((q) => q.id === id);
  },

  saveQuote(quote: Quote): Quote {
    const quotes = this.getQuotes();
    const idx = quotes.findIndex((q) => q.id === quote.id);
    const now = new Date().toISOString();

    quote.updatedAt = now;

    // Recalculate totals and flags
    const totals = calculateQuoteTotals(quote.lineItems, quote.depositPercent);
    quote.subtotal = totals.subtotal;
    quote.discountTotal = totals.discountTotal;
    quote.taxTotal = totals.taxTotal;
    quote.grandTotal = totals.grandTotal;
    quote.depositAmount = totals.depositAmount;
    quote.remainingBalance = totals.remainingBalance;

    const cust = this.getCustomerById(quote.customerId);

    quote.flags = {
      missingPrices: totals.hasMissingPrices,
      unmatchedItems: totals.hasUnmatchedItems,
      assumedQuantities: totals.hasAssumedQuantities,
      incompleteScope: !quote.scopeSummary || quote.scopeSummary.trim().length < 10,
      invalidDates: !quote.validUntil || new Date(quote.validUntil) < new Date(quote.issueDate),
      missingEmail: !cust || !cust.email || cust.email.trim().length === 0,
    };

    if (idx !== -1) {
      quotes[idx] = quote;
    } else {
      quotes.unshift(quote);
    }

    safeSet(STORAGE_KEYS.QUOTES, quotes);
    return quote;
  },

  /**
   * If a quote has been approved or sent, editing it MUST create a new draft revision.
   * This preserves the approved/sent revision snapshot and resets approval status.
   */
  startNewRevisionIfProtected(quote: Quote, user: UserProfile, changeSummary: string): Quote {
    const isProtected = ['approved', 'sent', 'accepted', 'declined'].includes(quote.status);

    if (isProtected) {
      // Create snapshot of current revision
      const snapshot: QuoteRevision = {
        revisionNumber: quote.currentRevision,
        createdAt: quote.updatedAt || new Date().toISOString(),
        createdBy: quote.createdById,
        createdByName: quote.createdByName,
        changeSummary: `Revision ${quote.currentRevision} snapshot preserved before revision edit.`,
        lineItems: JSON.parse(JSON.stringify(quote.lineItems)),
        subtotal: quote.subtotal,
        discountTotal: quote.discountTotal,
        taxTotal: quote.taxTotal,
        grandTotal: quote.grandTotal,
        depositPercent: quote.depositPercent,
        depositAmount: quote.depositAmount,
        remainingBalance: quote.remainingBalance,
        notes: quote.notes,
        scopeSummary: quote.scopeSummary,
        exclusions: quote.exclusions,
        paymentTerms: quote.paymentTerms,
        validUntil: quote.validUntil,
        issueDate: quote.issueDate,
        statusAtRevision: quote.status,
      };

      const existingRevs = quote.revisions || [];
      const hasRevAlready = existingRevs.some((r) => r.revisionNumber === quote.currentRevision);
      if (!hasRevAlready) {
        existingRevs.push(snapshot);
      }

      quote.revisions = existingRevs;
      quote.currentRevision += 1;
      quote.status = 'draft';
      // Invalidate previous approval for this new draft
      quote.updatedAt = new Date().toISOString();

      this.addActivity({
        quoteId: quote.id,
        customerId: quote.customerId,
        type: 'new_revision_created',
        title: `Revision ${quote.currentRevision} created`,
        description: `Editing approved/sent quote created new draft Revision ${quote.currentRevision}: ${changeSummary}`,
        performedBy: user.id,
        performedByName: user.name,
        timestamp: new Date().toISOString(),
      });
    }

    return this.saveQuote(quote);
  },

  submitForApproval(quoteId: string, user: UserProfile, assignedApproverId?: string): { success: boolean; error?: string; quote?: Quote } {
    const quote = this.getQuoteById(quoteId);
    if (!quote) return { success: false, error: 'Quote not found' };

    // Check for blocking flags
    const totals = calculateQuoteTotals(quote.lineItems, quote.depositPercent);
    if (totals.hasMissingPrices) {
      return { success: false, error: 'Cannot submit for approval: one or more line items have missing prices.' };
    }

    quote.status = 'awaiting_approval';
    if (assignedApproverId) {
      quote.assignedApproverId = assignedApproverId;
    }

    this.saveQuote(quote);

    this.addActivity({
      quoteId: quote.id,
      customerId: quote.customerId,
      type: 'submitted_for_approval',
      title: `Submitted for approval (Rev ${quote.currentRevision})`,
      description: `${user.name} submitted quotation ${quote.quoteNumber} (Revision ${quote.currentRevision}) for approval.`,
      performedBy: user.id,
      performedByName: user.name,
      timestamp: new Date().toISOString(),
    });

    this.addNotification({
      title: 'Approval Requested',
      message: `${user.name} submitted ${quote.quoteNumber} for review.`,
      type: 'approval_requested',
      targetUrl: `/app/quotes/${quote.id}/edit`,
      read: false,
      quoteId: quote.id,
    });

    return { success: true, quote };
  },

  approveRevision(quoteId: string, revisionNumber: number, user: UserProfile, comments?: string): { success: boolean; error?: string; quote?: Quote } {
    const quote = this.getQuoteById(quoteId);
    if (!quote) return { success: false, error: 'Quote not found' };

    if (user.role === 'staff') {
      return { success: false, error: 'Access Denied: Staff members cannot approve quotations.' };
    }

    if (quote.currentRevision !== revisionNumber) {
      return {
        success: false,
        error: `Superseded Revision: This quote has been updated to Revision ${quote.currentRevision}. You cannot approve superseded Revision ${revisionNumber}.`,
      };
    }

    const totals = calculateQuoteTotals(quote.lineItems, quote.depositPercent);
    if (totals.hasMissingPrices) {
      return { success: false, error: 'Cannot approve quotation: line items require pricing.' };
    }

    quote.status = 'approved';

    const approvalRecord: ApprovalRecord = {
      revisionApproved: revisionNumber,
      approvedBy: user.id,
      approvedByName: user.name,
      approvedAt: new Date().toISOString(),
      comments: comments || 'Approved revision for client issuance.',
    };

    quote.approvalHistory = quote.approvalHistory || [];
    quote.approvalHistory.push(approvalRecord);

    this.saveQuote(quote);

    this.addActivity({
      quoteId: quote.id,
      customerId: quote.customerId,
      type: 'approved',
      title: `Revision ${revisionNumber} approved`,
      description: `${user.name} approved quotation ${quote.quoteNumber} (Revision ${revisionNumber}).`,
      performedBy: user.id,
      performedByName: user.name,
      timestamp: new Date().toISOString(),
    });

    this.addNotification({
      title: 'Quotation Approved',
      message: `${quote.quoteNumber} (Rev ${revisionNumber}) was approved by ${user.name} and is ready to send.`,
      type: 'quote_approved',
      targetUrl: `/app/quotes/${quote.id}`,
      read: false,
      quoteId: quote.id,
    });

    return { success: true, quote };
  },

  requestChanges(quoteId: string, revisionNumber: number, user: UserProfile, feedback: string): { success: boolean; error?: string; quote?: Quote } {
    const quote = this.getQuoteById(quoteId);
    if (!quote) return { success: false, error: 'Quote not found' };

    if (!feedback || feedback.trim().length < 5) {
      return { success: false, error: 'Feedback comments are required when requesting changes.' };
    }

    quote.status = 'changes_requested';

    const changeRecord: ChangeRequestRecord = {
      revisionRequestedOn: revisionNumber,
      requestedBy: user.id,
      requestedByName: user.name,
      requestedAt: new Date().toISOString(),
      feedback,
    };

    quote.changeRequests = quote.changeRequests || [];
    quote.changeRequests.push(changeRecord);

    this.saveQuote(quote);

    this.addActivity({
      quoteId: quote.id,
      customerId: quote.customerId,
      type: 'changes_requested',
      title: `Changes requested on Rev ${revisionNumber}`,
      description: `${user.name}: "${feedback}"`,
      performedBy: user.id,
      performedByName: user.name,
      timestamp: new Date().toISOString(),
    });

    this.addNotification({
      title: 'Changes Requested',
      message: `${user.name} requested changes on ${quote.quoteNumber}: "${feedback.slice(0, 80)}..."`,
      type: 'changes_requested',
      targetUrl: `/app/quotes/${quote.id}/edit`,
      read: false,
      quoteId: quote.id,
    });

    return { success: true, quote };
  },

  recordCustomerResponse(quoteId: string, status: 'accepted' | 'declined', note: string, user: UserProfile): Quote | undefined {
    const quote = this.getQuoteById(quoteId);
    if (!quote) return undefined;

    quote.status = status;
    quote.customerResponse = {
      status,
      recordedAt: new Date().toISOString(),
      recordedBy: user.name,
      note,
    };

    this.saveQuote(quote);

    this.addActivity({
      quoteId: quote.id,
      customerId: quote.customerId,
      type: status === 'accepted' ? 'customer_accepted' : 'customer_declined',
      title: `Customer marked ${status}`,
      description: `Manually recorded by ${user.name}: ${note || 'No additional note'}`,
      performedBy: user.id,
      performedByName: user.name,
      timestamp: new Date().toISOString(),
    });

    return quote;
  },

  recordDelivery(quoteId: string, delivery: Omit<DeliveryRecord, 'id'>): DeliveryRecord {
    const quotes = this.getQuotes();
    const quote = quotes.find((q) => q.id === quoteId);

    const record: DeliveryRecord = {
      ...delivery,
      id: `del_${Date.now()}`,
    };

    if (quote) {
      quote.deliveryHistory = quote.deliveryHistory || [];
      quote.deliveryHistory.push(record);
      quote.deliveryStatus = delivery.status;
      if (delivery.status === 'delivered' || delivery.status === 'provider_accepted') {
        quote.status = 'sent';
      }
      this.saveQuote(quote);

      this.addActivity({
        quoteId: quote.id,
        customerId: quote.customerId,
        type: delivery.status === 'failed' ? 'delivery_failed' : 'send_attempted',
        title: delivery.status === 'failed' ? 'Email delivery failed' : 'Quotation email sent',
        description: `Revision ${delivery.revisionNumber} sent to ${delivery.recipientEmail}. Status: ${delivery.status}. (Simulated in demo mode).`,
        performedBy: delivery.sentBy,
        performedByName: 'System / User',
        timestamp: new Date().toISOString(),
      });
    }

    return record;
  },

  // Customer Request in-progress Draft
  getCustomerRequestDraft(): CustomerRequestDraft | null {
    return safeGet<CustomerRequestDraft | null>(STORAGE_KEYS.REQUEST_DRAFT, null);
  },

  saveCustomerRequestDraft(draft: CustomerRequestDraft): void {
    safeSet(STORAGE_KEYS.REQUEST_DRAFT, draft);
  },

  clearCustomerRequestDraft(): void {
    localStorage.removeItem(STORAGE_KEYS.REQUEST_DRAFT);
  },

  // Activities
  getActivities(): ActivityEvent[] {
    return safeGet<ActivityEvent[]>(STORAGE_KEYS.ACTIVITIES, SEED_ACTIVITIES);
  },

  addActivity(event: Omit<ActivityEvent, 'id'>): ActivityEvent {
    const activities = this.getActivities();
    const newEvent: ActivityEvent = {
      ...event,
      id: `act_${Date.now()}`,
    };
    activities.unshift(newEvent);
    safeSet(STORAGE_KEYS.ACTIVITIES, activities);
    return newEvent;
  },

  // Notifications
  getNotifications(): AppNotification[] {
    return safeGet<AppNotification[]>(STORAGE_KEYS.NOTIFICATIONS, SEED_NOTIFICATIONS);
  },

  addNotification(notif: Omit<AppNotification, 'id' | 'createdAt'>): AppNotification {
    const notifs = this.getNotifications();
    const newNotif: AppNotification = {
      ...notif,
      id: `notif_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    notifs.unshift(newNotif);
    safeSet(STORAGE_KEYS.NOTIFICATIONS, notifs);
    return newNotif;
  },

  markNotificationAsRead(id: string): void {
    const notifs = this.getNotifications();
    const item = notifs.find((n) => n.id === id);
    if (item) {
      item.read = true;
      safeSet(STORAGE_KEYS.NOTIFICATIONS, notifs);
    }
  },

  markAllNotificationsAsRead(): void {
    const notifs = this.getNotifications();
    notifs.forEach((n) => (n.read = true));
    safeSet(STORAGE_KEYS.NOTIFICATIONS, notifs);
  },
};
