'use client';
import { useState, useEffect } from 'react';
import { useToast } from '@/app/lib/hooks/useToast';
import { useConfirm } from '@/app/lib/hooks/useConfirm';
import {
  ExclamationCircleIcon,
  CheckCircleIcon,
  ClockIcon,
  XMarkIcon,
  ChatBubbleLeftIcon,
  UserIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';

interface Complaint {
  id: string;
  complainer: string;
  complaint: string;
  complaintRelation: string;
  userId: string;
  createdAt: any;
  status?: string;
  resolution?: string;
  resolvedAt?: any;
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

function formatFullTimestamp(ts: any): string {
  if (!ts) return '-';
  const ms = typeof ts === 'number' ? ts : ts?._seconds ? ts._seconds * 1000 : 0;
  if (!ms) return '-';
  return new Date(ms).toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function ComplaintsPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [resolution, setResolution] = useState('');
  const [loading, setLoading] = useState(true);
  const [resolving, setResolving] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'resolved'>('all');
  const [search, setSearch] = useState('');
  const { showToast } = useToast();
  const { confirm } = useConfirm();

  useEffect(() => {
    fetchComplaints();
  }, []);

  async function fetchComplaints() {
    try {
      const response = await fetch('/api/complaints');
      const data = await response.json();
      setComplaints(data.complaints || []);
    } catch (error) {
      showToast('Failed to load complaints', 'error');
    } finally {
      setLoading(false);
    }
  }

  async function handleResolve() {
    if (!selectedComplaint || !resolution.trim()) return;

    const confirmed = await confirm({
      title: 'Resolve Complaint',
      message: `Are you sure you want to mark this complaint from "${selectedComplaint.complainer}" as resolved?`,
      confirmText: 'Mark Resolved',
      variant: 'success',
    });
    if (!confirmed) return;

    setResolving(true);
    try {
      const response = await fetch('/api/complaints/resolve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          complaintId: selectedComplaint.id,
          resolution,
        }),
      });

      if (response.ok) {
        showToast('Complaint resolved successfully', 'success');
        setSelectedComplaint(null);
        setResolution('');
        fetchComplaints();
      } else {
        showToast('Failed to resolve complaint', 'error');
      }
    } catch (error) {
      showToast('Failed to resolve complaint', 'error');
    } finally {
      setResolving(false);
    }
  }

  const filteredComplaints = complaints.filter(c => {
    if (filter === 'resolved' && c.status !== 'resolved') return false;
    if (filter === 'pending' && c.status === 'resolved') return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        (c.complainer || '').toLowerCase().includes(q) ||
        (c.complaint || '').toLowerCase().includes(q) ||
        (c.complaintRelation || '').toLowerCase().includes(q) ||
        (c.userId || '').toLowerCase().includes(q)
      );
    }
    return true;
  });

  const stats = {
    total: complaints.length,
    pending: complaints.filter(c => c.status !== 'resolved').length,
    resolved: complaints.filter(c => c.status === 'resolved').length,
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <div className="h-8 w-56 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse" />
          <div className="h-4 w-72 bg-slate-200 dark:bg-slate-700 rounded mt-2 animate-pulse" />
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
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-slate-500 to-slate-600">
              <ExclamationCircleIcon className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Total</p>
              <p className="text-xl font-bold text-slate-900 dark:text-slate-50">{stats.total}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-amber-500 to-amber-600">
              <ClockIcon className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Pending</p>
              <p className="text-xl font-bold text-amber-600 dark:text-amber-400">{stats.pending}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600">
              <CheckCircleIcon className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Resolved</p>
              <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{stats.resolved}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search + Filters */}
      <div className="flex items-center gap-3">
        <div className="relative w-72">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, type, content..."
            className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
        </div>
        {(['all', 'pending', 'resolved'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 capitalize ${
              filter === f
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
            }`}
          >
            {f}
          </button>
        ))}
        <span className="ml-auto text-sm text-slate-500 dark:text-slate-400">
          {filteredComplaints.length} complaint{filteredComplaints.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Content - Table + Detail Panel */}
      <div className="flex gap-6">
        {/* Table */}
        <div className={`bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden transition-all duration-300 ${selectedComplaint ? 'w-1/2' : 'w-full'}`}>
          {filteredComplaints.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <ExclamationCircleIcon className="h-10 w-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">No complaints found</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Complaints will appear here when submitted</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700">
                    <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Date</th>
                    <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">From</th>
                    {!selectedComplaint && <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Type</th>}
                    <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Complaint</th>
                    <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                  {filteredComplaints.map((complaint) => {
                    const isSelected = selectedComplaint?.id === complaint.id;
                    const isPending = complaint.status !== 'resolved';
                    return (
                      <tr
                        key={complaint.id}
                        onClick={() => {
                          setSelectedComplaint(isSelected ? null : complaint);
                          setResolution('');
                        }}
                        className={`cursor-pointer transition-colors duration-150 ${
                          isSelected
                            ? 'bg-blue-50 dark:bg-blue-500/10'
                            : 'hover:bg-slate-50 dark:hover:bg-slate-700/50'
                        }`}
                      >
                        <td className="px-4 py-3.5 text-sm text-slate-700 dark:text-slate-300">
                          {formatTimestamp(complaint.createdAt)}
                        </td>
                        <td className="px-4 py-3.5 text-sm font-medium text-slate-900 dark:text-slate-100 capitalize">
                          {complaint.complainer || '-'}
                        </td>
                        {!selectedComplaint && (
                          <td className="px-4 py-3.5 text-sm text-slate-600 dark:text-slate-400">
                            {complaint.complaintRelation || '-'}
                          </td>
                        )}
                        <td className="px-4 py-3.5 text-sm text-slate-700 dark:text-slate-300 max-w-[200px] truncate">
                          {complaint.complaint || '-'}
                        </td>
                        <td className="px-4 py-3.5">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold ${
                            isPending
                              ? 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400'
                              : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400'
                          }`}>
                            {isPending ? 'Pending' : 'Resolved'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Inline Detail Panel */}
        {selectedComplaint && (
          <div className="w-1/2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
            {/* Detail Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">Complaint Details</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {formatFullTimestamp(selectedComplaint.createdAt)}
                </p>
              </div>
              <button
                onClick={() => {
                  setSelectedComplaint(null);
                  setResolution('');
                }}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                <XMarkIcon className="h-5 w-5 text-slate-500" />
              </button>
            </div>

            <div className="p-6 space-y-5 overflow-y-auto max-h-[calc(100vh-16rem)]">
              {/* Status */}
              <div className="flex items-center gap-3">
                <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold ${
                  selectedComplaint.status !== 'resolved'
                    ? 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400'
                    : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400'
                }`}>
                  {selectedComplaint.status !== 'resolved' ? 'Pending Review' : 'Resolved'}
                </span>
                <span className="text-sm text-slate-600 dark:text-slate-400">
                  {selectedComplaint.complaintRelation || '-'}
                </span>
              </div>

              {/* Complainant */}
              <div className="bg-slate-50 dark:bg-slate-700/30 rounded-lg p-4">
                <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Submitted By</p>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-500/20 rounded-lg">
                    <UserIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100 capitalize">
                      {selectedComplaint.complainer || 'Unknown'}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      ID: {selectedComplaint.userId || '-'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Complaint Text */}
              <div>
                <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Complaint</p>
                <div className="bg-slate-50 dark:bg-slate-700/30 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <ChatBubbleLeftIcon className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                    <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                      {selectedComplaint.complaint || 'No details provided.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Resolution Area */}
              {selectedComplaint.status === 'resolved' ? (
                <div>
                  <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Resolution</p>
                  <div className="bg-emerald-50 dark:bg-emerald-500/10 rounded-lg p-4 border border-emerald-200 dark:border-emerald-500/20">
                    <p className="text-sm text-emerald-800 dark:text-emerald-300 whitespace-pre-wrap">
                      {selectedComplaint.resolution || 'No resolution notes provided.'}
                    </p>
                    {selectedComplaint.resolvedAt && (
                      <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-2">
                        Resolved on {formatFullTimestamp(selectedComplaint.resolvedAt)}
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div>
                  <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Resolution Notes</p>
                  <textarea
                    className="w-full p-3 text-sm border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                    rows={4}
                    value={resolution}
                    onChange={(e) => setResolution(e.target.value)}
                    placeholder="Enter resolution notes..."
                  />
                  <button
                    onClick={handleResolve}
                    disabled={!resolution.trim() || resolving}
                    className="mt-3 w-full px-4 py-2.5 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 disabled:bg-slate-300 dark:disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors"
                  >
                    {resolving ? 'Resolving...' : 'Mark as Resolved'}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
