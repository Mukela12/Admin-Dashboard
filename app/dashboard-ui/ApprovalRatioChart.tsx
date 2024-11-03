// ApprovalRatioChart.tsx
"use client"; // This component will run on the client side

import { useEffect, useState } from 'react';
import { lusitana } from '@/app/fonts';
import { Application } from '@/app/lib/types';

export default function ApprovalRatioChart() {
  const [approved, setApproved] = useState(0);
  const [denied, setDenied] = useState(0);

  useEffect(() => {
    const fetchApprovalData = async () => {
      const response = await fetch('https://banturide-api.onrender.com/admin/get-driver-applications');
      const data = await response.json();

      const approvedCount = data.applications.filter((app: Application) => app.driverVerificationStatus === 'approved').length;

      // Denied applications now include both denied, failed, and pending
      const deniedCount = data.applications.filter((app: Application) =>
        app.driverVerificationStatus === 'denied' ||
        app.driverVerificationStatus === 'failed' ||
        app.driverVerificationStatus === 'pending'
      ).length;

      setApproved(approvedCount);
      setDenied(deniedCount);
    };

    fetchApprovalData();
  }, []); // Empty dependency array means this effect runs once when the component mounts

  const total = approved + denied;
  const approvalPercentage = total > 0 ? ((approved / total) * 100).toFixed(1) : '0.0'; // Avoid division by zero
  const denialPercentage = total > 0 ? ((denied / total) * 100).toFixed(1) : '0.0'; // Avoid division by zero

  return (
    <div className="w-full md:col-span-4">
      <h2 className={`${lusitana.className} mb-4 text-xl md:text-2xl`}>
        Approval Ratio
      </h2>
      <div className="rounded-xl bg-gray-50 p-4">
        <div className="flex justify-around">
          <div className="flex flex-col items-center">
            <span className="text-lg font-semibold">{approvalPercentage}%</span>
            <span className="text-sm text-gray-500">Approved</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-lg font-semibold">{denialPercentage}%</span>
            <span className="text-sm text-gray-500">Denied (including Failed & Pending)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
