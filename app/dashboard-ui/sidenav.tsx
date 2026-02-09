'use client';

import Link from 'next/link';
import NavLinks from '@/app/dashboard-ui/nav-links';
import NotificationCenter from '@/app/dashboard-ui/notification-center';
import AcmeLogo from '@/app/BanturideLogo';
import { PowerIcon, SunIcon, MoonIcon } from '@heroicons/react/24/outline';
import { useTheme } from '../styles/ThemeProvider';

export default function SideNav() {
    const { theme, toggleTheme } = useTheme();

    const handleSignOut = () => {
        localStorage.removeItem('token');
        window.location.href = '/';
    };

    return (
        <div className="flex h-full flex-col bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700">
            <div className="flex h-32 items-center justify-center p-4 md:h-40 border-b border-slate-200 dark:border-slate-700">
                <Link href="/" className="flex items-center justify-center">
                    <div className="w-40 bg-slate-50 dark:bg-slate-900 rounded-xl p-4 transition-colors">
                        <AcmeLogo />
                    </div>
                </Link>
            </div>

            <div className="flex grow flex-col justify-between px-3 py-6 overflow-y-auto">
                <div className="space-y-1">
                    <NavLinks />
                </div>

                <div className="mt-auto space-y-1 pt-6 border-t border-slate-200 dark:border-slate-700">
                    <NotificationCenter />

                    <button
                        onClick={toggleTheme}
                        className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-all duration-200"
                    >
                        {theme === 'dark' ? (
                            <>
                                <SunIcon className="h-[18px] w-[18px] text-slate-500 dark:text-slate-400" />
                                <span>Light Mode</span>
                            </>
                        ) : (
                            <>
                                <MoonIcon className="h-[18px] w-[18px] text-slate-500 dark:text-slate-400" />
                                <span>Dark Mode</span>
                            </>
                        )}
                    </button>

                    <button
                        onClick={handleSignOut}
                        className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200"
                    >
                        <PowerIcon className="h-[18px] w-[18px]" />
                        <span>Sign Out</span>
                    </button>
                </div>
            </div>
        </div>
    );
}