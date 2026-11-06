import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Search, Plus, Users, ArrowRight, Mail, Phone, MapPin } from 'lucide-react';

export const CustomersListPage: React.FC = () => {
  const { customers, quotes } = useApp();
  const [search, setSearch] = useState('');

  const filtered = customers.filter((c) => {
    const q = search.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      (c.companyName && c.companyName.toLowerCase().includes(q)) ||
      c.email.toLowerCase().includes(q) ||
      c.phone.includes(q)
    );
  });

  return (
    <div className="p-3 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-4 sm:space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight bg-gradient-to-r from-neutral-900 via-neutral-800 to-neutral-700 dark:from-white dark:via-neutral-100 dark:to-neutral-300 bg-clip-text text-transparent flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600 shrink-0" />
            <span>Customer Directory</span>
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Commercial and individual clients, addresses, and quotation histories.
          </p>
        </div>

        <Link
          to="/app/customers/new"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs self-start sm:self-auto shrink-0"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Add New Customer</span>
        </Link>
      </div>

      {/* Sticky Search Input */}
      <div className="sticky top-14 z-20 -mx-3 sm:-mx-6 lg:-mx-8 px-3 sm:px-6 lg:px-8 py-2.5 bg-[#fafaf9]/95 dark:bg-neutral-950/95 backdrop-blur-md border-b border-neutral-200/80 dark:border-neutral-800 shadow-2xs">
        <div className="relative max-w-md">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-neutral-400" />
          <input
            type="text"
            placeholder="Search by customer name, company, email, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-xs focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
          />
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-x-auto bg-white dark:bg-neutral-900 shadow-2xs">
        <table className="w-full text-xs text-left border-collapse">
          <thead className="sticky top-0 z-10 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md">
            <tr className="bg-neutral-50/80 dark:bg-neutral-800/60 border-b border-neutral-200 dark:border-neutral-800 text-neutral-500 font-medium">
              <th className="py-2.5 px-3">Client Name</th>
              <th className="py-2.5 px-3">Type</th>
              <th className="py-2.5 px-3">Contact Details</th>
              <th className="py-2.5 px-3">Billing City</th>
              <th className="py-2.5 px-3 text-right">Quotes</th>
              <th className="py-2.5 px-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
            {filtered.map((c) => {
              const custQuotes = quotes.filter((q) => q.customerId === c.id);
              return (
                <tr key={c.id} className="hover:bg-neutral-50/60 dark:hover:bg-neutral-800/40 transition-colors">
                  <td className="py-3 px-3">
                    <Link
                      to={`/app/customers/${c.id}`}
                      className="font-semibold text-neutral-900 dark:text-neutral-100 hover:text-blue-600 block"
                    >
                      {c.name}
                    </Link>
                    {c.companyName && (
                      <span className="text-[11px] text-neutral-500 block">{c.companyName}</span>
                    )}
                  </td>
                  <td className="py-3 px-3 font-mono text-[11px] text-neutral-500 uppercase">
                    {c.type}
                  </td>
                  <td className="py-3 px-3">
                    <p className="text-neutral-700 dark:text-neutral-300">{c.email}</p>
                    <p className="text-[11px] text-neutral-400">{c.phone}</p>
                  </td>
                  <td className="py-3 px-3 text-neutral-600 dark:text-neutral-400">
                    {c.billingAddress?.city || '—'}, {c.billingAddress?.state || ''}
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-semibold text-neutral-900 dark:text-neutral-100">
                    {custQuotes.length}
                  </td>
                  <td className="py-3 px-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        to={`/app/customers/${c.id}`}
                        className="px-2 py-1 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded text-[11px] font-medium transition-colors"
                      >
                        Profile
                      </Link>
                      <Link
                        to={`/app/customers/${c.id}/edit`}
                        className="text-[11px] text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200"
                      >
                        Edit
                      </Link>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards (< md) */}
      <div className="md:hidden space-y-3">
        {filtered.map((c) => {
          const custQuotes = quotes.filter((q) => q.customerId === c.id);
          return (
            <div
              key={c.id}
              className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 space-y-3 shadow-xs"
            >
              <div className="flex items-start justify-between">
                <div>
                  <Link
                    to={`/app/customers/${c.id}`}
                    className="font-bold text-sm text-neutral-900 dark:text-neutral-100 hover:underline block"
                  >
                    {c.name}
                  </Link>
                  {c.companyName && (
                    <p className="text-xs text-neutral-500">{c.companyName}</p>
                  )}
                </div>
                <span className="font-mono text-[10px] uppercase text-neutral-400 bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded">
                  {c.type}
                </span>
              </div>

              <div className="space-y-1 text-xs text-neutral-600 dark:text-neutral-400">
                <p className="flex items-center gap-1.5 truncate">
                  <Mail className="w-3.5 h-3.5 text-neutral-400" />
                  <span>{c.email}</span>
                </p>
                <p className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-neutral-400" />
                  <span>{c.phone}</span>
                </p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-neutral-100 dark:border-neutral-800 text-xs">
                <span className="text-[11px] text-neutral-500">
                  {custQuotes.length} quotations on record
                </span>
                <Link
                  to={`/app/customers/${c.id}`}
                  className="inline-flex items-center gap-1 text-blue-600 font-semibold"
                >
                  <span>View Details</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
