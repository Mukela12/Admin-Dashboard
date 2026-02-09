'use client';

import {
  HomeIcon,
  UserGroupIcon,
  ExclamationCircleIcon,
  BellIcon,
  PlusCircleIcon,
  TruckIcon,
  CurrencyDollarIcon,
  UsersIcon,
  ShieldCheckIcon,
  MapIcon,
  ChevronDownIcon,
  ChartBarIcon,
  CogIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface NavGroup {
  key: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  items: NavItem[];
}

type NavEntry =
  | { type: 'link'; item: NavItem }
  | { type: 'group'; group: NavGroup };

const navigation: NavEntry[] = [
  {
    type: 'link',
    item: { href: '/dashboard', label: 'Dashboard', icon: HomeIcon },
  },
  {
    type: 'group',
    group: {
      key: 'rides',
      label: 'Rides',
      icon: TruckIcon,
      items: [
        { href: '/dashboard/trips', label: 'All Trips', icon: ChartBarIcon },
        { href: '/dashboard/trips/monitoring', label: 'Ride Monitoring', icon: MapIcon },
        { href: '/dashboard/transactions', label: 'Transactions', icon: CurrencyDollarIcon },
      ],
    },
  },
  {
    type: 'group',
    group: {
      key: 'drivers',
      label: 'Drivers',
      icon: UserGroupIcon,
      items: [
        { href: '/dashboard/all-drivers', label: 'All Drivers', icon: UserGroupIcon },
        { href: '/dashboard/drivers', label: 'Applications', icon: ShieldCheckIcon },
        { href: '/dashboard/drivers/new', label: 'Register Driver', icon: PlusCircleIcon },
        { href: '/dashboard/child-pickup', label: 'Child Pickup', icon: ShieldCheckIcon },
      ],
    },
  },
  {
    type: 'link',
    item: { href: '/dashboard/users', label: 'Passengers', icon: UsersIcon },
  },
  {
    type: 'link',
    item: { href: '/dashboard/complaints', label: 'Complaints', icon: ExclamationCircleIcon },
  },
  {
    type: 'link',
    item: { href: '/dashboard/notifications', label: 'Push Notifications', icon: BellIcon },
  },
  {
    type: 'link',
    item: { href: '/dashboard/settings', label: 'Settings', icon: CogIcon },
  },
];

// Collect all hrefs for active state matching
const allHrefs = navigation.flatMap(entry =>
  entry.type === 'link' ? [entry.item.href] : entry.group.items.map(i => i.href)
);

function isLinkActive(pathname: string, href: string): boolean {
  if (pathname === href) return true;
  if (href === '/dashboard') return false;
  return (
    pathname.startsWith(href + '/') &&
    !allHrefs.some(h => h !== href && h.startsWith(href + '/') && pathname.startsWith(h))
  );
}

function isGroupActive(pathname: string, group: NavGroup): boolean {
  return group.items.some(item => isLinkActive(pathname, item.href));
}

export default function NavLinks() {
  const pathname = usePathname();
  const [openGroups, setOpenGroups] = useState<Set<string>>(new Set());

  // Auto-expand the group that contains the active link
  useEffect(() => {
    navigation.forEach(entry => {
      if (entry.type === 'group' && isGroupActive(pathname, entry.group)) {
        setOpenGroups(prev => new Set(prev).add(entry.group.key));
      }
    });
  }, [pathname]);

  function toggleGroup(key: string) {
    setOpenGroups(prev => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }

  return (
    <div className="space-y-1">
      {navigation.map((entry, idx) => {
        if (entry.type === 'link') {
          const { item } = entry;
          const active = isLinkActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium
                transition-all duration-200
                ${active
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50'
                }
              `}
            >
              <item.icon className={`h-[18px] w-[18px] ${active ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`} />
              <span>{item.label}</span>
            </Link>
          );
        }

        // Collapsible group
        const { group } = entry;
        const groupActive = isGroupActive(pathname, group);
        const isOpen = openGroups.has(group.key);

        return (
          <div key={group.key}>
            <button
              onClick={() => toggleGroup(group.key)}
              className={`
                flex items-center w-full gap-3 rounded-xl px-4 py-2.5 text-sm font-medium
                transition-all duration-200
                ${groupActive && !isOpen
                  ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50'
                }
              `}
            >
              <group.icon className={`h-[18px] w-[18px] ${
                groupActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400'
              }`} />
              <span className="flex-1 text-left">{group.label}</span>
              <ChevronDownIcon className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {/* Child links */}
            <div className={`overflow-hidden transition-all duration-200 ${isOpen ? 'max-h-60 opacity-100' : 'max-h-0 opacity-0'}`}>
              <div className="ml-4 pl-3 border-l-2 border-slate-200 dark:border-slate-700 mt-1 space-y-0.5">
                {group.items.map(item => {
                  const active = isLinkActive(pathname, item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`
                        flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium
                        transition-all duration-200
                        ${active
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/50 hover:text-slate-900 dark:hover:text-slate-200'
                        }
                      `}
                    >
                      <item.icon className={`h-4 w-4 ${active ? 'text-white' : 'text-slate-400 dark:text-slate-500'}`} />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
