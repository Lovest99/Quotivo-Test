import { Quote, Customer, CatalogueItem, BusinessSettings, ActivityEvent } from '../types';

export const ApiService = {
  /**
   * Health & Backend Status Check
   */
  async getHealth() {
    try {
      const res = await fetch('/api/n8n/health');
      if (!res.ok) throw new Error(`Health check returned ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('Backend API health check failed:', err);
      return null;
    }
  },

  /**
   * Fetch quotes from Cloud SQL
   */
  async getQuotes(): Promise<Quote[] | null> {
    try {
      const res = await fetch('/api/quotes');
      if (!res.ok) throw new Error(`Failed to fetch quotes: ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('Cloud SQL quotes fetch failed, using local cache:', err);
      return null;
    }
  },

  /**
   * Save a quote into Cloud SQL
   */
  async saveQuote(quote: Quote): Promise<Quote | null> {
    try {
      const res = await fetch('/api/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(quote),
      });
      if (!res.ok) throw new Error(`Failed to save quote: ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('Cloud SQL quote save failed:', err);
      return null;
    }
  },

  /**
   * Fetch customers from Cloud SQL
   */
  async getCustomers(): Promise<Customer[] | null> {
    try {
      const res = await fetch('/api/customers');
      if (!res.ok) throw new Error(`Failed to fetch customers: ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('Cloud SQL customers fetch failed, using local cache:', err);
      return null;
    }
  },

  /**
   * Save a customer into Cloud SQL
   */
  async saveCustomer(customer: Customer): Promise<Customer | null> {
    try {
      const res = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(customer),
      });
      if (!res.ok) throw new Error(`Failed to save customer: ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('Cloud SQL customer save failed:', err);
      return null;
    }
  },

  /**
   * Fetch catalogue from Cloud SQL
   */
  async getCatalogue(): Promise<CatalogueItem[] | null> {
    try {
      const res = await fetch('/api/catalogue');
      if (!res.ok) throw new Error(`Failed to fetch catalogue: ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('Cloud SQL catalogue fetch failed, using local cache:', err);
      return null;
    }
  },

  /**
   * Save a single catalogue item to Cloud SQL
   */
  async saveCatalogueItem(item: CatalogueItem): Promise<CatalogueItem | null> {
    try {
      const res = await fetch('/api/catalogue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
      });
      if (!res.ok) throw new Error(`Failed to save catalogue item: ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('Cloud SQL catalogue item save failed:', err);
      return null;
    }
  },

  /**
   * Save catalogue batch to Cloud SQL
   */
  async saveCatalogue(items: CatalogueItem[]): Promise<boolean> {
    try {
      const res = await fetch('/api/catalogue/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items }),
      });
      return res.ok;
    } catch (err) {
      console.warn('Cloud SQL catalogue bulk save failed:', err);
      return false;
    }
  },

  /**
   * Fetch business profile from Cloud SQL
   */
  async getBusiness(): Promise<BusinessSettings | null> {
    try {
      const res = await fetch('/api/business');
      if (!res.ok) throw new Error(`Failed to fetch business: ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('Cloud SQL business fetch failed, using local cache:', err);
      return null;
    }
  },

  /**
   * Update business profile in Cloud SQL
   */
  async updateBusiness(settings: Partial<BusinessSettings>): Promise<BusinessSettings | null> {
    try {
      const res = await fetch('/api/business', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      if (!res.ok) throw new Error(`Failed to update business: ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('Cloud SQL business update failed:', err);
      return null;
    }
  },

  /**
   * Fetch activity timeline from Cloud SQL
   */
  async getActivityLogs(): Promise<ActivityEvent[] | null> {
    try {
      const res = await fetch('/api/activity');
      if (!res.ok) throw new Error(`Failed to fetch activities: ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('Cloud SQL activity fetch failed, using local cache:', err);
      return null;
    }
  },
};
