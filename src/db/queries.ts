import { db } from './index.ts';
import {
  users,
  businesses,
  customers,
  catalogueItems,
  quotes,
  quoteLineItems,
  quoteRevisions,
  activityLogs,
  n8nWebhookEvents,
} from './schema.ts';
import { eq, desc, asc, and } from 'drizzle-orm';
import { BusinessSettings, Customer, Quote, QuoteLineItem } from '../types/index.ts';

function formatBusinessToDomain(b: any): BusinessSettings {
  if (!b) {
    return {
      name: 'Apex Civil & Building Services',
      legalName: 'Apex Civil Contracting Ltd',
      industry: 'Civil Engineering & Construction',
      email: 'estimating@apexcivil.example.com',
      phone: '+44 20 7946 0912',
      address: {
        street: '14 Ironworks Way, Industrial Park',
        city: 'Manchester',
        state: 'Greater Manchester',
        postalCode: 'M17 1AB',
        country: 'United Kingdom',
      },
      taxRegistrationNumber: 'GB 921 8402 11',
    };
  }

  return {
    name: b.name || 'Apex Civil & Building Services',
    legalName: b.legalName || '',
    logoUrl: b.logoUrl || '',
    industry: b.industry || 'Civil Engineering & Construction',
    email: b.email || 'estimating@apexcivil.example.com',
    phone: b.phone || '+44 20 7946 0912',
    website: b.website || '',
    address: {
      street: b.street || (b.address?.street ?? '14 Ironworks Way, Industrial Park'),
      city: b.city || (b.address?.city ?? 'Manchester'),
      state: b.state || (b.address?.state ?? 'Greater Manchester'),
      postalCode: b.postalCode || (b.address?.postalCode ?? 'M17 1AB'),
      country: b.country || (b.address?.country ?? 'United Kingdom'),
    },
    taxRegistrationNumber: b.taxRegistrationNumber || '',
    companyNumber: b.companyNumber || '',
  };
}

function formatCustomerToDomain(c: any): Customer {
  return {
    id: c.id,
    type: (c.type as 'business' | 'individual') || 'business',
    name: c.name || '',
    companyName: c.companyName || '',
    email: c.email || '',
    phone: c.phone || '',
    billingAddress: c.billingAddress || {
      street: c.billingStreet || '',
      city: c.billingCity || '',
      state: c.billingState || '',
      postalCode: c.billingPostal || '',
      country: 'United States',
    },
    siteAddress: typeof c.siteAddress === 'object' && c.siteAddress !== null
      ? c.siteAddress
      : c.siteAddress
        ? {
            street: c.siteAddress,
            city: c.billingCity || '',
            state: c.billingState || '',
            postalCode: c.billingPostal || '',
            country: 'United States',
          }
        : undefined,
    notes: c.notes || '',
    createdAt: c.createdAt ? new Date(c.createdAt).toISOString() : new Date().toISOString(),
    updatedAt: c.updatedAt ? new Date(c.updatedAt).toISOString() : new Date().toISOString(),
  };
}

function formatQuoteToDomain(q: any, items: any[], revisions: any[]): Quote {
  const lineItems: QuoteLineItem[] = (items || []).map((li) => ({
    id: li.id,
    catalogueItemId: li.catalogueItemId || undefined,
    name: li.name,
    description: li.description || '',
    quantity: li.quantity,
    unit: li.unit || 'unit',
    unitPrice: li.unitPrice,
    discountPercent: 0,
    taxRate: 10,
    taxCategory: 'standard',
    isCustom: Boolean(li.isCustom),
    isPriceRequired: Boolean(li.isPriceRequired),
  }));

  return {
    id: q.id,
    quoteNumber: q.quoteNumber,
    title: q.title,
    customerId: q.customerId,
    currency: q.currency || 'USD',
    currentRevision: q.currentRevision || 1,
    status: q.status || 'draft',
    deliveryStatus: q.deliveryStatus || 'not_sent',
    createdById: q.userId || 'usr_staff_01',
    createdByName: 'Authorized Estimator',
    createdAt: q.createdAt ? new Date(q.createdAt).toISOString() : new Date().toISOString(),
    updatedAt: q.updatedAt ? new Date(q.updatedAt).toISOString() : new Date().toISOString(),
    issueDate: q.issueDate || new Date().toISOString().split('T')[0],
    validUntil: q.validUntil || new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
    scopeSummary: q.scopeSummary || '',
    exclusions: q.exclusions || '',
    paymentTerms: q.paymentTerms || '',
    notes: q.footerNotes || '',
    lineItems,
    subtotal: q.subtotal || 0,
    discountTotal: 0,
    taxTotal: q.taxAmount || 0,
    grandTotal: q.grandTotal || 0,
    depositPercent: q.depositPercent || 0,
    depositAmount: q.depositAmount || 0,
    remainingBalance: Math.max(0, (q.grandTotal || 0) - (q.depositAmount || 0)),
    revisions: revisions || [],
    approvalHistory: [],
    changeRequests: [],
    deliveryHistory: [],
    n8nQuoteId: q.n8nQuoteId || undefined,
    flags: {
      missingPrices: false,
      unmatchedItems: false,
      assumedQuantities: false,
      incompleteScope: false,
      invalidDates: false,
      missingEmail: false,
    },
  };
}

