'use client';
import { useState, useEffect } from 'react';
import {
  TruckIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  UsersIcon,
} from '@heroicons/react/24/outline';

interface Stats {
  totalTrips: number;
  currentTrips: number;
  completedTrips: number;
  totalDrivers: number;
  activeDrivers: number;
  blockedDrivers: number;
  totalUsers: number;
  totalRevenue: number;
  totalFloat: number;
  openComplaints: number;
}

export default function RealtimeStats() {
  const [stats, setStats] = useState<Stats>({
    totalTrips: 0,
    currentTrips: 0,
    completedTrips: 0,
    totalDrivers: 0,
    activeDrivers: 0,
    blockedDrivers: 0,
    totalUsers: 0,
    totalRevenue: 0,
    totalFloat: 0,
    openComplaints: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  async function fetchStats() {
    try {
      const response = await fetch('/api/stats');
      const data = await response.json();
      if (data.stats) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 overflow-hidden"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="h-12 w-12 rounded-xl bg-slate-100 dark:bg-slate-700 animate-pulse" />
            </div>
            <div className="space-y-2">
              <div className="h-3 w-20 bg-slate-100 dark:bg-slate-700 rounded animate-pulse" />
              <div className="h-8 w-16 bg-slate-100 dark:bg-slate-700 rounded animate-pulse" />
              <div className="h-3 w-24 bg-slate-50 dark:bg-slate-700/50 rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  const cards = [
    {
      title: 'Active Trips',
      value: stats.currentTrips,
      subtitle: `${stats.totalTrips} total trips`,
      icon: TruckIcon,
      iconBg: 'bg-gradient-to-br from-blue-500 to-blue-600',
    },
    {
      title: 'Drivers',
      value: stats.totalDrivers,
      subtitle: `${stats.activeDrivers} active`,
      icon: UserGroupIcon,
      iconBg: 'bg-gradient-to-br from-emerald-500 to-emerald-600',
    },
    {
      title: 'Passengers',
      value: stats.totalUsers,
      subtitle: 'Registered users',
      icon: UsersIcon,
      iconBg: 'bg-gradient-to-br from-violet-500 to-violet-600',
    },
    {
      title: 'Revenue',
      value: `K${stats.totalRevenue.toFixed(0)}`,
      subtitle: `${stats.completedTrips} completed trips`,
      icon: CurrencyDollarIcon,
      iconBg: 'bg-gradient-to-br from-amber-500 to-amber-600',
    },
  ];

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <div
          key={card.title}
          className="group relative bg-white dark:bg-slate-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-200 dark:border-slate-700 overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-transparent to-slate-50/50 dark:to-slate-900/50"></div>

          <div className="relative p-6">
            <div className="flex items-start justify-between mb-4">
              <div className={`p-3 rounded-xl ${card.iconBg} shadow-lg transition-transform duration-300 group-hover:scale-110`}>
                <card.icon className="h-6 w-6 text-white" />
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                {card.title}
              </div>
              <div className="text-3xl font-bold text-slate-900 dark:text-slate-50 tracking-tight">
                {card.value}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                {card.subtitle}
              </div>
            </div>
          </div>

          <div className={`absolute bottom-0 left-0 right-0 h-1 ${card.iconBg}`}></div>
        </div>
      ))}
    </div>
  );
}
