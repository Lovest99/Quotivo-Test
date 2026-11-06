import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import {
  getOrCreateUser,
  getBusiness,
  upsertBusiness,
  getCustomers,
  upsertCustomer,
  getCatalogueItems,
  bulkUpsertCatalogueItems,
  getQuotes,
  getQuoteById,
  saveQuoteWithItems,
  addQuoteRevisionSnapshot,
  getActivityLogs,
  logActivity,
  recordN8nEvent,
} from './src/db/queries.ts';
import { requireAuth, optionalAuth, requireApiKeyOrAuth, AuthRequest } from './src/middleware/auth.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

// N8N Configuration (secured on backend, never exposed to client browser)
const N8N_API_KEY = process.env.N8N_API_KEY || '9oi?9JFo7"K£33:zwiE6Y(}9<[+|Ta=X&';
const N8N_WEBHOOK_CREATE_URL =
  process.env.N8N_WEBHOOK_CREATE_URL ||
  'https://mawaahtsham.app.n8n.cloud/webhook/quotivo/quote-request';
const N8N_WEBHOOK_APPROVE_URL =
  process.env.N8N_WEBHOOK_APPROVE_URL ||
  'https://mawaahtsham.app.n8n.cloud/webhook/quotivo/quote-approve';

app.use(express.json({ limit: '10mb' }));

/**
 * -----------------------------------------------------------------------------
 * 1. HEALTH & N8N STATUS
 * -----------------------------------------------------------------------------
 */
app.get('/api/n8n/health', async (_req: Request, res: Response) => {
  let dbStatus = 'connected';
  try {
    await getBusiness('health_check');
  } catch (err: any) {
    dbStatus = `offline (${err?.message || 'connection error'})`;
  }

  res.json({
    status: 'ok',
    database: {
      engine: 'PostgreSQL (Cloud SQL Developer Edition)',
      status: dbStatus,
      tables: [
        'users',
        'businesses',
        'customers',
        'catalogue_items',
        'quotes',
        'quote_line_items',
        'quote_revisions',
        'activity_logs',
        'n8n_webhook_events',
      ],
    },
    n8n: {
      createWebhookConfigured: Boolean(N8N_WEBHOOK_CREATE_URL),
      approveWebhookConfigured: Boolean(N8N_WEBHOOK_APPROVE_URL),
      integrationPartner: 'Mawa Ahtsham (n8n Cloud Automation Engine)',
      emailSender: 'mawamehar21@gmail.com (Quotivo Team)',
      apiKeyProtected: true,
    },
    version: '2.4.0-cloudsql-full-backend',
  });
});

/**
 * -----------------------------------------------------------------------------
 * 2. AUTH & USER MANAGEMENT
 * -----------------------------------------------------------------------------
 */
app.post('/api/auth/sync-user', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const uid = req.user!.uid;
    const email = req.user!.email || 'user@example.com';
    const name = (req.body?.name as string) || req.user!.name || email.split('@')[0];
    const role = (req.body?.role as string) || 'owner';

    const user = await getOrCreateUser(uid, email, name, role);
    res.json(user);
  } catch (err: any) {
    console.error('Failed to sync user with Cloud SQL:', err);
    res.status(500).json({ error: 'Failed to synchronize user account' });
  }
});

/**
 * -----------------------------------------------------------------------------
 * 3. BUSINESS PROFILE & SETTINGS
 * -----------------------------------------------------------------------------
 */
app.get('/api/business', optionalAuth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.uid || 'default_owner';
    const business = await getBusiness(userId);
    res.json(business);
  } catch (err: any) {
    console.error('Failed to fetch business settings:', err);
    res.status(500).json({ error: 'Failed to fetch business profile' });
  }
});

app.put('/api/business', optionalAuth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.uid || 'default_owner';
    const updated = await upsertBusiness(userId, req.body);
    res.json(updated);
  } catch (err: any) {
    console.error('Failed to update business profile:', err);
    res.status(500).json({ error: 'Failed to update business profile' });
  }
});

/**
 * -----------------------------------------------------------------------------
 * 4. CUSTOMERS
 * -----------------------------------------------------------------------------
 */
app.get('/api/customers', optionalAuth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.uid || 'default_owner';
    const customerList = await getCustomers(userId);
    res.json(customerList);
  } catch (err: any) {
    console.error('Failed to fetch customers:', err);
    res.status(500).json({ error: 'Failed to fetch customers' });
  }
});

app.post('/api/customers', optionalAuth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.uid || 'default_owner';
    const customer = await upsertCustomer(userId, req.body);
    res.json(customer);
  } catch (err: any) {
    console.error('Failed to save customer:', err);
    res.status(500).json({ error: 'Failed to save customer' });
  }
});