/**
 * USERS: Upsert or retrieve user record
 */
export async function getOrCreateUser(uid: string, email: string, name?: string, role = 'owner') {
  try {
    const existing = await db.select().from(users).where(eq(users.uid, uid)).limit(1);
    if (existing.length > 0) {
      return existing[0];
    }
    const inserted = await db
      .insert(users)
      .values({
        uid,
        email,
        name: name || email.split('@')[0],
        role,
      })
      .onConflictDoUpdate({
        target: users.uid,
        set: {
          email,
          updatedAt: new Date(),
        },
      })
      .returning();
    return inserted[0];
  } catch (error) {
    console.error('getOrCreateUser error:', error);
    throw new Error('Failed to retrieve or create user', { cause: error });
  }
}

/**
 * BUSINESS PROFILE: Retrieve or initialize business profile
 */
export async function getBusiness(userId = 'default_owner'): Promise<BusinessSettings> {
  try {
    const records = await db.select().from(businesses).where(eq(businesses.userId, userId)).limit(1);
    if (records.length > 0) return formatBusinessToDomain(records[0]);

    // Seed default if empty
    const seeded = await db
      .insert(businesses)
      .values({
        userId,
        name: 'Apex Civil & Building Services',
        legalName: 'Apex Civil Contracting Ltd',
        industry: 'Civil Engineering & Construction',
        email: 'estimating@apexcivil.example.com',
        phone: '+44 20 7946 0912',
        street: '14 Ironworks Way, Industrial Park',
        city: 'Manchester',
        state: 'Greater Manchester',
        postalCode: 'M17 1AB',
        taxRegistrationNumber: 'GB 921 8402 11',
        currency: 'USD',
      })
      .returning();
    return formatBusinessToDomain(seeded[0]);
  } catch (error) {
    console.error('getBusiness error:', error);
    throw new Error('Failed to fetch business settings', { cause: error });
  }
}

export async function upsertBusiness(userId: string, data: any): Promise<BusinessSettings> {
  try {
    const existing = await db.select().from(businesses).where(eq(businesses.userId, userId)).limit(1);
    const dbPayload: any = {
      name: data.name,
      legalName: data.legalName,
      logoUrl: data.logoUrl,
      industry: data.industry,
      email: data.email,
      phone: data.phone,
      street: data.address?.street ?? data.street,
      city: data.address?.city ?? data.city,
      state: data.address?.state ?? data.state,
      postalCode: data.address?.postalCode ?? data.postalCode,
      taxRegistrationNumber: data.taxRegistrationNumber,
      currency: data.currency,
      quoteNumberPrefix: data.quoteNumberPrefix,
      defaultValidityDays: data.defaultValidityDays,
      defaultTaxRate: data.defaultTaxRate,
      defaultPaymentTerms: data.defaultPaymentTerms,
      defaultFooterNotes: data.defaultFooterNotes,
      defaultDepositPercent: data.defaultDepositPercent,
      updatedAt: new Date(),
    };
    Object.keys(dbPayload).forEach(
      (k) => dbPayload[k] === undefined && delete dbPayload[k]
    );

    let saved;
    if (existing.length > 0) {
      const updated = await db
        .update(businesses)
        .set(dbPayload)
        .where(eq(businesses.userId, userId))
        .returning();
      saved = updated[0];
    } else {
      const inserted = await db
        .insert(businesses)
        .values({ ...dbPayload, userId })
        .returning();
      saved = inserted[0];
    }
    return formatBusinessToDomain(saved);
  } catch (error) {
    console.error('upsertBusiness error:', error);
    throw new Error('Failed to update business settings', { cause: error });
  }
}

/**
 * CUSTOMERS
 */
export async function getCustomers(userId = 'default_owner'): Promise<Customer[]> {
  try {
    const list = await db.select().from(customers).where(eq(customers.userId, userId)).orderBy(asc(customers.name));
    return list.map(formatCustomerToDomain);
  } catch (error) {
    console.error('getCustomers error:', error);
    throw new Error('Failed to fetch customers', { cause: error });
  }
}

