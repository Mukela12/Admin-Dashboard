'use client';

import { useState, useEffect } from 'react';
import { useToast } from '@/app/lib/hooks/useToast';
import { useConfirm } from '@/app/lib/hooks/useConfirm';
import {
  CogIcon,
  CurrencyDollarIcon,
  TruckIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';

interface PlatformConfig {
  commissionRate: number;
  minFare: number;
  baseFare: number;
  perKmRate: number;
  perMinRate: number;
  cancellationFee: number;
  bookingClasses: string[];
  deliveryClasses: string[];
  maxActiveRidesPerDriver: number;
  driverApprovalRequired: boolean;
}

const defaultConfig: PlatformConfig = {
  commissionRate: 15,
  minFare: 1500,
  baseFare: 500,
  perKmRate: 300,
  perMinRate: 50,
  cancellationFee: 500,
  bookingClasses: ['bantu-economy', 'bantu-premium', 'bantu-xl'],
  deliveryClasses: ['bantu-regular', 'bantu-express'],
  maxActiveRidesPerDriver: 1,
  driverApprovalRequired: true,
};

export default function SettingsPage() {
  const [config, setConfig] = useState<PlatformConfig>(defaultConfig);
  const [saving, setSaving] = useState(false);
  const [newBookingClass, setNewBookingClass] = useState('');
  const [newDeliveryClass, setNewDeliveryClass] = useState('');
  const { showToast } = useToast();
  const { confirm } = useConfirm();

  useEffect(() => {
    fetchConfig();
  }, []);

  async function fetchConfig() {
    try {
      const res = await fetch('/api/settings');
      const data = await res.json();
      if (data.config) setConfig({ ...defaultConfig, ...data.config });
    } catch {
      // Use defaults
    }
  }

  async function handleSave() {
    const confirmed = await confirm({
      title: 'Save Settings',
      message: 'Are you sure you want to update the platform settings? Changes will take effect immediately.',
      confirmText: 'Save Changes',
      variant: 'success',
    });
    if (!confirmed) return;

    setSaving(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config }),
      });
      if (res.ok) {
        showToast('Settings saved successfully', 'success');
      } else {
        showToast('Failed to save settings', 'error');
      }
    } catch {
      showToast('Failed to save settings', 'error');
    } finally {
      setSaving(false);
    }
  }

  function addBookingClass() {
    const cls = newBookingClass.trim().toLowerCase().replace(/\s+/g, '-');
    if (cls && !config.bookingClasses.includes(cls)) {
      setConfig({ ...config, bookingClasses: [...config.bookingClasses, cls] });
      setNewBookingClass('');
    }
  }

  function addDeliveryClass() {
    const cls = newDeliveryClass.trim().toLowerCase().replace(/\s+/g, '-');
    if (cls && !config.deliveryClasses.includes(cls)) {
      setConfig({ ...config, deliveryClasses: [...config.deliveryClasses, cls] });
      setNewDeliveryClass('');
    }
  }

  return (
    <div className="max-w-4xl space-y-6">
      {/* Pricing */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-amber-500 to-amber-600">
            <CurrencyDollarIcon className="h-4 w-4 text-white" />
          </div>
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-50">Pricing Configuration</h2>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Commission Rate (%)</label>
            <input
              type="number"
              value={config.commissionRate}
              onChange={(e) => setConfig({ ...config, commissionRate: Number(e.target.value) })}
              className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              min={0}
              max={100}
            />
            <p className="text-[11px] text-slate-400 mt-1">Platform commission on each completed ride</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Minimum Fare (ZMW)</label>
            <input
              type="number"
              value={config.minFare}
              onChange={(e) => setConfig({ ...config, minFare: Number(e.target.value) })}
              className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              min={0}
            />
            <p className="text-[11px] text-slate-400 mt-1">K{config.minFare.toFixed(2)} minimum charge</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Base Fare (ZMW)</label>
            <input
              type="number"
              value={config.baseFare}
              onChange={(e) => setConfig({ ...config, baseFare: Number(e.target.value) })}
              className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              min={0}
            />
            <p className="text-[11px] text-slate-400 mt-1">K{config.baseFare.toFixed(2)} starting fee</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Per KM Rate (ZMW)</label>
            <input
              type="number"
              value={config.perKmRate}
              onChange={(e) => setConfig({ ...config, perKmRate: Number(e.target.value) })}
              className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              min={0}
            />
            <p className="text-[11px] text-slate-400 mt-1">K{config.perKmRate.toFixed(2)} per kilometer</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Per Minute Rate (ZMW)</label>
            <input
              type="number"
              value={config.perMinRate}
              onChange={(e) => setConfig({ ...config, perMinRate: Number(e.target.value) })}
              className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              min={0}
            />
            <p className="text-[11px] text-slate-400 mt-1">K{config.perMinRate.toFixed(2)} per minute</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Cancellation Fee (ZMW)</label>
            <input
              type="number"
              value={config.cancellationFee}
              onChange={(e) => setConfig({ ...config, cancellationFee: Number(e.target.value) })}
              className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              min={0}
            />
            <p className="text-[11px] text-slate-400 mt-1">K{config.cancellationFee.toFixed(2)} charged on cancel</p>
          </div>
        </div>
      </div>

      {/* Service Classes */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600">
            <TruckIcon className="h-4 w-4 text-white" />
          </div>
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-50">Service Classes</h2>
        </div>
        <div className="p-6 space-y-6">
          {/* Booking Classes */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Booking Classes</label>
            <div className="flex flex-wrap gap-2 mb-3">
              {config.bookingClasses.map((cls) => (
                <span
                  key={cls}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 text-sm font-medium"
                >
                  {cls}
                  <button
                    onClick={() => setConfig({ ...config, bookingClasses: config.bookingClasses.filter(c => c !== cls) })}
                    className="hover:text-red-500 transition-colors"
                  >
                    &times;
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newBookingClass}
                onChange={(e) => setNewBookingClass(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addBookingClass())}
                placeholder="Add booking class..."
                className="flex-1 px-3 py-2 text-sm border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
              <button onClick={addBookingClass} className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Add
              </button>
            </div>
          </div>

          {/* Delivery Classes */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Delivery Classes</label>
            <div className="flex flex-wrap gap-2 mb-3">
              {config.deliveryClasses.map((cls) => (
                <span
                  key={cls}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-sm font-medium"
                >
                  {cls}
                  <button
                    onClick={() => setConfig({ ...config, deliveryClasses: config.deliveryClasses.filter(c => c !== cls) })}
                    className="hover:text-red-500 transition-colors"
                  >
                    &times;
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newDeliveryClass}
                onChange={(e) => setNewDeliveryClass(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addDeliveryClass())}
                placeholder="Add delivery class..."
                className="flex-1 px-3 py-2 text-sm border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
              <button onClick={addDeliveryClass} className="px-4 py-2 text-sm font-medium bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors">
                Add
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Platform Rules */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-violet-500 to-violet-600">
            <ShieldCheckIcon className="h-4 w-4 text-white" />
          </div>
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-50">Platform Rules</h2>
        </div>
        <div className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Max Active Rides per Driver</label>
            <input
              type="number"
              value={config.maxActiveRidesPerDriver}
              onChange={(e) => setConfig({ ...config, maxActiveRidesPerDriver: Number(e.target.value) })}
              className="w-48 px-3 py-2 text-sm border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              min={1}
              max={5}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Driver Approval Required</p>
              <p className="text-[11px] text-slate-400 mt-0.5">New drivers must be approved before accepting rides</p>
            </div>
            <button
              onClick={() => setConfig({ ...config, driverApprovalRequired: !config.driverApprovalRequired })}
              className={`relative w-11 h-6 rounded-full transition-colors ${
                config.driverApprovalRequired ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-600'
              }`}
            >
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                config.driverApprovalRequired ? 'translate-x-5' : ''
              }`} />
            </button>
          </div>
        </div>
      </div>

      {/* Save */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2.5 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-slate-300 dark:disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors"
        >
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </div>
  );
}
