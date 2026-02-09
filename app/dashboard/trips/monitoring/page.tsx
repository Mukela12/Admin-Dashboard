'use client';

import { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { useToast } from '@/app/lib/hooks/useToast';
import {
  MapPinIcon,
  TruckIcon,
  ClockIcon,
  UserIcon,
  PhoneIcon,
  SignalIcon,
  ArrowPathIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

// Dynamically import the map component (Leaflet requires browser APIs)
const RideMap = dynamic(() => import('./RideMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-slate-100 dark:bg-slate-700 rounded-xl flex items-center justify-center">
      <div className="text-center">
        <MapPinIcon className="h-10 w-10 text-slate-400 mx-auto mb-2 animate-pulse" />
        <p className="text-sm text-slate-500 dark:text-slate-400">Loading map...</p>
      </div>
    </div>
  ),
});

interface ActiveRide {
  id: string;
  status: string;
  bookingType: string;
  bookingClass: string;
  origin: { latitude: number; longitude: number; address?: string } | null;
  destination: { latitude: number; longitude: number; address?: string } | null;
  passengerInfo: { fullName?: string; phoneNumber?: string } | null;
  confirmedDriver: { fullName?: string; phoneNumber?: string } | null;
  driverLocation: { latitude: number; longitude: number; heading: number; updatedAt: number } | null;
  price: number;
  distance: string;
  duration: string;
  paymentMethod: string;
  createdAt: any;
}

const statusLabels: Record<string, { label: string; color: string; bg: string }> = {
  confirmed: { label: 'Confirmed', color: 'text-blue-700 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-500/10' },
  arrived: { label: 'Driver Arrived', color: 'text-violet-700 dark:text-violet-400', bg: 'bg-violet-50 dark:bg-violet-500/10' },
  in_progress: { label: 'In Progress', color: 'text-emerald-700 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
};

function formatTimeAgo(ts: number): string {
  if (!ts) return 'Unknown';
  const seconds = Math.floor((Date.now() - ts) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  return `${Math.floor(seconds / 3600)}h ago`;
}

export default function RideMonitoringPage() {
  const [rides, setRides] = useState<ActiveRide[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRideId, setSelectedRideId] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const { showToast } = useToast();

  const fetchActiveRides = useCallback(async () => {
    try {
      const response = await fetch('/api/rides/active');
      const data = await response.json();
      if (data.rides) {
        setRides(data.rides);
        setLastUpdated(new Date());
      }
    } catch (error) {
      showToast('Failed to fetch active rides', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchActiveRides();
  }, [fetchActiveRides]);

  // Auto-refresh every 10 seconds when enabled
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(fetchActiveRides, 10000);
    return () => clearInterval(interval);
  }, [autoRefresh, fetchActiveRides]);

  const selectedRide = rides.find(r => r.id === selectedRideId);

  const stats = {
    total: rides.length,
    confirmed: rides.filter(r => r.status === 'confirmed').length,
    arrived: rides.filter(r => r.status === 'arrived').length,
    inProgress: rides.filter(r => r.status === 'in_progress').length,
    withLocation: rides.filter(r => r.driverLocation).length,
  };

  if (loading) {
    return (
      <div className="h-[calc(100vh-7rem)] flex flex-col gap-4">
        <div className="shrink-0">
          <div className="h-7 w-48 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse" />
          <div className="h-4 w-32 bg-slate-100 dark:bg-slate-800 rounded mt-2 animate-pulse" />
        </div>
        <div className="flex-1 flex gap-4 min-h-0">
          <div className="w-72 shrink-0 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700">
              <div className="h-3 w-24 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
            </div>
            <div className="p-4 space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-2">
                  <div className="h-4 w-full bg-slate-100 dark:bg-slate-700 rounded animate-pulse" />
                  <div className="h-3 w-2/3 bg-slate-100 dark:bg-slate-700 rounded animate-pulse" />
                </div>
              ))}
            </div>
          </div>
          <div className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-center">
            <div className="text-center">
              <div className="relative mx-auto mb-4 w-16 h-16">
                <div className="absolute inset-0 rounded-full border-4 border-slate-200 dark:border-slate-700" />
                <div className="absolute inset-0 rounded-full border-4 border-blue-500 border-t-transparent animate-spin" />
                <MapPinIcon className="absolute inset-3 h-10 w-10 text-blue-500" />
              </div>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Loading map</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Fetching active rides...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-10rem)] flex flex-col gap-3">
      {/* Action Bar */}
      <div className="flex items-center justify-between shrink-0">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {stats.total} active ride{stats.total !== 1 ? 's' : ''}
          {lastUpdated && <> &middot; Updated {formatTimeAgo(lastUpdated.getTime())}</>}
        </p>
        <div className="flex items-center gap-3">
          {/* Stat pills */}
          <div className="hidden md:flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
              {stats.confirmed} Confirmed
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-400">
              <span className="w-1.5 h-1.5 rounded-full bg-violet-500"></span>
              {stats.arrived} Arrived
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              {stats.inProgress} In Progress
            </span>
          </div>
          {/* Auto-refresh toggle */}
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              autoRefresh
                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400'
                : 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400'
            }`}
          >
            <SignalIcon className={`h-3.5 w-3.5 ${autoRefresh ? 'animate-pulse' : ''}`} />
            {autoRefresh ? 'Live' : 'Paused'}
          </button>
          <button
            onClick={fetchActiveRides}
            className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            <ArrowPathIcon className="h-4 w-4 text-slate-600 dark:text-slate-400" />
          </button>
        </div>
      </div>

      {/* Main Content - Map + Panel */}
      <div className="flex-1 flex gap-4 min-h-0">
        {/* Ride List Sidebar */}
        <div className={`shrink-0 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden flex flex-col transition-all duration-300 ${selectedRide ? 'w-80' : 'w-72'}`}>
          <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Active Rides ({rides.length})
            </p>
          </div>
          <div className="flex-1 overflow-y-auto">
            {rides.length === 0 ? (
              <div className="p-6 text-center">
                <TruckIcon className="h-8 w-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                <p className="text-sm text-slate-500 dark:text-slate-400">No active rides</p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Rides will appear when booked</p>
              </div>
            ) : (
              rides.map(ride => {
                const isSelected = ride.id === selectedRideId;
                const statusInfo = statusLabels[ride.status] || statusLabels.confirmed;
                return (
                  <button
                    key={ride.id}
                    onClick={() => setSelectedRideId(isSelected ? null : ride.id)}
                    className={`w-full text-left px-4 py-3 border-b border-slate-100 dark:border-slate-700/50 transition-colors ${
                      isSelected
                        ? 'bg-blue-50 dark:bg-blue-500/10'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-700/50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                        {ride.passengerInfo?.fullName || 'Unknown Passenger'}
                      </p>
                      <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold ${statusInfo.bg} ${statusInfo.color}`}>
                        {statusInfo.label}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                      {ride.confirmedDriver?.fullName || 'No driver'} &middot; K{(ride.price || 0).toFixed(0)}
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                      {ride.driverLocation ? (
                        <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                          GPS active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] text-slate-400">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                          No GPS
                        </span>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Map Area */}
        <div className="flex-1 relative min-h-0">
          <RideMap
            rides={rides}
            selectedRideId={selectedRideId}
            onSelectRide={setSelectedRideId}
          />

          {/* Selected Ride Detail Overlay - z-[1000] to stay above all Leaflet layers */}
          {selectedRide && (
            <div
              className="absolute bottom-4 left-4 right-4 z-[1000] pointer-events-none"
              onWheel={(e) => e.stopPropagation()}
            >
              <div
                className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl p-4 max-w-lg pointer-events-auto"
                onMouseDown={(e) => e.stopPropagation()}
                onTouchStart={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => setSelectedRideId(null)}
                  className="absolute top-3 right-3 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  <XMarkIcon className="h-4 w-4 text-slate-500" />
                </button>

                <div className="flex items-center gap-3 mb-3">
                  <div className={`p-2 rounded-lg ${statusLabels[selectedRide.status]?.bg || 'bg-slate-100'}`}>
                    <TruckIcon className={`h-5 w-5 ${statusLabels[selectedRide.status]?.color || 'text-slate-500'}`} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">
                      {selectedRide.confirmedDriver?.fullName || 'Unknown Driver'}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {statusLabels[selectedRide.status]?.label} &middot; {selectedRide.bookingType}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="flex items-start gap-2">
                    <UserIcon className="h-3.5 w-3.5 text-slate-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-slate-500 dark:text-slate-400">Passenger</p>
                      <p className="font-medium text-slate-900 dark:text-slate-100">
                        {selectedRide.passengerInfo?.fullName || 'Unknown'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <PhoneIcon className="h-3.5 w-3.5 text-slate-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-slate-500 dark:text-slate-400">Phone</p>
                      <p className="font-medium text-slate-900 dark:text-slate-100">
                        {selectedRide.confirmedDriver?.phoneNumber || '-'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPinIcon className="h-3.5 w-3.5 text-emerald-500 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-slate-500 dark:text-slate-400">Pickup</p>
                      <p className="font-medium text-slate-900 dark:text-slate-100 truncate max-w-[160px]">
                        {selectedRide.origin?.address || 'Unknown'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPinIcon className="h-3.5 w-3.5 text-red-500 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-slate-500 dark:text-slate-400">Destination</p>
                      <p className="font-medium text-slate-900 dark:text-slate-100 truncate max-w-[160px]">
                        {selectedRide.destination?.address || 'Unknown'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 mt-3 pt-3 border-t border-slate-200 dark:border-slate-700 text-xs">
                  <span className="font-semibold text-slate-900 dark:text-slate-100">
                    K{(selectedRide.price || 0).toFixed(2)}
                  </span>
                  <span className="text-slate-500 dark:text-slate-400">{selectedRide.distance || '-'}</span>
                  <span className="text-slate-500 dark:text-slate-400">{selectedRide.duration || '-'}</span>
                  <span className="text-slate-500 dark:text-slate-400 capitalize">
                    {(selectedRide.paymentMethod || '-').replace('_', ' ')}
                  </span>
                  {selectedRide.driverLocation && (
                    <span className="ml-auto text-emerald-600 dark:text-emerald-400">
                      GPS: {formatTimeAgo(selectedRide.driverLocation.updatedAt)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
