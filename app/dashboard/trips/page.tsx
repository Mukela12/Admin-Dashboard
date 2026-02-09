'use client';
import { useState, useEffect } from 'react';
import { useToast } from '@/app/lib/hooks/useToast';
import { useConfirm } from '@/app/lib/hooks/useConfirm';
import {
  TruckIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  CurrencyDollarIcon,
  MapPinIcon,
  ChevronRightIcon,
  XMarkIcon,
  UserIcon,
  PhoneIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';

interface Booking {
  id: string;
  bookingType: string;
  bookingClass: string;
  status: string;
  passengerInfo?: {
    fullName?: string;
    phoneNumber?: string;
  };
  confirmedDriver?: {
    fullName?: string;
    phoneNumber?: string;
  };
  origin?: {
    address?: string;
  };
  destination?: {
    address?: string;
  };
  price: number;
  paymentMethod: string;
  distance: string;
  duration: string;
  createdAt: any;
  updatedAt?: any;
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

const statusConfig: Record<string, { label: string; bg: string; text: string; darkBg: string; darkText: string }> = {
  completed: { label: 'Completed', bg: 'bg-emerald-50', text: 'text-emerald-700', darkBg: 'dark:bg-emerald-500/10', darkText: 'dark:text-emerald-400' },
  in_progress: { label: 'In Progress', bg: 'bg-blue-50', text: 'text-blue-700', darkBg: 'dark:bg-blue-500/10', darkText: 'dark:text-blue-400' },
  confirmed: { label: 'Confirmed', bg: 'bg-amber-50', text: 'text-amber-700', darkBg: 'dark:bg-amber-500/10', darkText: 'dark:text-amber-400' },
  arrived: { label: 'Arrived', bg: 'bg-violet-50', text: 'text-violet-700', darkBg: 'dark:bg-violet-500/10', darkText: 'dark:text-violet-400' },
  cancelled: { label: 'Cancelled', bg: 'bg-red-50', text: 'text-red-700', darkBg: 'dark:bg-red-500/10', darkText: 'dark:text-red-400' },
  pending: { label: 'Pending', bg: 'bg-slate-50', text: 'text-slate-700', darkBg: 'dark:bg-slate-500/10', darkText: 'dark:text-slate-400' },
};

function StatusBadge({ status }: { status: string }) {
  const config = statusConfig[status] || statusConfig.pending;
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold ${config.bg} ${config.text} ${config.darkBg} ${config.darkText}`}>
      {config.label}
    </span>
  );
}

export default function TripsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'current' | 'completed' | 'cancelled'>('all');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [search, setSearch] = useState('');
  const { showToast } = useToast();
  const { confirm } = useConfirm();
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    fetchBookings();
    const interval = setInterval(fetchBookings, 30000);
    return () => clearInterval(interval);
  }, []);

  async function fetchBookings() {
    try {
      const response = await fetch('/api/bookings');
      const data = await response.json();
      if (data.bookings) {
        setBookings(data.bookings);
      }
    } catch (error) {
      showToast('Failed to load bookings', 'error');
    } finally {
      setLoading(false);
    }
  }

  const filteredBookings = bookings.filter(booking => {
    if (filter === 'current' && !['confirmed', 'arrived', 'in_progress'].includes(booking.status)) return false;
    if (filter === 'completed' && booking.status !== 'completed') return false;
    if (filter === 'cancelled' && booking.status !== 'cancelled') return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        (booking.passengerInfo?.fullName || '').toLowerCase().includes(q) ||
        (booking.passengerInfo?.phoneNumber || '').toLowerCase().includes(q) ||
        (booking.confirmedDriver?.fullName || '').toLowerCase().includes(q) ||
        (booking.confirmedDriver?.phoneNumber || '').toLowerCase().includes(q) ||
        booking.id.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const stats = {
    total: bookings.length,
    current: bookings.filter(b => ['confirmed', 'arrived', 'in_progress'].includes(b.status)).length,
    completed: bookings.filter(b => b.status === 'completed').length,
    cancelled: bookings.filter(b => b.status === 'cancelled').length,
    totalRevenue: bookings
      .filter(b => b.status === 'completed')
      .reduce((sum, b) => sum + (b.price || 0), 0),
  };

  const statCards = [
    { label: 'Total Trips', value: stats.total, icon: TruckIcon, color: 'from-slate-500 to-slate-600' },
    { label: 'Active', value: stats.current, icon: ClockIcon, color: 'from-blue-500 to-blue-600' },
    { label: 'Completed', value: stats.completed, icon: CheckCircleIcon, color: 'from-emerald-500 to-emerald-600' },
    { label: 'Cancelled', value: stats.cancelled, icon: XCircleIcon, color: 'from-red-500 to-red-600' },
    { label: 'Revenue', value: `K${stats.totalRevenue.toFixed(2)}`, icon: CurrencyDollarIcon, color: 'from-amber-500 to-amber-600' },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <div className="h-8 w-48 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse" />
          <div className="h-4 w-72 bg-slate-200 dark:bg-slate-700 rounded mt-2 animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
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
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
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
      <div className="flex items-center gap-3">
        <div className="relative w-72">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by passenger, driver, ID..."
            className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
        </div>
        {(['all', 'current', 'completed', 'cancelled'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 capitalize ${
              filter === f
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
            }`}
          >
            {f === 'current' ? 'Active' : f}
          </button>
        ))}
        <span className="ml-auto text-sm text-slate-500 dark:text-slate-400">
          {filteredBookings.length} trip{filteredBookings.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Content Area - Table + Inline Detail */}
      <div className="flex gap-6">
        {/* Table */}
        <div className={`bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden transition-all duration-300 ${selectedBooking ? 'w-1/2' : 'w-full'}`}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Date</th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Passenger</th>
                  {!selectedBooking && <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Driver</th>}
                  <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Price</th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-right text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                {filteredBookings.length === 0 ? (
                  <tr>
                    <td colSpan={selectedBooking ? 5 : 6} className="px-4 py-16 text-center">
                      <TruckIcon className="h-10 w-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                      <p className="text-sm font-medium text-slate-500 dark:text-slate-400">No trips found</p>
                      <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Trips will appear here when bookings are made</p>
                    </td>
                  </tr>
                ) : (
                  filteredBookings.map((booking) => {
                    const isSelected = selectedBooking?.id === booking.id;
                    return (
                      <tr
                        key={booking.id}
                        onClick={() => setSelectedBooking(isSelected ? null : booking)}
                        className={`cursor-pointer transition-colors duration-150 ${
                          isSelected
                            ? 'bg-blue-50 dark:bg-blue-500/10'
                            : 'hover:bg-slate-50 dark:hover:bg-slate-700/50'
                        }`}
                      >
                        <td className="px-4 py-3.5 text-sm text-slate-700 dark:text-slate-300">
                          {formatTimestamp(booking.createdAt)}
                        </td>
                        <td className="px-4 py-3.5">
                          <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                            {booking.passengerInfo?.fullName || 'Unknown'}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {booking.passengerInfo?.phoneNumber || '-'}
                          </p>
                        </td>
                        {!selectedBooking && (
                          <td className="px-4 py-3.5">
                            {booking.confirmedDriver ? (
                              <>
                                <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                                  {booking.confirmedDriver.fullName || 'Unknown'}
                                </p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                  {booking.confirmedDriver.phoneNumber || '-'}
                                </p>
                              </>
                            ) : (
                              <span className="text-sm text-slate-400 dark:text-slate-500">Unassigned</span>
                            )}
                          </td>
                        )}
                        <td className="px-4 py-3.5 text-sm font-semibold text-slate-900 dark:text-slate-100">
                          K{(booking.price || 0).toFixed(2)}
                        </td>
                        <td className="px-4 py-3.5">
                          <StatusBadge status={booking.status || 'pending'} />
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <ChevronRightIcon className={`h-4 w-4 text-slate-400 inline-block transition-transform duration-200 ${isSelected ? 'rotate-90' : ''}`} />
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Inline Detail Panel */}
        {selectedBooking && (
          <div className="w-1/2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
            {/* Detail Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">Trip Details</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {formatFullTimestamp(selectedBooking.createdAt)}
                </p>
              </div>
              <button
                onClick={() => setSelectedBooking(null)}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                <XMarkIcon className="h-5 w-5 text-slate-500" />
              </button>
            </div>

            <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(100vh-16rem)]">
              {/* Status + Type */}
              <div className="flex items-center gap-3">
                <StatusBadge status={selectedBooking.status || 'pending'} />
                <span className="text-sm text-slate-600 dark:text-slate-400 capitalize">
                  {selectedBooking.bookingType || '-'} -- {selectedBooking.bookingClass || '-'}
                </span>
              </div>

              {/* Passenger */}
              <div className="bg-slate-50 dark:bg-slate-700/30 rounded-lg p-4">
                <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Passenger</p>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-500/20 rounded-lg">
                    <UserIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                      {selectedBooking.passengerInfo?.fullName || 'Unknown'}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      <PhoneIcon className="h-3 w-3" />
                      {selectedBooking.passengerInfo?.phoneNumber || '-'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Driver */}
              <div className="bg-slate-50 dark:bg-slate-700/30 rounded-lg p-4">
                <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Driver</p>
                {selectedBooking.confirmedDriver ? (
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-100 dark:bg-emerald-500/20 rounded-lg">
                      <UserIcon className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                        {selectedBooking.confirmedDriver.fullName || 'Unknown'}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        <PhoneIcon className="h-3 w-3" />
                        {selectedBooking.confirmedDriver.phoneNumber || '-'}
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-slate-400 dark:text-slate-500">No driver assigned yet</p>
                )}
              </div>

              {/* Route */}
              <div>
                <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Route</p>
                <div className="space-y-2">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 p-1 bg-emerald-100 dark:bg-emerald-500/20 rounded">
                      <MapPinIcon className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 uppercase">Pickup</p>
                      <p className="text-sm text-slate-900 dark:text-slate-100">
                        {selectedBooking.origin?.address || 'Unknown'}
                      </p>
                    </div>
                  </div>
                  <div className="ml-3 border-l-2 border-dashed border-slate-200 dark:border-slate-600 h-4" />
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 p-1 bg-red-100 dark:bg-red-500/20 rounded">
                      <MapPinIcon className="h-3.5 w-3.5 text-red-600 dark:text-red-400" />
                    </div>
                    <div>
                      <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 uppercase">Destination</p>
                      <p className="text-sm text-slate-900 dark:text-slate-100">
                        {selectedBooking.destination?.address || 'Unknown'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Trip Metrics */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-slate-50 dark:bg-slate-700/30 rounded-lg p-3 text-center">
                  <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase">Price</p>
                  <p className="text-lg font-bold text-slate-900 dark:text-slate-50 mt-0.5">
                    K{(selectedBooking.price || 0).toFixed(2)}
                  </p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-700/30 rounded-lg p-3 text-center">
                  <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase">Distance</p>
                  <p className="text-lg font-bold text-slate-900 dark:text-slate-50 mt-0.5">
                    {selectedBooking.distance || '-'}
                  </p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-700/30 rounded-lg p-3 text-center">
                  <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase">Duration</p>
                  <p className="text-lg font-bold text-slate-900 dark:text-slate-50 mt-0.5">
                    {selectedBooking.duration || '-'}
                  </p>
                </div>
              </div>

              {/* Payment */}
              <div className="flex items-center justify-between py-3 border-t border-slate-200 dark:border-slate-700">
                <span className="text-sm text-slate-500 dark:text-slate-400">Payment Method</span>
                <span className="text-sm font-medium text-slate-900 dark:text-slate-100 capitalize">
                  {(selectedBooking.paymentMethod || '-').replace('_', ' ')}
                </span>
              </div>

              {/* Admin Actions */}
              {!['completed', 'cancelled'].includes(selectedBooking.status || '') && (
                <div className="pt-3 border-t border-slate-200 dark:border-slate-700">
                  <button
                    onClick={async () => {
                      const confirmed = await confirm({
                        title: 'Cancel Trip',
                        message: `Cancel trip for ${selectedBooking.passengerInfo?.fullName || 'this passenger'}? This action cannot be undone.`,
                        confirmText: 'Cancel Trip',
                        variant: 'danger',
                      });
                      if (!confirmed) return;
                      setCancelling(true);
                      try {
                        const res = await fetch('/api/bookings/cancel', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ bookingId: selectedBooking.id, reason: 'Cancelled by admin' }),
                        });
                        if (res.ok) {
                          showToast('Trip cancelled', 'success');
                          setSelectedBooking(null);
                          fetchBookings();
                        } else {
                          const data = await res.json();
                          showToast(data.error || 'Failed to cancel trip', 'error');
                        }
                      } catch {
                        showToast('Failed to cancel trip', 'error');
                      } finally {
                        setCancelling(false);
                      }
                    }}
                    disabled={cancelling}
                    className="w-full px-4 py-2.5 text-sm font-medium bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-slate-300 dark:disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors"
                  >
                    {cancelling ? 'Cancelling...' : 'Cancel Trip'}
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
