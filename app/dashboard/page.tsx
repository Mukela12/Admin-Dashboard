export const dynamic = 'force-dynamic';

import { Suspense } from 'react';
import RealtimeStats from '@/app/dashboard-ui/realtime-stats';
import RevenueChart from '@/app/dashboard-ui/applications-chart';
import LatestInvoices from '@/app/dashboard-ui/latest-complaints';
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
    <main className="space-y-8">
      {/* Real-time Stats Cards */}
      <div>
        <Suspense fallback={<CardsSkeleton />}>
          <RealtimeStats />
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