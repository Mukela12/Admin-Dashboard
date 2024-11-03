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
import Layout from '@/app/dashboard/layout';

export default async function Page() {
  return (
    <main>
      <h1 className={`${lusitana.className} mb-4 text-xl md:text-2xl`}>
        Dashboard
      </h1>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Suspense fallback={<CardsSkeleton />}>
          <CardWrapper />
        </Suspense>
      </div>
      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-4 lg:grid-cols-8">
        <Suspense fallback={<RevenueChartSkeleton />}>
          <RevenueChart />
        </Suspense>
        <Suspense fallback={<LatestInvoicesSkeleton />}>
          <LatestInvoices />
        </Suspense>
        <Suspense fallback={<RevenueChartSkeleton />}>
          <ApprovalRatioChart />
        </Suspense>
        <Suspense fallback={<RevenueChartSkeleton />}>
          <WeeklyComplaintsChart />
        </Suspense>
        <Suspense fallback={<RevenueChartSkeleton />}>
          <ProcessingTimeChart />
        </Suspense>
      </div>
    </main>
  );
}

