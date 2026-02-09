'use client';
import { useState } from 'react';
import { useToast } from '@/app/lib/hooks/useToast';
import { useConfirm } from '@/app/lib/hooks/useConfirm';
import {
  BellIcon,
  PaperAirplaneIcon,
  UserGroupIcon,
  TruckIcon,
  UsersIcon,
  DevicePhoneMobileIcon,
} from '@heroicons/react/24/outline';

const audienceOptions = [
  { value: 'all', label: 'All Users', description: 'Send to both drivers and passengers', icon: UserGroupIcon },
  { value: 'drivers', label: 'All Drivers', description: 'Send only to registered drivers', icon: TruckIcon },
  { value: 'users', label: 'All Passengers', description: 'Send only to passenger accounts', icon: UsersIcon },
];

export default function NotificationsPage() {
  const [form, setForm] = useState({
    title: '',
    body: '',
    audience: 'all',
  });
  const [sending, setSending] = useState(false);
  const { showToast } = useToast();
  const { confirm } = useConfirm();

  const handleSend = async () => {
    if (!form.title || !form.body) {
      showToast('Please fill in title and message', 'error');
      return;
    }

    const audienceLabel = audienceOptions.find(a => a.value === form.audience)?.label || 'all users';
    const confirmed = await confirm({
      title: 'Send Notification',
      message: `Send this notification to ${audienceLabel.toLowerCase()}? This action cannot be undone.`,
      confirmText: 'Send',
      variant: 'success',
    });

    if (!confirmed) return;

    setSending(true);
    try {
      const response = await fetch('/api/notifications/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (response.ok) {
        showToast(`Notification sent to ${data.targeted} users`, 'success');
        setForm({ title: '', body: '', audience: 'all' });
      } else {
        showToast(data.error || 'Failed to send notification', 'error');
      }
    } catch (error) {
      showToast('An error occurred', 'error');
    } finally {
      setSending(false);
    }
  };

  const selectedAudience = audienceOptions.find(a => a.value === form.audience);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Compose Form */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl">
          <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">Compose Notification</h2>
          </div>

          <div className="p-6 space-y-5">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Title
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full px-3 py-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="Enter notification title"
                maxLength={50}
              />
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1.5">
                {form.title.length}/50 characters
              </p>
            </div>

            {/* Body */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Message
              </label>
              <textarea
                value={form.body}
                onChange={(e) => setForm({ ...form, body: e.target.value })}
                className="w-full px-3 py-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                placeholder="Enter notification message"
                rows={4}
                maxLength={200}
              />
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1.5">
                {form.body.length}/200 characters
              </p>
            </div>

            {/* Audience */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Target Audience
              </label>
              <div className="space-y-2">
                {audienceOptions.map((option) => {
                  const isSelected = form.audience === option.value;
                  return (
                    <button
                      key={option.value}
                      onClick={() => setForm({ ...form, audience: option.value })}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg border text-left transition-all duration-200 ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 dark:border-blue-500/50'
                          : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                      }`}
                    >
                      <div className={`p-2 rounded-lg ${
                        isSelected
                          ? 'bg-blue-100 dark:bg-blue-500/20'
                          : 'bg-slate-100 dark:bg-slate-700'
                      }`}>
                        <option.icon className={`h-4 w-4 ${
                          isSelected
                            ? 'text-blue-600 dark:text-blue-400'
                            : 'text-slate-500 dark:text-slate-400'
                        }`} />
                      </div>
                      <div>
                        <p className={`text-sm font-medium ${
                          isSelected
                            ? 'text-blue-700 dark:text-blue-300'
                            : 'text-slate-900 dark:text-slate-100'
                        }`}>
                          {option.label}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{option.description}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Send Button */}
            <button
              onClick={handleSend}
              disabled={sending || !form.title || !form.body}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:bg-slate-300 dark:disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors"
            >
              {sending ? (
                <>
                  <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <PaperAirplaneIcon className="h-4 w-4" />
                  Send Notification
                </>
              )}
            </button>
          </div>
        </div>

        {/* Preview Panel */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">Preview</h2>
            </div>

            <div className="p-6">
              {/* Phone Mockup */}
              <div className="mx-auto max-w-[280px]">
                <div className="bg-slate-100 dark:bg-slate-700 rounded-[24px] p-3">
                  {/* Notification Card */}
                  <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-blue-100 dark:bg-blue-500/20 rounded-lg shrink-0">
                        <BellIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-0.5">BantuRide</p>
                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                          {form.title || 'Notification Title'}
                        </p>
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 line-clamp-3">
                          {form.body || 'Your notification message will appear here...'}
                        </p>
                      </div>
                    </div>
                  </div>
                  <p className="text-center text-[10px] text-slate-400 dark:text-slate-500 mt-3">
                    As seen on mobile devices
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Info Card */}
          <div className="bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <DevicePhoneMobileIcon className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-800 dark:text-blue-300">About Push Notifications</p>
                <p className="text-xs text-blue-700 dark:text-blue-400 mt-1 leading-relaxed">
                  Notifications are delivered via Firebase Cloud Messaging (FCM) to users who have the BantuRide app installed and notifications enabled. Users who have disabled notifications or uninstalled the app will not receive the message.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
