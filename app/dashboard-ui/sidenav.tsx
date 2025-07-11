'use client';

import Link from 'next/link';
import NavLinks from '@/app/dashboard-ui/nav-links';
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
        <div className="flex h-full flex-col bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700">
            <div className="flex h-32 items-center justify-center p-4 md:h-40">
                <Link href="/" className="flex items-center justify-center">
                    <div className="w-40 bg-white dark:bg-gray-800 rounded-xl p-4">
                        <AcmeLogo />
                    </div>
                </Link>
            </div>
            
            <div className="flex grow flex-col justify-between px-3 pb-4">
                <div className="space-y-2">
                    <NavLinks />
                </div>
                
                <div className="mt-auto space-y-2">
                    {/* Theme Toggle */}
                    <button
                        onClick={toggleTheme}
                        className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                        {theme === 'dark' ? (
                            <>
                                <SunIcon className="h-5 w-5" />
                                <span>Light Mode</span>
                            </>
                        ) : (
                            <>
                                <MoonIcon className="h-5 w-5" />
                                <span>Dark Mode</span>
                            </>
                        )}
                    </button>
                    
                    {/* Sign Out */}
                    <button 
                        onClick={handleSignOut}
                        className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                        <PowerIcon className="h-5 w-5" />
                        <span>Sign Out</span>
                    </button>
                </div>
            </div>
        </div>
    );
}