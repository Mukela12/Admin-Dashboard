'use client';
import { useState, useEffect } from 'react';
import { useToast } from '@/app/lib/hooks/useToast';
import {
  CurrencyDollarIcon,
  BanknotesIcon,
  ArrowPathIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';

interface Transaction {
  id: string;
  type: 'payment' | 'float';
  transactionId?: string;
  orderNumber?: string;
  driverId?: string;
  userId?: string;
  amount: number;
  floatPoints?: number;
  paymentType?: string;
  paymentStatus?: string;
  status?: string;
  description?: string;
  createdAt: any;
}

function formatTimestamp(ts: any): string {
  if (!ts) return '-';
  const ms = typeof ts === 'number' ? ts : ts?._seconds ? ts._seconds * 1000 : 0;
  if (!ms) return '-';
  return new Date(ms).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function formatDateTime(ts: any): string {
  if (!ts) return '-';
  const ms = typeof ts === 'number' ? ts : ts?._seconds ? ts._seconds * 1000 : 0;
  if (!ms) return '-';
  return new Date(ms).toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'payment' | 'float'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const { showToast } = useToast();

  useEffect(() => {
    fetchTransactions();
  }, []);

  async function fetchTransactions() {
    try {
      const response = await fetch('/api/transactions');
      const data = await response.json();
      if (data.transactions) {
        setTransactions(data.transactions);
      }
    } catch (error) {
      showToast('Failed to load transactions', 'error');
    } finally {
      setLoading(false);
    }
  }

  const filteredTransactions = transactions.filter(txn => {
    const matchesFilter = filter === 'all' || txn.type === filter;
    const matchesSearch =
      searchTerm === '' ||
      (txn.transactionId || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (txn.orderNumber || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (txn.driverId || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const totalAmount = filteredTransactions.reduce((sum, txn) => sum + (txn.amount || 0), 0);
  const totalFloat = filteredTransactions
    .filter(txn => txn.floatPoints)
    .reduce((sum, txn) => sum + (txn.floatPoints || 0), 0);

  const statCards = [
    { label: 'Total Transactions', value: filteredTransactions.length, icon: ArrowPathIcon, color: 'from-slate-500 to-slate-600' },
    { label: 'Total Amount', value: `K${(totalAmount / 100).toFixed(2)}`, icon: CurrencyDollarIcon, color: 'from-emerald-500 to-emerald-600' },
    { label: 'Total Float Points', value: totalFloat, icon: BanknotesIcon, color: 'from-blue-500 to-blue-600' },
  ];

  function getStatusStyle(txn: Transaction) {
    const status = txn.paymentStatus || txn.status || 'unknown';
    if (status === 'completed' || status === 'success') {
      return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400';
    }
    if (status === 'pending') {
      return 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400';
    }
    return 'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400';
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <div className="h-8 w-44 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse" />
          <div className="h-4 w-64 bg-slate-200 dark:bg-slate-700 rounded mt-2 animate-pulse" />
        </div>
        <div className="grid grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 bg-slate-200 dark:bg-slate-700 rounded-xl animate-pulse" />
          ))}
        </div>
        <div className="h-96 bg-slate-200 dark:bg-slate-700 rounded-xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {statCards.map((stat) => (
          <div
            key={stat.label}
            className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 transition-all duration-200 hover:shadow-md"
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg bg-gradient-to-br ${stat.color}`}>
                <stat.icon className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{stat.label}</p>
                <p className="text-xl font-bold text-slate-900 dark:text-slate-50">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Search + Filters */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by transaction ID, order number, or driver ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
        </div>
        <div className="flex gap-2">
          {(['all', 'payment', 'float'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 capitalize ${
                filter === f
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
              }`}
            >
              {f === 'payment' ? 'Payments' : f === 'float' ? 'Float' : 'All'}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Date</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Type</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Transaction ID</th>
                <th className="px-4 py-3 text-right text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Amount</th>
                <th className="px-4 py-3 text-right text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Float Points</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Method</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-16 text-center">
                    <CurrencyDollarIcon className="h-10 w-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">No transactions found</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Transactions will appear here when payments are made</p>
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((txn) => (
                  <tr key={txn.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                    <td className="px-4 py-3.5 text-sm text-slate-700 dark:text-slate-300">
                      {formatDateTime(txn.createdAt)}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold ${
                        txn.type === 'payment'
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400'
                          : 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400'
                      }`}>
                        {txn.type === 'payment' ? 'Payment' : 'Float'}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-sm font-mono text-slate-700 dark:text-slate-300">
                      {txn.transactionId || txn.orderNumber || '-'}
                    </td>
                    <td className="px-4 py-3.5 text-sm font-semibold text-slate-900 dark:text-slate-100 text-right">
                      K{((txn.amount || 0) / 100).toFixed(2)}
                    </td>
                    <td className="px-4 py-3.5 text-sm text-slate-700 dark:text-slate-300 text-right">
                      {txn.floatPoints || '-'}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold ${getStatusStyle(txn)}`}>
                        {txn.paymentStatus || txn.status || 'unknown'}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-sm text-slate-700 dark:text-slate-300 capitalize">
                      {(txn.paymentType || '-').replace('_', ' ')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
