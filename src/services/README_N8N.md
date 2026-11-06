# n8n Workflow Integration Architecture

This application is built with a typed service adapter layer (`src/services/quoteAdapter.ts`) specifically designed to plug directly into an existing n8n workflow or backend proxy.

## Integration Topology

```
[ Frontend Client (React) ]
             |
             v
[ Server-Side Proxy / Express Gateway (`/api/n8n/*`) ]
             |  (Injects Webhook Secret / Bearer Token)
             v
[ n8n Workflow Webhook Node ]
             |
     +-------+-------+
     |               |
     v               v
[ AI LLM Node ]  [ Database / Price Catalogue ]
     |               |
     +-------+-------+
             |
             v
[ Format Proposed Quotation JSON ]
             |
             v
[ Response to Applet ]
```

## Connection Points

### 1. Quotation Generation Webhook
- **Method**: `POST`
- **n8n Path**: `/webhook/quote-generate`
- **Payload Schema**:
  ```json
  {
    "requestId": "req_12345",
    "businessId": "biz_apex_01",
    "customerId": "cust_01",
    "customer": {
      "name": "Sarah Jenkins",
      "companyName": "Highline Logistics Park",
      "email": "sjenkins@highlinelogistics.example.com",
      "billingAddress": { ... },
      "siteAddress": { ... }
    },
    "requestText": "Please quote for repairing a damaged boundary wall...",
    "selectedCatalogueItemIds": ["cat_01", "cat_03"],
    "currency": "USD",
    "idempotencyKey": "idem_91024_abc"
  }
  ```
- **n8n Output Expectation**:
  ```json
  {
    "jobId": "job_99182",
    "status": "completed",
    "proposedItems": [
      {
        "id": "li_01",
        "catalogueItemId": "cat_03",
        "name": "Masonry Demolition & Mechanical Haulage",
        "quantity": 6,
        "unit": "tonne",
        "unitPrice": 120.00,
        "taxRate": 8.5,
        "isCustom": false,
        "isAssumedQuantity": true
      }
    ],
    "assumptions": [
      "Assumed 6 tonnes based on 14m wall section. Dimensions require physical survey."
    ],
    "missingFields": []
  }
  ```

### 2. Quotation Email Delivery Webhook
- **Method**: `POST`
- **n8n Path**: `/webhook/quote-send`
- **Payload Schema**:
  ```json
  {
    "quoteId": "q_01",
    "quoteNumber": "Q-2027-0101",
    "revisionNumber": 1,
    "recipientEmail": "sjenkins@highlinelogistics.example.com",
    "ccEmail": "",
    "subject": "Quotation Q-2027-0101: Boundary Wall Structural Repair",
    "message": "...",
    "idempotencyKey": "send_idem_90218"
  }
  ```

## Switching from Mock to Real n8n Adapter
In `src/services/quoteAdapter.ts`, implement `HttpN8nQuoteAdapter` conforming to `IQuoteServiceAdapter` and point it to `/api/n8n/generate` and `/api/n8n/send`. The server-side proxy keeps the n8n webhook API keys secure without exposing credentials to the browser.