export async function upsertCustomer(userId: string, customerData: any): Promise<Customer> {
  try {
    const existing = await db.select().from(customers).where(eq(customers.id, customerData.id)).limit(1);
    const dbPayload = {
      id: customerData.id,
      userId,
      name: customerData.name,
      email: customerData.email,
      phone: customerData.phone || '',
      companyName: customerData.companyName || '',
      billingStreet: customerData.billingAddress?.street ?? customerData.billingStreet ?? '',
      billingCity: customerData.billingAddress?.city ?? customerData.billingCity ?? '',
      billingState: customerData.billingAddress?.state ?? customerData.billingState ?? '',
      billingPostal: customerData.billingAddress?.postalCode ?? customerData.billingPostal ?? '',
      siteAddress: typeof customerData.siteAddress === 'string'
        ? customerData.siteAddress
        : customerData.siteAddress?.street
          ? `${customerData.siteAddress.street}, ${customerData.siteAddress.city || ''}`
          : '',
      notes: customerData.notes || '',
      updatedAt: new Date(),
    };

    let saved;
    if (existing.length > 0) {
      const updated = await db
        .update(customers)
        .set(dbPayload)
        .where(eq(customers.id, customerData.id))
        .returning();
      saved = updated[0];
    } else {
      const inserted = await db
        .insert(customers)
        .values(dbPayload)
        .returning();
      saved = inserted[0];
    }
    return formatCustomerToDomain(saved);
  } catch (error) {
    console.error('upsertCustomer error:', error);
    throw new Error('Failed to save customer', { cause: error });
  }
}

/**
 * CATALOGUE ITEMS
 */
export async function getCatalogueItems(userId = 'default_owner') {
  try {
    return await db.select().from(catalogueItems).where(eq(catalogueItems.userId, userId)).orderBy(asc(catalogueItems.name));
  } catch (error) {
    console.error('getCatalogueItems error:', error);
    throw new Error('Failed to fetch price catalogue items', { cause: error });
  }
}

export async function bulkUpsertCatalogueItems(userId: string, items: (typeof catalogueItems.$inferInsert)[]) {
  try {
    const results = [];
    for (const item of items) {
      const res = await db
        .insert(catalogueItems)
        .values({ ...item, userId })
        .onConflictDoUpdate({
          target: catalogueItems.id,
          set: {
            code: item.code,
            name: item.name,
            description: item.description,
            category: item.category,
            unit: item.unit,
            unitPrice: item.unitPrice,
            currency: item.currency,
            updatedAt: new Date(),
          },
        })
        .returning();
      results.push(res[0]);
    }
    return results;
  } catch (error) {
    console.error('bulkUpsertCatalogueItems error:', error);
    throw new Error('Failed to update catalogue items', { cause: error });
  }
}

/**
 * QUOTATIONS & LINE ITEMS
 */
export async function getQuotes(userId = 'default_owner'): Promise<Quote[]> {
  try {
    const quoteRecords = await db.select().from(quotes).where(eq(quotes.userId, userId)).orderBy(desc(quotes.updatedAt));

    const result: Quote[] = [];
    for (const q of quoteRecords) {
      const items = await db
        .select()
        .from(quoteLineItems)
        .where(eq(quoteLineItems.quoteId, q.id))
        .orderBy(asc(quoteLineItems.orderIndex));

      const revisions = await db
        .select()
        .from(quoteRevisions)
        .where(eq(quoteRevisions.quoteId, q.id))
        .orderBy(desc(quoteRevisions.revisionNumber));

      result.push(formatQuoteToDomain(q, items, revisions));
    }
    return result;
  } catch (error) {
    console.error('getQuotes error:', error);
    throw new Error('Failed to fetch quotations from database', { cause: error });
  }
}

export async function getQuoteById(id: string): Promise<Quote | null> {
  try {
    const found = await db.select().from(quotes).where(eq(quotes.id, id)).limit(1);
    if (found.length === 0) return null;

    const q = found[0];
    const items = await db
      .select()
      .from(quoteLineItems)
      .where(eq(quoteLineItems.quoteId, q.id))
      .orderBy(asc(quoteLineItems.orderIndex));

    const revisions = await db
      .select()
      .from(quoteRevisions)
      .where(eq(quoteRevisions.quoteId, q.id))
      .orderBy(desc(quoteRevisions.revisionNumber));

    return formatQuoteToDomain(q, items, revisions);
  } catch (error) {
    console.error('getQuoteById error:', error);
    throw new Error(`Failed to fetch quotation ${id}`, { cause: error });
  }
}

