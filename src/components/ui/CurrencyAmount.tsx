import React from 'react';
import { formatCurrency } from '../../utils/formatters';

interface CurrencyAmountProps {
  amount: number;
  currency?: string;
  showCents?: boolean;
  className?: string;
  signDisplay?: boolean;
}

export const CurrencyAmount: React.FC<CurrencyAmountProps> = ({
  amount,
  currency = 'USD',
  showCents = true,
  className = '',
  signDisplay = false,
}) => {
  const formatted = formatCurrency(amount, currency, showCents);
  const isNegative = amount < 0;

  return (
    <span
      className={`font-mono tabular-nums tracking-tight ${
        signDisplay ? (isNegative ? 'text-rose-600' : 'text-emerald-600') : ''
      } ${className}`}
    >
      {formatted}
    </span>
  );
};
