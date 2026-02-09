'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import {
  BellIcon,
  XMarkIcon,
  ExclamationCircleIcon,
  TruckIcon,
  CurrencyDollarIcon,
  FunnelIcon,
} from '@heroicons/react/24/outline';

interface ActivityItem {
  id: string;
  type: 'complaint' | 'ride' | 'transaction';
  title: string;
  description: string;
  status: string;
  timestamp: number;
  href: string;
}

interface ActivityCounts {
  complaints: number;
  rides: number;
  transactions: number;
  total: number;
}

type FilterType = 'all' | 'complaint' | 'ride' | 'transaction';

function formatTimeAgo(ts: number): string {
  if (!ts) return '';
  const seconds = Math.floor((Date.now() - ts) / 1000);
  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

const typeConfig = {
  complaint: {
    icon: ExclamationCircleIcon,
    label: 'Complaints',
    bg: 'bg-red-50 dark:bg-red-500/10',
    text: 'text-red-600 dark:text-red-400',
  },
  ride: {
    icon: TruckIcon,
    label: 'Rides',
    bg: 'bg-blue-50 dark:bg-blue-500/10',
    text: 'text-blue-600 dark:text-blue-400',
  },
  transaction: {
    icon: CurrencyDollarIcon,
    label: 'Transactions',
    bg: 'bg-emerald-50 dark:bg-emerald-500/10',
    text: 'text-emerald-600 dark:text-emerald-400',
  },
};

export default function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const [items, setItems] = useState<ActivityItem[]>([]);
  const [counts, setCounts] = useState<ActivityCounts>({ complaints: 0, rides: 0, transactions: 0, total: 0 });
  const [filter, setFilter] = useState<FilterType>('all');
  const [loading, setLoading] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const fetchActivity = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/activity');
      const data = await res.json();
      if (data.items) setItems(data.items);
      if (data.counts) setCounts(data.counts);
    } catch {
      // Silently fail - notifications are non-critical
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchActivity();
    const interval = setInterval(fetchActivity, 30000);
    return () => clearInterval(interval);
  }, [fetchActivity]);

  // Close panel on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node;
      if (
        panelRef.current && !panelRef.current.contains(target) &&
        buttonRef.current && !buttonRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    function handleEsc(e: KeyboardEvent) {
      if (e.key === 'Escape') setIsOpen(false);
    }
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      return () => document.removeEventListener('keydown', handleEsc);
    }
  }, [isOpen]);

  const filteredItems = filter === 'all' ? items : items.filter(i => i.type === filter);

  const filterButtons: { key: FilterType; label: string; count: number }[] = [
    { key: 'all', label: 'All', count: items.length },
    { key: 'complaint', label: 'Complaints', count: counts.complaints },
    { key: 'ride', label: 'Rides', count: counts.rides },
    { key: 'transaction', label: 'Transactions', count: counts.transactions },
  ];

  // Calculate panel position relative to button
  function getPanelStyle(): React.CSSProperties {
    if (!buttonRef.current) return { display: 'none' };
    const rect = buttonRef.current.getBoundingClientRect();
    // Position to the right of the sidebar, vertically aligned to bottom of button
    return {
      position: 'fixed',
      left: rect.right + 12,
      bottom: window.innerHeight - rect.bottom,
      zIndex: 9999,
    };
  }

  return (
    <>
      {/* Bell Button */}
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className={`flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
          isOpen
            ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400'
            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50'
        }`}
      >
        <div className="relative">
          <BellIcon className={`h-[18px] w-[18px] ${isOpen ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400'}`} />
          {counts.total > 0 && (
            <span className="absolute -top-1.5 -right-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
              {counts.total > 99 ? '99+' : counts.total}
            </span>
          )}
        </div>
        <span>Activity</span>
        {counts.total > 0 && (
          <span className="ml-auto inline-flex items-center gap-1 text-xs text-red-500 dark:text-red-400 font-semibold">
            {counts.total}
          </span>
        )}
      </button>

      {/* Panel rendered via portal so it escapes sidebar overflow */}
      {isOpen && typeof document !== 'undefined' && createPortal(
        <div
          ref={panelRef}
          style={getPanelStyle()}
          className="w-96 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-700 shrink-0">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-50">Activity Feed</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              <XMarkIcon className="h-4 w-4 text-slate-400" />
            </button>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1 px-3 py-2 border-b border-slate-100 dark:border-slate-700/50 shrink-0">
            {filterButtons.map(fb => (
              <button
                key={fb.key}
                onClick={() => setFilter(fb.key)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium whitespace-nowrap transition-colors ${
                  filter === fb.key
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/50'
                }`}
              >
                {fb.label}
                {fb.count > 0 && (
                  <span className={`inline-flex items-center justify-center h-4 min-w-[16px] rounded-full px-1 text-[10px] font-bold ${
                    filter === fb.key
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-300'
                  }`}>
                    {fb.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto">
            {loading && items.length === 0 ? (
              <div className="p-6 text-center">
                <div className="h-5 w-5 border-2 border-slate-300 border-t-blue-500 rounded-full animate-spin mx-auto mb-2" />
                <p className="text-xs text-slate-400">Loading activity...</p>
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="p-6 text-center">
                <FunnelIcon className="h-6 w-6 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                <p className="text-xs text-slate-500 dark:text-slate-400">No activity found</p>
              </div>
            ) : (
              filteredItems.map(item => {
                const config = typeConfig[item.type];
                const Icon = config.icon;
                return (
                  <button
                    key={`${item.type}-${item.id}`}
                    onClick={() => {
                      router.push(item.href);
                      setIsOpen(false);
                    }}
                    className="w-full text-left px-4 py-3 border-b border-slate-50 dark:border-slate-700/30 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-1.5 rounded-lg ${config.bg} shrink-0 mt-0.5`}>
                        <Icon className={`h-3.5 w-3.5 ${config.text}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-[13px] font-medium text-slate-900 dark:text-slate-100 truncate">
                            {item.title}
                          </p>
                          <span className="text-[10px] text-slate-400 whitespace-nowrap shrink-0">
                            {formatTimeAgo(item.timestamp)}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
