import { HomeIcon, UserGroupIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

export default function NavLinks() {
  return (
    <div className="space-y-2">
      <Link href="/dashboard" className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
        <HomeIcon className="h-5 w-5" />
        <span>Dashboard</span>
      </Link>
      <Link href="/dashboard/drivers" className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
        <UserGroupIcon className="h-5 w-5" />
        <span>Drivers</span>
      </Link>
      <Link href="/dashboard/child-pickup" className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
        <UserGroupIcon className="h-5 w-5" />
        <span>Child Pickup Applications</span>
      </Link>
      <Link href="/dashboard/complaints" className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
        <ExclamationCircleIcon className="h-5 w-5" />
        <span>Complaints</span>
      </Link>
    </div>
  );
}