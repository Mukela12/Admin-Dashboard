// components/LoginForm.tsx
'use client';

import { AtSymbolIcon, KeyIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';
import { ArrowRightIcon } from '@heroicons/react/20/solid';
import { useState } from 'react';
import { lusitana } from '@/app/fonts';

export default function LoginForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [isPending, setIsPending] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsPending(true);
        setErrorMessage('');

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (data.success) {
                localStorage.setItem('token', data.token);
                window.location.href = '/dashboard';
            } else {
                setErrorMessage(data.message || 'Invalid credentials');
            }
        } catch (err) {
            setErrorMessage('An error occurred. Please try again.');
        } finally {
            setIsPending(false);
        }
    };

    return (
        <form onSubmit={handleLogin} className="space-y-6">
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-white/20">
                <div className="text-center mb-8">
                    <h1 className={`${lusitana.className} text-3xl font-bold text-white mb-2`}>
                        Welcome Back
                    </h1>
                    <p className="text-slate-300">Sign in to access your dashboard</p>
                </div>
                
                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-200 mb-2" htmlFor="email">
                            Email Address
                        </label>
                        <div className="relative">
                            <input
                                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:bg-white/20 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 pl-10"
                                id="email"
                                type="email"
                                name="email"
                                placeholder="admin@banturide.com"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                            <AtSymbolIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        </div>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-slate-200 mb-2" htmlFor="password">
                            Password
                        </label>
                        <div className="relative">
                            <input
                                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:bg-white/20 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 pl-10"
                                id="password"
                                type="password"
                                name="password"
                                placeholder="Enter your password"
                                required
                                minLength={6}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <KeyIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        </div>
                    </div>
                </div>
                
                <button 
                    className="mt-8 w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-medium transition-all duration-300 hover:from-blue-700 hover:to-blue-800 hover:shadow-lg transform hover:-translate-y-0.5 flex items-center justify-center" 
                    disabled={isPending}
                >
                    {isPending ? (
                        <span>Signing in...</span>
                    ) : (
                        <>
                            Sign In
                            <ArrowRightIcon className="ml-2 h-5 w-5" />
                        </>
                    )}
                </button>
                
                {errorMessage && (
                    <div className="mt-4 flex items-center gap-2 text-red-400 bg-red-900/20 p-3 rounded-lg">
                        <ExclamationCircleIcon className="h-5 w-5" />
                        <p className="text-sm">{errorMessage}</p>
                    </div>
                )}
            </div>
        </form>
    );
}