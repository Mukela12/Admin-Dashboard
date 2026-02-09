'use client';
import { useState, useEffect } from 'react';
import { useToast } from '@/app/lib/hooks/useToast';
import { useConfirm } from '@/app/lib/hooks/useConfirm';
import {
  UserGroupIcon,
  ShieldCheckIcon,
  NoSymbolIcon,
  ClockIcon,
  CurrencyDollarIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  StarIcon,
  PhoneIcon,
  TruckIcon,
} from '@heroicons/react/24/outline';

interface Driver {
  id: string;
  uid: string;
  fullName: string;
  phoneNumber: string;
  avatar?: string;
  isBlocked?: boolean;
  blockReason?: string;
  driverInfo: {
    verificationStatus: string;
    floatBalance: number;
    bookingClasses: string[];
    deliveryClasses: string[];
    canDrive: boolean;
    canDeliver: boolean;
  };
  vehicleInfo?: {
    make: string;
    model: string;
    plateNumber: string;
    color?: string;
  };
  ratings: {
    average: number;
    count: number;
  };
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

export default function AllDriversPage() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [floatEditMode, setFloatEditMode] = useState(false);
  const [newFloatBalance, setNewFloatBalance] = useState('');
  const [floatReason, setFloatReason] = useState('');
  const [blockReasonInput, setBlockReasonInput] = useState('');
  const [blockingDriver, setBlockingDriver] = useState<Driver | null>(null);
  const [processingAction, setProcessingAction] = useState(false);
  const { showToast } = useToast();
  const { confirm } = useConfirm();

  useEffect(() => {
    fetchDrivers();
  }, []);

  async function fetchDrivers() {
    try {
      const response = await fetch('/api/drivers/all');
      const data = await response.json();
      if (data.drivers) {
        setDrivers(data.drivers);
      }
    } catch (error) {
      showToast('Failed to load drivers', 'error');
    } finally {
      setLoading(false);
    }
  }