export async function saveQuoteWithItems(
  userId: string,
  quoteData: any,
  lineItemsList: any[]
): Promise<Quote> {
  try {
    const cleanQuote = {
      id: quoteData.id,
      userId,
      customerId: quoteData.customerId,
      quoteNumber: quoteData.quoteNumber,
      title: quoteData.title,
      scopeSummary: quoteData.scopeSummary || '',
      currency: quoteData.currency || 'USD',
      subtotal: quoteData.subtotal ?? 0,
      taxRate: quoteData.taxRate ?? 10,
      taxAmount: quoteData.taxAmount ?? quoteData.taxTotal ?? 0,
      grandTotal: quoteData.grandTotal ?? 0,
      depositPercent: quoteData.depositPercent ?? 0,
      depositAmount: quoteData.depositAmount ?? 0,
      paymentTerms: quoteData.paymentTerms || '',
      validityDays: quoteData.validityDays ?? 30,
      issueDate: quoteData.issueDate || new Date().toISOString().split('T')[0],
      validUntil: quoteData.validUntil || new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      exclusions: quoteData.exclusions || '',
      footerNotes: quoteData.footerNotes ?? quoteData.notes ?? '',
      status: quoteData.status || 'draft',
      currentRevision: quoteData.currentRevision || 1,
      deliveryStatus: quoteData.deliveryStatus || 'not_sent',
      n8nQuoteId: quoteData.n8nQuoteId ? String(quoteData.n8nQuoteId) : '',
      updatedAt: new Date(),
    };

    // 1. Upsert Quote Record
    const existing = await db.select().from(quotes).where(eq(quotes.id, cleanQuote.id)).limit(1);
    let savedQuote;
    if (existing.length > 0) {
      const updated = await db
        .update(quotes)
        .set(cleanQuote)
        .where(eq(quotes.id, cleanQuote.id))
        .returning();
      savedQuote = updated[0];
    } else {
      const inserted = await db
        .insert(quotes)
        .values(cleanQuote)
        .returning();
      savedQuote = inserted[0];
    }

    // 2. Refresh Line Items (delete and re-insert to preserve exact order and deletions)
    await db.delete(quoteLineItems).where(eq(quoteLineItems.quoteId, cleanQuote.id));

    const savedItems = [];
    if (lineItemsList && lineItemsList.length > 0) {
      for (let i = 0; i < lineItemsList.length; i++) {
        const item = lineItemsList[i];
        const insertedItem = await db
          .insert(quoteLineItems)
          .values({
            id: item.id || `li_${Date.now()}_${i}`,
            quoteId: cleanQuote.id,
            catalogueItemId: item.catalogueItemId || '',
            code: item.code || item.catalogueItemId || `ITM-${i + 1}`,
            name: item.name,
            description: item.description || '',
            quantity: item.quantity,
            unit: item.unit || 'unit',
            unitPrice: item.unitPrice,
            subtotal: item.subtotal ?? item.quantity * item.unitPrice,
            isCustom: Boolean(item.isCustom),
            isPriceRequired: Boolean(item.isPriceRequired),
            orderIndex: i,
          })
          .returning();
        savedItems.push(insertedItem[0]);
      }
    }

    return formatQuoteToDomain(savedQuote, savedItems, quoteData.revisions || []);
  } catch (error) {
    console.error('saveQuoteWithItems error:', error);
    throw new Error('Failed to save quotation and items to database', { cause: error });
  }
}

export async function addQuoteRevisionSnapshot(
  quoteId: string,
  revisionNumber: number,
  snapshotData: any,
  changeSummary = '',
  createdBy = '',
  createdByName = ''
) {
  try {
    const inserted = await db
      .insert(quoteRevisions)
      .values({
        quoteId,
        revisionNumber,
        snapshotData,
        changeSummary,
        createdBy,
        createdByName,
      })
      .returning();
    return inserted[0];
  } catch (error) {
    console.error('addQuoteRevisionSnapshot error:', error);
    throw new Error('Failed to record quotation revision audit snapshot', { cause: error });
  }
}

/**
 * ACTIVITY LOGS
 */
export async function getActivityLogs(limit = 50) {
  try {
    return await db.select().from(activityLogs).orderBy(desc(activityLogs.timestamp)).limit(limit);
  } catch (error) {
    console.error('getActivityLogs error:', error);
    throw new Error('Failed to fetch activity timeline', { cause: error });
  }
}

export async function logActivity(data: typeof activityLogs.$inferInsert) {
  try {
    const inserted = await db.insert(activityLogs).values(data).returning();
    return inserted[0];
  } catch (error) {
    console.error('logActivity error:', error);
    throw new Error('Failed to log activity audit entry', { cause: error });
  }
}

/**
 * N8N WEBHOOK EVENTS
 */
export async function recordN8nEvent(
  direction: 'inbound' | 'outbound',
  eventType: string,
  payload: any,
  quoteId?: string,
  status = 'processed',
  errorMessage = ''
) {
  try {
    const inserted = await db
      .insert(n8nWebhookEvents)
      .values({
        quoteId: quoteId || '',
        direction,
        eventType,
        payload,
        status,
        errorMessage,
      })
      .returning();
    return inserted[0];
  } catch (error) {
    console.error('recordN8nEvent error:', error);
    // Non-blocking for webhook logging
    return null;
  }
}
