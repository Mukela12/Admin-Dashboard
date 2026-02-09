'use client';
import { useState, useEffect } from 'react';
import { useToast } from '@/app/lib/hooks/useToast';
import { useConfirm } from '@/app/lib/hooks/useConfirm';
import {
  UsersIcon,
  CheckCircleIcon,
  BellIcon,
  MagnifyingGlassIcon,
  PhoneIcon,
  UserIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

interface User {
  id: string;
  uid: string;
  fullName: string;
  phoneNumber: string;
  avatar?: string;
  gender?: string;
  role: string;
  profileComplete: boolean;
  notificationsEnabled?: boolean;
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

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const { showToast } = useToast();
  const { confirm } = useConfirm();
  const [togglingUser, setTogglingUser] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    try {
      const response = await fetch('/api/users/all');
      const data = await response.json();
      if (data.users) {
        setUsers(data.users);
      }
    } catch (error) {
      showToast('Failed to load users', 'error');
    } finally {
      setLoading(false);
    }
  }

  const filteredUsers = users.filter(user =>
    (user.fullName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.phoneNumber || '').includes(searchTerm) ||
    (user.uid || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: users.length,
    withProfiles: users.filter(u => u.profileComplete).length,
    withNotifications: users.filter(u => u.notificationsEnabled).length,
  };

  const statCards = [
    { label: 'Total Users', value: stats.total, icon: UsersIcon, color: 'from-slate-500 to-slate-600' },
    { label: 'Complete Profiles', value: stats.withProfiles, icon: CheckCircleIcon, color: 'from-emerald-500 to-emerald-600' },
    { label: 'Notifications On', value: stats.withNotifications, icon: BellIcon, color: 'from-blue-500 to-blue-600' },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <div className="h-8 w-36 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse" />
          <div className="h-4 w-56 bg-slate-200 dark:bg-slate-700 rounded mt-2 animate-pulse" />
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

      {/* Search */}
      <div className="relative">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search by name, phone, or user ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
        />
      </div>

      {/* Content - Table + Detail */}
      <div className="flex gap-6">
        {/* Table */}
        <div className={`bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden transition-all duration-300 ${selectedUser ? 'w-3/5' : 'w-full'}`}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">User</th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Phone</th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Gender</th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Profile</th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Notifications</th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-16 text-center">
                      <UsersIcon className="h-10 w-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                      <p className="text-sm font-medium text-slate-500 dark:text-slate-400">No users found</p>
                      <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Users will appear here when they register</p>
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => {
                    const isSelected = selectedUser?.id === user.id;
                    return (
                      <tr
                        key={user.id}
                        onClick={() => setSelectedUser(isSelected ? null : user)}
                        className={`cursor-pointer transition-colors duration-150 ${
                          isSelected
                            ? 'bg-blue-50 dark:bg-blue-500/10'
                            : 'hover:bg-slate-50 dark:hover:bg-slate-700/50'
                        }`}
                      >
                        <td className="px-4 py-3.5">
                          <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{user.fullName || 'Unknown'}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">{(user.uid || '').slice(0, 12)}...</p>
                        </td>
                        <td className="px-4 py-3.5 text-sm text-slate-700 dark:text-slate-300">
                          {user.phoneNumber || '-'}
                        </td>
                        <td className="px-4 py-3.5 text-sm text-slate-700 dark:text-slate-300 capitalize">
                          {user.gender || '-'}
                        </td>
                        <td className="px-4 py-3.5">
                          {user.profileComplete ? (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                              Complete
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400">
                              Incomplete
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3.5">
                          {user.notificationsEnabled ? (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400">
                              Enabled
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400">
                              Disabled
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3.5 text-sm text-slate-700 dark:text-slate-300">
                          {formatTimestamp(user.createdAt)}
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
        {selectedUser && (
          <div className="w-2/5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
                  {selectedUser.fullName || 'Unknown'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Joined {formatTimestamp(selectedUser.createdAt)}
                </p>
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                <XMarkIcon className="h-5 w-5 text-slate-500" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Contact */}
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-500/20 rounded-lg">
                  <PhoneIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Phone</p>
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{selectedUser.phoneNumber || '-'}</p>
                </div>
              </div>

              {/* Details Grid */}
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2.5 border-b border-slate-100 dark:border-slate-700/50">
                  <span className="text-sm text-slate-500 dark:text-slate-400">Gender</span>
                  <span className="text-sm font-medium text-slate-900 dark:text-slate-100 capitalize">{selectedUser.gender || '-'}</span>
                </div>
                <div className="flex items-center justify-between py-2.5 border-b border-slate-100 dark:border-slate-700/50">
                  <span className="text-sm text-slate-500 dark:text-slate-400">Role</span>
                  <span className="text-sm font-medium text-slate-900 dark:text-slate-100 capitalize">{selectedUser.role || 'user'}</span>
                </div>
                <div className="flex items-center justify-between py-2.5 border-b border-slate-100 dark:border-slate-700/50">
                  <span className="text-sm text-slate-500 dark:text-slate-400">Profile</span>
                  {selectedUser.profileComplete ? (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                      Complete
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400">
                      Incomplete
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between py-2.5 border-b border-slate-100 dark:border-slate-700/50">
                  <span className="text-sm text-slate-500 dark:text-slate-400">Notifications</span>
                  {selectedUser.notificationsEnabled ? (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400">
                      Enabled
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400">
                      Disabled
                    </span>
                  )}
                </div>
              </div>

              {/* User ID */}
              <div className="bg-slate-50 dark:bg-slate-700/30 rounded-lg p-4">
                <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">User ID</p>
                <p className="text-xs font-mono text-slate-700 dark:text-slate-300 break-all">{selectedUser.uid}</p>
              </div>

              {/* Admin Actions */}
              <div className="pt-3 border-t border-slate-200 dark:border-slate-700">
                <button
                  onClick={async () => {
                    const isDisabled = (selectedUser as any).isDisabled;
                    const confirmed = await confirm({
                      title: isDisabled ? 'Enable Account' : 'Disable Account',
                      message: isDisabled
                        ? `Re-enable ${selectedUser.fullName || 'this user'}'s account? They will be able to log in and book rides again.`
                        : `Disable ${selectedUser.fullName || 'this user'}'s account? They will not be able to log in or book rides.`,
                      confirmText: isDisabled ? 'Enable' : 'Disable',
                      variant: isDisabled ? 'success' : 'danger',
                    });
                    if (!confirmed) return;
                    setTogglingUser(true);
                    try {
                      const res = await fetch('/api/users/disable', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ userId: selectedUser.uid, disabled: !isDisabled }),
                      });
                      if (res.ok) {
                        showToast(`User ${isDisabled ? 'enabled' : 'disabled'} successfully`, 'success');
                        fetchUsers();
                        setSelectedUser(null);
                      } else {
                        showToast('Failed to update user status', 'error');
                      }
                    } catch {
                      showToast('Failed to update user status', 'error');
                    } finally {
                      setTogglingUser(false);
                    }
                  }}
                  disabled={togglingUser}
                  className={`w-full px-4 py-2.5 text-sm font-medium rounded-lg transition-colors disabled:bg-slate-300 dark:disabled:bg-slate-600 disabled:cursor-not-allowed ${
                    (selectedUser as any).isDisabled
                      ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                      : 'bg-red-600 text-white hover:bg-red-700'
                  }`}
                >
                  {togglingUser
                    ? 'Updating...'
                    : (selectedUser as any).isDisabled
                      ? 'Enable Account'
                      : 'Disable Account'
                  }
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
