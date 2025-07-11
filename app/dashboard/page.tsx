import CardWrapper from '@/app/dashboard-ui/cards';
import RevenueChart from '@/app/dashboard-ui/applications-chart';
import LatestInvoices from '@/app/dashboard-ui/latest-complaints';
import { lusitana } from '@/app/fonts';
import { Suspense } from 'react';
import {
  RevenueChartSkeleton,
  LatestInvoicesSkeleton,
  CardsSkeleton,
} from '@/app/dashboard-ui/skeletons';
import ApprovalRatioChart from '@/app/dashboard-ui/ApprovalRatioChart';
import WeeklyComplaintsChart from '@/app/dashboard-ui/WeeklyComplaintsChart';
import ProcessingTimeChart from '@/app/dashboard-ui/ProcessingTimeChart';

export default async function Page() {
  return (
    <main className="relative">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className={`${lusitana.className} text-3xl font-bold text-gray-900 dark:text-white mb-2`}>
          Dashboard Overview
        </h1>
        <p className="text-gray-600 dark:text-gray-400">Welcome back to BantuRide Admin</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <Suspense fallback={<CardsSkeleton />}>
          <CardWrapper />
        </Suspense>
      </div>

      {/* Main Chart and Complaints Section */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 mb-8">
        {/* Main Chart */}
        <div className="lg:col-span-8">
          <Suspense fallback={<RevenueChartSkeleton />}>
            <RevenueChart />
          </Suspense>
        </div>

        {/* Latest Complaints */}
        <div className="lg:col-span-4">
          <Suspense fallback={<LatestInvoicesSkeleton />}>
            <LatestInvoices />
          </Suspense>
        </div>
      </div>

      {/* Bottom Row Charts - All Same Height */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="h-[400px]">
          <Suspense fallback={<RevenueChartSkeleton />}>
            <ApprovalRatioChart />
          </Suspense>
        </div>
        
        <div className="h-[400px]">
          <Suspense fallback={<RevenueChartSkeleton />}>
            <WeeklyComplaintsChart />
          </Suspense>
        </div>
        
        <div className="h-[400px]">
          <Suspense fallback={<RevenueChartSkeleton />}>
            <ProcessingTimeChart />
          </Suspense>
        </div>
      </div>
    </main>
  );
}