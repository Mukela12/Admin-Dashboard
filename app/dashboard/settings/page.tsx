'use client';

import { useState, useEffect } from 'react';
import { useToast } from '@/app/lib/hooks/useToast';
import { useConfirm } from '@/app/lib/hooks/useConfirm';
import {
  CurrencyDollarIcon,
  TruckIcon,
} from '@heroicons/react/24/outline';

interface ServiceConfig {
  id: string;
  title: string;
  icon: string;
  baseFare: number;
  perKm: number;
  perMinute: number;
  mode: string[];
}

interface PricingConfig {
  services: ServiceConfig[];
}

export default function SettingsPage() {
  const [config, setConfig] = useState<PricingConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();
  const { confirm } = useConfirm();

  useEffect(() => {
    fetchConfig();
  }, []);

  async function fetchConfig() {
    try {
      const res = await fetch('/api/settings');
      const data = await res.json();
      if (data.config) {
        setConfig(data.config);
      }
    } catch {
      showToast('Failed to load pricing config', 'error');
    } finally {
      setLoading(false);
    }
  }

  function updateService(index: number, field: keyof ServiceConfig, value: number) {
    if (!config) return;
    const updated = [...config.services];
    updated[index] = { ...updated[index], [field]: value };
    setConfig({ ...config, services: updated });
  }

  async function handleSave() {
    if (!config) return;

    const confirmed = await confirm({
      title: 'Save Pricing',
      message: 'Are you sure you want to update the pricing configuration? Changes will take effect immediately for all users.',
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
        showToast('Pricing saved successfully', 'success');
      } else {
        showToast('Failed to save pricing', 'error');
      }
    } catch {
      showToast('Failed to save pricing', 'error');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl flex items-center justify-center py-20">
        <div className="text-slate-500 dark:text-slate-400">Loading pricing configuration...</div>
      </div>
    );
  }

  if (!config || !config.services) {
    return (
      <div className="max-w-4xl">
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6">
          <p className="text-slate-500 dark:text-slate-400">No pricing configuration found in Firebase. The mobile developer needs to set up the <code className="text-sm bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded">config/pricing</code> document first.</p>
        </div>
      </div>
    );
  }

  const rideServices = config.services.filter(s => s.mode.includes('ride') || s.mode.includes('all-day'));
  const deliveryServices = config.services.filter(s => s.mode.includes('delivery'));

  const inputClass = "w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none";

  return (
    <div className="max-w-4xl space-y-6">
      {/* Ride Services */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600">
            <CurrencyDollarIcon className="h-4 w-4 text-white" />
          </div>
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-50">Ride Pricing</h2>
        </div>
        <div className="p-6 space-y-6">
          {rideServices.map((service) => {
            const globalIndex = config.services.findIndex(s => s.id === service.id);
            return (
              <div key={service.id} className="border border-slate-200 dark:border-slate-600 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">{service.title} <span className="text-xs font-normal text-slate-400">({service.id})</span></h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Base Fare (K)</label>
                    <input
                      type="number"
                      value={service.baseFare}
                      onChange={(e) => updateService(globalIndex, 'baseFare', Number(e.target.value))}
                      className={inputClass}
                      min={0}
                      step={0.5}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Per KM (K)</label>
                    <input
                      type="number"
                      value={service.perKm}
                      onChange={(e) => updateService(globalIndex, 'perKm', Number(e.target.value))}
                      className={inputClass}
                      min={0}
                      step={0.5}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Per Minute (K)</label>
                    <input
                      type="number"
                      value={service.perMinute}
                      onChange={(e) => updateService(globalIndex, 'perMinute', Number(e.target.value))}
                      className={inputClass}
                      min={0}
                      step={0.1}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Delivery Services */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600">
            <TruckIcon className="h-4 w-4 text-white" />
          </div>
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-50">Delivery Pricing</h2>
        </div>
        <div className="p-6 space-y-6">
          {deliveryServices.map((service) => {
            const globalIndex = config.services.findIndex(s => s.id === service.id);
            return (
              <div key={service.id} className="border border-slate-200 dark:border-slate-600 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">{service.title} <span className="text-xs font-normal text-slate-400">({service.id})</span></h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Base Fare (K)</label>
                    <input
                      type="number"
                      value={service.baseFare}
                      onChange={(e) => updateService(globalIndex, 'baseFare', Number(e.target.value))}
                      className={inputClass}
                      min={0}
                      step={0.5}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Per KM (K)</label>
                    <input
                      type="number"
                      value={service.perKm}
                      onChange={(e) => updateService(globalIndex, 'perKm', Number(e.target.value))}
                      className={inputClass}
                      min={0}
                      step={0.5}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Per Minute (K)</label>
                    <input
                      type="number"
                      value={service.perMinute}
                      onChange={(e) => updateService(globalIndex, 'perMinute', Number(e.target.value))}
                      className={inputClass}
                      min={0}
                      step={0.1}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Save */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2.5 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-slate-300 dark:disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors"
        >
          {saving ? 'Saving...' : 'Save Pricing'}
        </button>
      </div>
    </div>
  );
}
