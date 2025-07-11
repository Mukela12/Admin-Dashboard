import AcmeLogo from '@/app/BanturideLogo';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { lusitana } from '@/app/fonts';
import Image from 'next/image';

export default function Page() {
  return (
    <main className="h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 text-white overflow-hidden">
      {/* Background decoration - same as login page */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-purple-600 rounded-full mix-blend-multiply filter blur-xl opacity-30"></div>
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-600 rounded-full mix-blend-multiply filter blur-xl opacity-30"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-indigo-600 rounded-full mix-blend-multiply filter blur-xl opacity-30"></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-6 border-b border-white/10">
        <div className="flex items-center">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
            <AcmeLogo />
          </div>
        </div>
        <div className="hidden md:flex items-center gap-8">
          <Link href="/about" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">
            About
          </Link>
          <Link href="/support" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">
            Support
          </Link>
          <Link
            href="/login"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
          >
            Admin Login
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative z-10 h-[calc(100vh-88px)]">
        {/* Content Grid */}
        <div className="h-full mx-auto max-w-7xl px-8">
          <div className="h-full grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="py-8 lg:py-0">
              <div className="mb-6">
                <span className="inline-flex items-center rounded-lg bg-white/10 backdrop-blur-sm px-3 py-1 text-sm font-medium text-blue-300 ring-1 ring-white/20">
                  BantuRide Management
                </span>
              </div>
              <h1 className={`${lusitana.className} text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl text-white`}>
                BantuRide Admin Dashboard
              </h1>
              <p className="mt-6 text-lg leading-8 text-gray-300 max-w-2xl">
                Manage your ride-hailing operations efficiently. Track key metrics, approve driver applications, 
                and handle customer complaints all in one centralized platform.
              </p>
              
              {/* CTA Buttons */}
              <div className="mt-8 flex items-center gap-4">
                <Link
                  href="/login"
                  className="rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:from-blue-700 hover:to-blue-800 transition-all duration-200 flex items-center gap-2"
                >
                  Access Dashboard
                  <ArrowRightIcon className="h-4 w-4" />
                </Link>
                <Link
                  href="/demo"
                  className="rounded-lg border border-white/20 bg-white/10 backdrop-blur-sm px-6 py-3 text-sm font-semibold text-white hover:bg-white/20 transition-all duration-200"
                >
                  View Demo
                </Link>
              </div>


              {/* Live Stats Preview */}
              <div className="mt-8 flex items-center gap-8 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-gray-300">Live System Status</span>
                </div>
              </div>
            </div>
            
            {/* Right Image */}
            <div className="hidden lg:block">
              <div className="relative h-full flex items-center justify-center">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur-2xl opacity-20"></div>
                  <Image
                    src="/starter.jpg"
                    alt="BantuRide Admin Dashboard"
                    width={600}
                    height={400}
                    className="relative rounded-2xl shadow-2xl ring-1 ring-white/10"
                  />
                  {/* Dashboard Preview Cards */}
                  <div className="absolute -left-6 top-8 bg-white/95 backdrop-blur-sm rounded-lg px-4 py-3 shadow-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">New Driver Application</p>
                        <p className="text-sm font-semibold text-gray-900">Daliso Phiri - Approved</p>
                      </div>
                    </div>
                  </div>
                  <div className="absolute -right-6 bottom-8 bg-white/95 backdrop-blur-sm rounded-lg px-4 py-3 shadow-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-orange-600" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">New Complaint</p>
                        <p className="text-sm font-semibold text-gray-900">Ride #4821 - Pending</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="absolute bottom-0 left-0 right-0 border-t border-white/10 bg-gray-900/50 backdrop-blur-sm">
          <div className="mx-auto max-w-7xl px-8 py-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-300">
                © 2025 BantuRide. E-hailing Management Platform.
              </p>
              <div className="flex items-center gap-6">
                <Link href="/privacy" className="text-sm text-gray-300 hover:text-white transition-colors">
                  Privacy Policy
                </Link>
                <Link href="/terms" className="text-sm text-gray-300 hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}