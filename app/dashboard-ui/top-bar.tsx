'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { ChevronRightIcon, HomeIcon } from '@heroicons/react/24/outline';

interface RouteInfo {
  title: string;
  description: string;
}

const routeMap: Record<string, RouteInfo> = {
  '/dashboard': {
    title: 'Dashboard',
    description: 'Platform overview and key metrics',
  },
  '/dashboard/trips': {
    title: 'Trips',
    description: 'Monitor all bookings and rides',
  },
  '/dashboard/trips/monitoring': {
    title: 'Ride Monitoring',
    description: 'Live map tracking of active rides',
  },
  '/dashboard/transactions': {
    title: 'Transactions',
    description: 'Payment and float transactions',
  },
  '/dashboard/all-drivers': {
    title: 'All Drivers',
    description: 'Manage registered drivers and accounts',
  },
  '/dashboard/drivers': {
    title: 'Driver Applications',
    description: 'Review and approve driver applications',
  },
  '/dashboard/drivers/new': {
    title: 'Register Driver',
    description: 'Manually register a new driver',
  },
  '/dashboard/child-pickup': {
    title: 'Child Pickup',
    description: 'Child pickup authorization requests',
  },
  '/dashboard/users': {
    title: 'Passengers',
    description: 'View and manage passenger accounts',
  },
  '/dashboard/complaints': {
    title: 'Complaints',
    description: 'Review and resolve complaints',
  },
  '/dashboard/notifications': {
    title: 'Push Notifications',
    description: 'Send push notifications to users',
  },
  '/dashboard/settings': {
    title: 'Settings',
    description: 'Platform configuration and preferences',
  },
};

function getBreadcrumbs(pathname: string): { label: string; href: string }[] {
  const crumbs: { label: string; href: string }[] = [];
  const segments = pathname.split('/').filter(Boolean);

  let currentPath = '';
  for (const segment of segments) {
    currentPath += `/${segment}`;
    const route = routeMap[currentPath];
    if (route) {
      crumbs.push({ label: route.title, href: currentPath });
    } else if (segment !== 'dashboard') {
      // Dynamic segment like [id]
      crumbs.push({ label: 'Details', href: currentPath });
    }
  }

  return crumbs;
}

function getRouteInfo(pathname: string): RouteInfo {
  // Exact match
  if (routeMap[pathname]) return routeMap[pathname];

  // Dynamic route fallback (e.g. /dashboard/drivers/[id])
  if (pathname.startsWith('/dashboard/drivers/') && pathname !== '/dashboard/drivers/new') {
    return { title: 'Driver Details', description: 'Review driver application and documents' };
  }

  return { title: 'Dashboard', description: '' };
}

export default function TopBar() {
  const pathname = usePathname();
  const routeInfo = getRouteInfo(pathname);
  const breadcrumbs = getBreadcrumbs(pathname);

  return (
    <div className="sticky top-0 z-30 shrink-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-700/50">
      <div className="px-6 lg:px-8 py-3">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-xs mb-1">
          <Link
            href="/dashboard"
            className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
          >
            <HomeIcon className="h-3.5 w-3.5" />
          </Link>
          {breadcrumbs.map((crumb, i) => (
            <span key={crumb.href} className="flex items-center gap-1.5">
              <ChevronRightIcon className="h-3 w-3 text-slate-300 dark:text-slate-600" />
              {i === breadcrumbs.length - 1 ? (
                <span className="font-medium text-slate-700 dark:text-slate-200">
                  {crumb.label}
                </span>
              ) : (
                <Link
                  href={crumb.href}
                  className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                >
                  {crumb.label}
                </Link>
              )}
            </span>
          ))}
        </div>

        {/* Title row */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-slate-900 dark:text-slate-50 tracking-tight">
              {routeInfo.title}
            </h1>
            {routeInfo.description && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {routeInfo.description}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