/**
 * -----------------------------------------------------------------------------
 * 5. CATALOGUE ITEMS (PRICE BOOK)
 * -----------------------------------------------------------------------------
 */
app.get('/api/catalogue', optionalAuth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.uid || 'default_owner';
    const items = await getCatalogueItems(userId);
    res.json(items);
  } catch (err: any) {
    console.error('Failed to fetch catalogue:', err);
    res.status(500).json({ error: 'Failed to fetch price catalogue' });
  }
});

app.post('/api/catalogue/bulk', optionalAuth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.uid || 'default_owner';
    const items = req.body?.items || [];
    const saved = await bulkUpsertCatalogueItems(userId, items);
    res.json({ count: saved.length, items: saved });
  } catch (err: any) {
    console.error('Failed to bulk upsert catalogue:', err);
    res.status(500).json({ error: 'Failed to save catalogue items' });
  }
});

app.post('/api/catalogue', optionalAuth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.uid || 'default_owner';
    const item = req.body;
    const [saved] = await bulkUpsertCatalogueItems(userId, [item]);
    res.json(saved || item);
  } catch (err: any) {
    console.error('Failed to save catalogue item:', err);
    res.status(500).json({ error: 'Failed to save catalogue item' });
  }
});

/**
 * -----------------------------------------------------------------------------
 * 6. QUOTATIONS & SCHEDULE OF WORKS
 * -----------------------------------------------------------------------------
 */
app.get('/api/quotes', optionalAuth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.uid || 'default_owner';
    const quoteList = await getQuotes(userId);
    res.json(quoteList);
  } catch (err: any) {
    console.error('Failed to fetch quotes from Cloud SQL:', err);
    res.status(500).json({ error: 'Failed to fetch quotations' });
  }
});

app.get('/api/quotes/:id', async (req: Request, res: Response) => {
  try {
    const quote = await getQuoteById(req.params.id);
    if (!quote) {
      res.status(404).json({ error: 'Quotation not found' });
      return;
    }
    res.json(quote);
  } catch (err: any) {
    console.error(`Failed to fetch quote ${req.params.id}:`, err);
    res.status(500).json({ error: 'Failed to fetch quotation details' });
  }
});

app.post('/api/quotes', optionalAuth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.uid || 'default_owner';
    const { lineItems, ...quoteData } = req.body;

    const saved = await saveQuoteWithItems(userId, quoteData, lineItems || []);

    // Record activity log
    await logActivity({
      id: `act_${Date.now()}`,
      quoteId: saved.id,
      customerId: saved.customerId,
      type: 'quote_updated',
      title: `Quotation ${saved.quoteNumber} Saved in Cloud SQL`,
      description: `Saved revision ${saved.currentRevision} with ${lineItems?.length || 0} line items.`,
      performedBy: userId,
      performedByName: req.user?.name || 'Authorized User',
    });

    res.json(saved);
  } catch (err: any) {
    console.error('Failed to save quote in Cloud SQL:', err);
    res.status(500).json({ error: 'Failed to save quotation' });
  }
});

app.post('/api/quotes/:id/revision-snapshot', optionalAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { revisionNumber, snapshotData, changeSummary } = req.body;
    const author = req.user?.uid || 'owner';
    const authorName = req.user?.name || 'Owner';

    const snapshot = await addQuoteRevisionSnapshot(
      req.params.id,
      revisionNumber,
      snapshotData,
      changeSummary,
      author,
      authorName
    );

    res.json(snapshot);
  } catch (err: any) {
    console.error('Failed to save revision snapshot:', err);
    res.status(500).json({ error: 'Failed to record revision snapshot' });
  }
});

/**
 * -----------------------------------------------------------------------------
 * 7. ACTIVITY AUDIT TRAIL
 * -----------------------------------------------------------------------------
 */
app.get('/api/activity', async (_req: Request, res: Response) => {
  try {
    const logs = await getActivityLogs(50);
    res.json(logs);
  } catch (err: any) {
    console.error('Failed to fetch activity logs:', err);
    res.status(500).json({ error: 'Failed to fetch activity timeline' });
  }
});

/**
 * -----------------------------------------------------------------------------
 * 8. N8N AUTOMATION PROXIES & INBOUND WEBHOOK RECEIVER
 * -----------------------------------------------------------------------------
 */

/**
 * Webhook Proxy 1: Create Draft Quote
 * POST /api/n8n/create-draft
 */
