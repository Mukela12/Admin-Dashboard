"use client";

import { Application } from '@/app/lib/types';

interface ApprovalRatioChartProps {
  applications?: Application[];
}

export default function ApprovalRatioChart({ applications = [] }: ApprovalRatioChartProps) {
  if (!applications || applications.length === 0) {
    return (
      <div className="chart-container h-full flex flex-col items-center justify-center">
        <h2 className="lusitana text-xl font-bold text-gray-900 dark:text-white mb-6">
          Approval Ratio
        </h2>
        <p className="text-gray-600 dark:text-gray-300">No data available</p>
      </div>
    );
  }

  const approved = applications.filter((app) => app.driverVerificationStatus === 'approved').length;
  const denied = applications.filter((app) =>
    ['denied', 'failed', 'pending'].includes(app.driverVerificationStatus)
  ).length;

  const total = approved + denied;
  const approvalPercentage = total > 0 ? ((approved / total) * 100).toFixed(1) : '0.0';
  const denialPercentage = total > 0 ? ((denied / total) * 100).toFixed(1) : '0.0';

  const size = 160;
  const strokeWidth = 16;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const approvedOffset = total > 0 ? circumference - (circumference * approved / total) : 0;

  return (
    <div className="chart-container h-full flex flex-col">
      <h2 className="lusitana text-xl font-bold text-gray-900 dark:text-white mb-6">
        Approval Ratio
      </h2>
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="relative">
          <svg width={size} height={size} className="transform -rotate-90">
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="#f3f4f6"
              strokeWidth={strokeWidth}
              fill="none"
              className="dark:stroke-gray-700"
            />
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="#22c55e"
              strokeWidth={strokeWidth}
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={approvedOffset}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{approvalPercentage}%</p>
              <p className="text-sm text-gray-600 dark:text-gray-300">Approved</p>
            </div>
          </div>
        </div>
        <div className="mt-6 flex gap-6">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-sm text-gray-600 dark:text-gray-300">Approved ({approved})</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gray-300 dark:bg-gray-600"></div>
            <span className="text-sm text-gray-600 dark:text-gray-300">Other ({denied})</span>
          </div>
        </div>
      </div>
    </div>
  );
}