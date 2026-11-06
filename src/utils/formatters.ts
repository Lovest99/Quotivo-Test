/**
 * Formatters and display helpers
 */

export function formatCurrency(
  amount: number,
  currency: string = 'USD',
  showCents: boolean = true
): string {
  if (amount === undefined || amount === null || isNaN(amount)) {
    amount = 0;
  }

  const symbolMap: Record<string, string> = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    AUD: 'A$',
    CAD: 'C$',
    NZD: 'NZ$',
    CHF: 'CHF ',
    ZAR: 'R ',
  };

  const symbol = symbolMap[currency.toUpperCase()] || `${currency} `;

  const parts = Math.abs(amount).toFixed(showCents ? 2 : 0).split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const formattedNumber = parts.join('.');

  const sign = amount < 0 ? '-' : '';
  return `${sign}${symbol}${formattedNumber}`;
}

export function formatDate(dateString?: string): string {
  if (!dateString) return '—';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
}

export function formatDateTime(dateString?: string): string {
  if (!dateString) return '—';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateString;
  }
}

export function getStatusLabel(status: string): string {
  const map: Record<string, string> = {
    draft: 'Draft',
    needs_info: 'Needs Info',
    awaiting_approval: 'Awaiting Approval',
    changes_requested: 'Changes Requested',
    approved: 'Approved',
    sent: 'Sent',
    accepted: 'Accepted',
    declined: 'Declined',
    expired: 'Expired',
    archived: 'Archived',
    not_sent: 'Not Sent',
    queued: 'Queued',
    sending: 'Sending...',
    provider_accepted: 'Provider Accepted',
    delivered: 'Delivered',
    failed: 'Delivery Failed',
    unknown: 'Status Unknown',
  };
  return map[status] || status;
}