app.post('/api/n8n/create-draft', async (req: Request, res: Response) => {
  try {
    const payload = req.body;

    if (!payload.email || !payload.name) {
      res.status(400).json({
        error: 'Missing required customer details (name and email are required)',
      });
      return;
    }

    console.log(`[n8n Proxy] Sending quote request for: ${payload.name} (${payload.email})`);

    // Log outbound webhook request to Cloud SQL
    await recordN8nEvent('outbound', 'quote_request', payload);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000);

    const response = await fetch(N8N_WEBHOOK_CREATE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': N8N_API_KEY,
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errText = await response.text();
      console.warn(`[n8n Proxy] n8n returned non-200: ${response.status}`, errText);
      await recordN8nEvent('outbound', 'quote_request_error', { status: response.status, errText }, undefined, 'failed', errText);

      res.status(response.status).json({
        error: `n8n webhook error (${response.status}): ${errText || response.statusText}`,
        upstreamStatus: response.status,
      });
      return;
    }

    const data = await response.json();
    console.log(`[n8n Proxy] Draft created successfully from n8n. Quote ID: ${data.quote_id || data.id}`);

    await recordN8nEvent('inbound', 'quote_created_by_n8n', data, data.quote_id || data.id);
    res.json(data);
  } catch (err: any) {
    console.error('[n8n Proxy] Create Draft Request failed:', err?.message || err);
    await recordN8nEvent('outbound', 'quote_request_timeout', { error: err?.message }, undefined, 'failed', err?.message);

    res.status(502).json({
      error: 'Failed to communicate with n8n quote-request webhook',
      details: err?.message || 'Network timeout or connection refused',
    });
  }
});

/**
 * Webhook Proxy 2: Approve & Send Quote
 * POST /api/n8n/approve-and-send
 */
app.post('/api/n8n/approve-and-send', async (req: Request, res: Response) => {
  try {
    const payload = req.body;

    if (!payload.quote_id) {
      res.status(400).json({
        error: 'Missing required quote_id for approval and dispatch',
      });
      return;
    }

    console.log(`[n8n Proxy] Submitting approval for quote ID: ${payload.quote_id}, approved: ${payload.approved}`);

    await recordN8nEvent('outbound', 'quote_approval', payload, payload.quote_id);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000);

    const response = await fetch(N8N_WEBHOOK_APPROVE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': N8N_API_KEY,
      },
      body: JSON.stringify({
        quote_id: payload.quote_id,
        approved: payload.approved ?? true,
        tax_rate: payload.tax_rate ?? 0,
        notes: payload.notes || 'Thank you for choosing us.',
        items: payload.items || [],
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errText = await response.text();
      console.warn(`[n8n Proxy] n8n approval error (${response.status}):`, errText);
      await recordN8nEvent('outbound', 'quote_approval_error', { status: response.status, errText }, payload.quote_id, 'failed', errText);

      res.status(response.status).json({
        error: `n8n approve webhook error: ${errText || response.statusText}`,
        upstreamStatus: response.status,
      });
      return;
    }

    const data = await response.json();
    console.log('[n8n Proxy] n8n approve response:', data);

    await recordN8nEvent('inbound', 'email_dispatched_confirmation', data, payload.quote_id);
    res.json(data);
  } catch (err: any) {
    console.error('[n8n Proxy] Approve & Send failed:', err?.message || err);
    await recordN8nEvent('outbound', 'quote_approval_timeout', { error: err?.message }, req.body?.quote_id, 'failed', err?.message);

    res.status(502).json({
      error: 'Failed to communicate with n8n quote-approve webhook',
      details: err?.message || 'Network timeout or connection refused',
    });
  }
});

/**
 * Inbound Webhook: Dedicated endpoint for n8n to directly query, update, or sync quotes into Cloud SQL
 * Protected with X-API-Key or Bearer token
 * POST /api/n8n/inbound-webhook
 */
app.post('/api/n8n/inbound-webhook', requireApiKeyOrAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { event_type, quote_id, status, notes, data } = req.body;

    console.log(`[n8n Inbound] Received event: ${event_type} for quote: ${quote_id}`);
    await recordN8nEvent('inbound', event_type || 'status_sync', req.body, quote_id);

    if (quote_id && status) {
      const existing = await getQuoteById(quote_id);
      if (existing) {
        await saveQuoteWithItems('default_owner', {
          ...existing,
          status,
          updatedAt: new Date(),
        }, existing.lineItems as any);

        await logActivity({
          id: `act_${Date.now()}`,
          quoteId: quote_id,
          customerId: existing.customerId,
          type: status === 'accepted' ? 'quote_accepted' : 'quote_updated',
          title: `n8n Synced Status: ${status.toUpperCase()}`,
          description: notes || `Quote status updated via n8n automation relay.`,
          performedBy: 'n8n_automation',
          performedByName: 'n8n Cloud Relay',
        });
      }
    }

    res.json({
      success: true,
      message: 'Inbound n8n event recorded and applied to Cloud SQL successfully',
      quote_id,
      event_type,
    });
  } catch (err: any) {
    console.error('[n8n Inbound] Error processing webhook:', err);
    res.status(500).json({ error: 'Failed to process n8n webhook payload' });
  }
});