  async function handleBlockDriver() {
    if (!blockingDriver || !blockReasonInput.trim()) return;

    const confirmed = await confirm({
      title: 'Block Driver',
      message: `Are you sure you want to block ${blockingDriver.fullName}? They will not be able to accept rides.`,
      confirmText: 'Block',
      variant: 'danger',
    });

    if (!confirmed) return;

    setProcessingAction(true);
    try {
      const response = await fetch('/api/drivers/block', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ driverId: blockingDriver.uid, reason: blockReasonInput }),
      });

      if (response.ok) {
        showToast('Driver blocked successfully', 'success');
        setBlockingDriver(null);
        setBlockReasonInput('');
        fetchDrivers();
      } else {
        showToast('Failed to block driver', 'error');
      }
    } catch (error) {
      showToast('An error occurred', 'error');
    } finally {
      setProcessingAction(false);
    }
  }

  async function handleUnblockDriver(driver: Driver) {
    const confirmed = await confirm({
      title: 'Unblock Driver',
      message: `Are you sure you want to unblock ${driver.fullName}?`,
      confirmText: 'Unblock',
      variant: 'success',
    });

    if (!confirmed) return;

    setProcessingAction(true);
    try {
      const response = await fetch('/api/drivers/unblock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ driverId: driver.uid }),
      });

      if (response.ok) {
        showToast('Driver unblocked successfully', 'success');
        fetchDrivers();
      } else {
        showToast('Failed to unblock driver', 'error');
      }
    } catch (error) {
      showToast('An error occurred', 'error');
    } finally {
      setProcessingAction(false);
    }
  }

  async function handleUpdateFloat() {
    if (!selectedDriver || !newFloatBalance || !floatReason.trim()) {
      showToast('Please fill in all fields', 'error');
      return;
    }

    const newBalance = parseInt(newFloatBalance);
    if (isNaN(newBalance) || newBalance < 0) {
      showToast('Please enter a valid float balance', 'error');
      return;
    }

    const confirmed = await confirm({
      title: 'Update Float Balance',
      message: `Update ${selectedDriver.fullName}'s float from ${selectedDriver.driverInfo?.floatBalance || 0} to ${newBalance}?`,
      confirmText: 'Update',
      variant: 'warning',
    });

    if (!confirmed) return;

    setProcessingAction(true);
    try {
      const response = await fetch('/api/drivers/update-float', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          driverId: selectedDriver.uid,
          newBalance,
          previousBalance: selectedDriver.driverInfo?.floatBalance || 0,
          reason: floatReason,
        }),
      });

      if (response.ok) {
        showToast('Float balance updated successfully', 'success');
        setFloatEditMode(false);
        setNewFloatBalance('');
        setFloatReason('');
        fetchDrivers();
      } else {
        showToast('Failed to update float balance', 'error');
      }
    } catch (error) {
      showToast('An error occurred', 'error');
    } finally {
      setProcessingAction(false);
    }
  }

  const filteredDrivers = drivers.filter(driver =>
    (driver.fullName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (driver.phoneNumber || '').includes(searchTerm) ||
    (driver.uid || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: drivers.length,
    active: drivers.filter(d => !d.isBlocked && d.driverInfo?.verificationStatus === 'approved').length,
    blocked: drivers.filter(d => d.isBlocked).length,
    pending: drivers.filter(d => d.driverInfo?.verificationStatus === 'pending').length,
    totalFloat: drivers.reduce((sum, d) => sum + (d.driverInfo?.floatBalance || 0), 0),
  };

  const statCards = [
    { label: 'Total Drivers', value: stats.total, icon: UserGroupIcon, color: 'from-slate-500 to-slate-600' },
    { label: 'Active', value: stats.active, icon: ShieldCheckIcon, color: 'from-emerald-500 to-emerald-600' },
    { label: 'Blocked', value: stats.blocked, icon: NoSymbolIcon, color: 'from-red-500 to-red-600' },
    { label: 'Pending', value: stats.pending, icon: ClockIcon, color: 'from-amber-500 to-amber-600' },
    { label: 'Total Float', value: stats.totalFloat, icon: CurrencyDollarIcon, color: 'from-blue-500 to-blue-600' },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <div className="h-8 w-40 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse" />
          <div className="h-4 w-64 bg-slate-200 dark:bg-slate-700 rounded mt-2 animate-pulse" />
        </div>
        <div className="grid grid-cols-5 gap-4">
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

      {/* Block Reason Input - Inline */}
      {blockingDriver && (
        <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-red-800 dark:text-red-300">
              Block {blockingDriver.fullName}
            </p>
            <button
              onClick={() => {
                setBlockingDriver(null);
                setBlockReasonInput('');
              }}
              className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors"
            >
              <XMarkIcon className="h-4 w-4 text-red-500" />
            </button>
          </div>
          <textarea
            className="w-full p-3 text-sm border border-red-200 dark:border-red-500/30 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none resize-none"
            rows={2}
            value={blockReasonInput}
            onChange={(e) => setBlockReasonInput(e.target.value)}
            placeholder="Enter reason for blocking this driver..."
          />
          <div className="flex gap-2 mt-3">
            <button
              onClick={() => {
                setBlockingDriver(null);
                setBlockReasonInput('');
              }}
              className="px-4 py-2 text-sm font-medium border border-slate-200 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleBlockDriver}
              disabled={!blockReasonInput.trim() || processingAction}
              className="px-4 py-2 text-sm font-medium bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-slate-300 dark:disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors"
            >
              {processingAction ? 'Blocking...' : 'Confirm Block'}
            </button>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search by name, phone, or driver ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
        />
      </div>

      {/* Content - Table + Detail */}
      <div className="flex gap-6">
        {/* Table */}
        <div className={`bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden transition-all duration-300 ${selectedDriver ? 'w-3/5' : 'w-full'}`}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Driver</th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Vehicle</th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Float</th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Rating</th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-right text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                {filteredDrivers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-16 text-center">
                      <UserGroupIcon className="h-10 w-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                      <p className="text-sm font-medium text-slate-500 dark:text-slate-400">No drivers found</p>
                    </td>
                  </tr>
                ) : (
                  filteredDrivers.map((driver) => {
                    const isSelected = selectedDriver?.id === driver.id;
                    const verificationStatus = driver.driverInfo?.verificationStatus || 'pending';
                    return (
                      <tr
                        key={driver.id}
                        onClick={() => {
                          setSelectedDriver(isSelected ? null : driver);
                          setFloatEditMode(false);
                          setNewFloatBalance('');
                          setFloatReason('');
                        }}
                        className={`cursor-pointer transition-colors duration-150 ${
                          isSelected
                            ? 'bg-blue-50 dark:bg-blue-500/10'
                            : 'hover:bg-slate-50 dark:hover:bg-slate-700/50'
                        }`}
                      >
                        <td className="px-4 py-3.5">
                          <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{driver.fullName || 'Unknown'}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{driver.phoneNumber || '-'}</p>
                        </td>
                        <td className="px-4 py-3.5">
                          {driver.vehicleInfo ? (
                            <>
                              <p className="text-sm text-slate-900 dark:text-slate-100">
                                {driver.vehicleInfo.make} {driver.vehicleInfo.model}
                              </p>
                              <p className="text-xs text-slate-500 dark:text-slate-400">{driver.vehicleInfo.plateNumber || '-'}</p>
                            </>
                          ) : (
                            <span className="text-sm text-slate-400 dark:text-slate-500">No vehicle</span>
                          )}
                        </td>
                        <td className="px-4 py-3.5 text-sm font-semibold text-slate-900 dark:text-slate-100">
                          {driver.driverInfo?.floatBalance ?? 0}
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-1">
                            <StarIcon className="h-3.5 w-3.5 text-amber-500" />
                            <span className="text-sm text-slate-900 dark:text-slate-100">
                              {(driver.ratings?.average || 0).toFixed(1)}
                            </span>
                            <span className="text-xs text-slate-500 dark:text-slate-400">
                              ({driver.ratings?.count || 0})
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          {driver.isBlocked ? (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400">
                              Blocked
                            </span>
                          ) : verificationStatus === 'approved' ? (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 capitalize">
                              {verificationStatus}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                            {driver.isBlocked ? (
                              <button
                                onClick={() => handleUnblockDriver(driver)}
                                disabled={processingAction}
                                className="px-3 py-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 rounded-md hover:bg-emerald-100 dark:hover:bg-emerald-500/20 transition-colors"
                              >
                                Unblock
                              </button>
                            ) : (
                              <button
                                onClick={() => {
                                  setBlockingDriver(driver);
                                  setBlockReasonInput('');
                                }}
                                className="px-3 py-1.5 text-xs font-medium text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-500/10 rounded-md hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors"
                              >
                                Block
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Detail Panel */}
        {selectedDriver && (
          <div className="w-2/5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
                  {selectedDriver.fullName || 'Unknown'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Joined {formatTimestamp(selectedDriver.createdAt)}
                </p>
              </div>
              <button
                onClick={() => {
                  setSelectedDriver(null);
                  setFloatEditMode(false);
                }}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                <XMarkIcon className="h-5 w-5 text-slate-500" />
              </button>
            </div>

            <div className="p-6 space-y-5 overflow-y-auto max-h-[calc(100vh-16rem)]">
              {/* Contact */}
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-500/20 rounded-lg">
                  <PhoneIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Phone</p>
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{selectedDriver.phoneNumber || '-'}</p>
                </div>
              </div>

              {/* Vehicle */}
              {selectedDriver.vehicleInfo && (
                <div className="bg-slate-50 dark:bg-slate-700/30 rounded-lg p-4">
                  <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Vehicle</p>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-200 dark:bg-slate-600 rounded-lg">
                      <TruckIcon className="h-4 w-4 text-slate-600 dark:text-slate-300" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                        {selectedDriver.vehicleInfo.make} {selectedDriver.vehicleInfo.model}
                        {selectedDriver.vehicleInfo.color ? ` (${selectedDriver.vehicleInfo.color})` : ''}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Plate: {selectedDriver.vehicleInfo.plateNumber || '-'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Rating */}
              <div className="flex items-center justify-between py-3 border-t border-b border-slate-200 dark:border-slate-700">
                <span className="text-sm text-slate-500 dark:text-slate-400">Rating</span>
                <div className="flex items-center gap-1.5">
                  <StarIcon className="h-4 w-4 text-amber-500" />
                  <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {(selectedDriver.ratings?.average || 0).toFixed(1)}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    ({selectedDriver.ratings?.count || 0} reviews)
                  </span>
                </div>
              </div>

              {/* Services */}
              <div>
                <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Services</p>
                <div className="flex flex-wrap gap-2">
                  {selectedDriver.driverInfo?.canDrive && (
                    <span className="px-2.5 py-1 text-xs font-medium bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 rounded-md">
                      Rides
                    </span>
                  )}
                  {selectedDriver.driverInfo?.canDeliver && (
                    <span className="px-2.5 py-1 text-xs font-medium bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-400 rounded-md">
                      Delivery
                    </span>
                  )}
                  {selectedDriver.driverInfo?.bookingClasses?.map((cls: string) => (
                    <span key={cls} className="px-2.5 py-1 text-xs font-medium bg-slate-100 text-slate-700 dark:bg-slate-600 dark:text-slate-300 rounded-md">
                      {cls}
                    </span>
                  ))}
                </div>
              </div>

              {/* Float Balance */}
              <div className="bg-slate-50 dark:bg-slate-700/30 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Float Balance</p>
                  {!floatEditMode && (
                    <button
                      onClick={() => {
                        setFloatEditMode(true);
                        setNewFloatBalance((selectedDriver.driverInfo?.floatBalance || 0).toString());
                      }}
                      className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                    >
                      Edit
                    </button>
                  )}
                </div>

                {floatEditMode ? (
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-slate-500 dark:text-slate-400">Current: {selectedDriver.driverInfo?.floatBalance ?? 0}</label>
                      <input
                        type="number"
                        value={newFloatBalance}
                        onChange={(e) => setNewFloatBalance(e.target.value)}
                        className="w-full mt-1 px-3 py-2 text-sm border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        min="0"
                        placeholder="New balance"
                      />
                    </div>
                    <div>
                      <textarea
                        value={floatReason}
                        onChange={(e) => setFloatReason(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                        rows={2}
                        placeholder="Reason for adjustment..."
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setFloatEditMode(false);
                          setNewFloatBalance('');
                          setFloatReason('');
                        }}
                        className="flex-1 px-3 py-2 text-xs font-medium border border-slate-200 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleUpdateFloat}
                        disabled={!newFloatBalance || !floatReason.trim() || processingAction}
                        className="flex-1 px-3 py-2 text-xs font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-slate-300 dark:disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors"
                      >
                        {processingAction ? 'Updating...' : 'Update'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-2xl font-bold text-slate-900 dark:text-slate-50">
                    {selectedDriver.driverInfo?.floatBalance ?? 0}
                  </p>
                )}
              </div>

              {/* Block reason if blocked */}
              {selectedDriver.isBlocked && selectedDriver.blockReason && (
                <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-lg p-4">
                  <p className="text-[11px] font-semibold text-red-600 dark:text-red-400 uppercase tracking-wider mb-1">Block Reason</p>
                  <p className="text-sm text-red-800 dark:text-red-300">{selectedDriver.blockReason}</p>
                </div>
              )}

              {/* Driver ID */}
              <div className="flex items-center justify-between py-3 border-t border-slate-200 dark:border-slate-700">
                <span className="text-xs text-slate-500 dark:text-slate-400">Driver ID</span>
                <span className="text-xs font-mono text-slate-700 dark:text-slate-300">{selectedDriver.uid}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
