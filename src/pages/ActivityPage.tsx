import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ActivityTimeline } from '../components/quote/ActivityTimeline';
import { History, Search, Filter } from 'lucide-react';

export const ActivityPage: React.FC = () => {
  const { activities } = useApp();
  const [filterType, setFilterType] = useState('all');
  const [query, setQuery] = useState('');

  const filtered = activities.filter((act) => {
    if (filterType !== 'all') {
      if (filterType === 'approvals' && act.type !== 'approved' && act.type !== 'submitted_for_approval' && act.type !== 'changes_requested') {
        return false;
      }
      if (filterType === 'delivery' && act.type !== 'send_attempted' && act.type !== 'delivered' && act.type !== 'delivery_failed') {
        return false;
      }
      if (filterType === 'customer' && act.type !== 'customer_accepted' && act.type !== 'customer_declined') {
        return false;
      }
    }

    if (query) {
      const q = query.toLowerCase();
      return act.title.toLowerCase().includes(q) || act.description.toLowerCase().includes(q);
    }

    return true;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200 dark:border-neutral-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
            <History className="w-5 h-5 text-blue-600" />
            <span>Audit Trail & Activity Log</span>
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Immutable log of quotations, human approval actions, revisions, and simulated delivery dispatches.
          </p>
        </div>
      </div>

      {/* Sticky Filter toolbar */}
      <div className="sticky top-14 z-20 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-3 bg-[#fafaf9]/95 dark:bg-neutral-950/95 backdrop-blur-md border-b border-neutral-200/80 dark:border-neutral-800 shadow-2xs">
        <div className="flex flex-wrap items-center gap-2.5 text-xs">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-neutral-400" />
            <input
              type="text"
              placeholder="Search events..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-xs"
            />
          </div>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-2.5 py-1.5 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-xs"
          >
            <option value="all">All Events</option>
            <option value="approvals">Approvals & Governance</option>
            <option value="delivery">Delivery & Sending</option>
            <option value="customer">Customer Decisions</option>
          </select>
        </div>
      </div>

      {/* Activity Timeline List */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-6 shadow-xs">
        <ActivityTimeline events={filtered} />
      </div>
    </div>
  );
};