/**
 * -----------------------------------------------------------------------------
 * 9. FRONTEND INTEGRATION & SERVER STARTUP
 * -----------------------------------------------------------------------------
 */
/**
 * Initial database seeding if Cloud SQL tables are fresh
 */
async function seedDatabaseIfEmpty() {
  try {
    const existing = await getCustomers('default_owner');
    if (existing.length === 0) {
      console.log('[Cloud SQL] Empty tables detected. Seeding initial trade quotes & price catalogue...');
      const { SEED_BUSINESS, SEED_CUSTOMERS, SEED_CATALOGUE, SEED_QUOTES } = await import('./src/services/seedData.ts');

      await upsertBusiness('default_owner', {
        userId: 'default_owner',
        name: SEED_BUSINESS.name,
        legalName: SEED_BUSINESS.legalName,
        industry: SEED_BUSINESS.industry,
        email: SEED_BUSINESS.email,
        phone: SEED_BUSINESS.phone,
        street: SEED_BUSINESS.address.street,
        city: SEED_BUSINESS.address.city,
        state: SEED_BUSINESS.address.state,
        postalCode: SEED_BUSINESS.address.postalCode,
        taxRegistrationNumber: SEED_BUSINESS.taxRegistrationNumber,
        currency: 'USD',
      });

      for (const c of SEED_CUSTOMERS) {
        await upsertCustomer('default_owner', {
          id: c.id,
          userId: 'default_owner',
          name: c.name,
          email: c.email,
          phone: c.phone || '',
          companyName: c.companyName || '',
          billingStreet: c.billingAddress?.street || '',
          billingCity: c.billingAddress?.city || '',
          billingState: c.billingAddress?.state || '',
          billingPostal: c.billingAddress?.postalCode || '',
          siteAddress: c.siteAddress?.street || '',
          notes: c.notes || '',
        });
      }

      await bulkUpsertCatalogueItems(
        'default_owner',
        SEED_CATALOGUE.map((item) => ({
          id: item.id,
          userId: 'default_owner',
          code: item.code,
          name: item.name,
          description: item.description,
          category: item.category,
          unit: item.unit,
          unitPrice: item.unitPrice,
          currency: item.currency,
        }))
      );

      for (const q of SEED_QUOTES) {
        await saveQuoteWithItems(
          'default_owner',
          {
            id: q.id,
            userId: 'default_owner',
            customerId: q.customerId,
            quoteNumber: q.quoteNumber,
            title: q.title,
            scopeSummary: q.scopeSummary,
            currency: q.currency,
            subtotal: q.subtotal,
            taxRate: 0,
            taxAmount: q.taxTotal || 0,
            grandTotal: q.grandTotal,
            depositPercent: q.depositPercent || 0,
            depositAmount: q.depositAmount || 0,
            paymentTerms: q.paymentTerms || '',
            validityDays: 30,
            issueDate: q.issueDate,
            validUntil: q.validUntil,
            exclusions: q.exclusions || '',
            footerNotes: q.notes || '',
            status: q.status,
            currentRevision: q.currentRevision,
            deliveryStatus: q.deliveryStatus,
            n8nQuoteId: '',
          },
          q.lineItems.map((li, idx) => ({
            id: li.id,
            quoteId: q.id,
            catalogueItemId: li.catalogueItemId || '',
            code: li.catalogueItemId || `ITM-${idx + 1}`,
            name: li.name,
            description: li.description || '',
            quantity: li.quantity,
            unit: li.unit,
            unitPrice: li.unitPrice,
            subtotal: li.quantity * li.unitPrice,
            isCustom: li.isCustom ?? false,
            isPriceRequired: li.isPriceRequired ?? false,
            orderIndex: idx,
          }))
        );
      }
      console.log('[Cloud SQL] Database successfully initialized and seeded with trade records.');
    }
  } catch (err) {
    console.warn('[Cloud SQL] Initial seed check failed (non-blocking):', err);
  }
}

async function startServer() {
  await seedDatabaseIfEmpty();

  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true, host: '0.0.0.0' },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Quotivo Full-Stack Server with Cloud SQL & n8n running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal error starting Quotivo server:', err);
  process.exit(1);
});
