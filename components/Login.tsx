import AcmeLogo from '@/app/BanturideLogo';
import LoginForm from './LoginForm';
import Image from 'next/image';

export default function LoginPage() {
  return (
    <main className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-purple-600 rounded-full mix-blend-multiply filter blur-xl opacity-30"></div>
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-600 rounded-full mix-blend-multiply filter blur-xl opacity-30"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-indigo-600 rounded-full mix-blend-multiply filter blur-xl opacity-30"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-md px-4">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <div className="w-48 bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <AcmeLogo />
            </div>
          </div>
        </div>
        <LoginForm />
        <p className="mt-6 text-center text-sm text-gray-300">
          © 2025 BantuRide. All rights reserved.
        </p>
      </div>
    </main>
  );
}