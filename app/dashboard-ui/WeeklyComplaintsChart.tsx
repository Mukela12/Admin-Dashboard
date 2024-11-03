// WeeklyComplaintsChart.tsx

import { lusitana } from '@/app/fonts';
import { Complaint } from '@/app/lib/types';

// Helper function to get ISO week number
function getISOWeekNumber(date: Date): number {
  const tempDate = new Date(date);
  tempDate.setHours(0, 0, 0, 0);
  tempDate.setDate(tempDate.getDate() + 3 - ((tempDate.getDay() + 6) % 7));
  const week1 = new Date(tempDate.getFullYear(), 0, 4);
  return (
    1 +
    Math.round(
      ((tempDate.getTime() - week1.getTime()) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7
    )
  );
}

async function fetchWeeklyComplaints(): Promise<Record<string, number>> {
  const response = await fetch('https://banturide-api.onrender.com/admin/get-complaints');
  const data = await response.json();

  const complaints = Array.isArray(data.complaints) ? data.complaints : [];

  const weeklyComplaints = complaints.reduce((acc: Record<string, number>, complaint: Complaint) => {
    if (complaint.createdAt?._seconds) {
      const date = new Date(complaint.createdAt._seconds * 1000);
      const week = getISOWeekNumber(date);
      const year = date.getFullYear();
      const key = `${year}-W${week}`;  // Format key as "Year-WeekNumber"
      acc[key] = (acc[key] || 0) + 1;
    }
    return acc;
  }, {});

  return weeklyComplaints;
}

export default async function WeeklyComplaintsChart() {
  const weeklyData = await fetchWeeklyComplaints();
  const weeks = Object.keys(weeklyData);
  const counts = Object.values(weeklyData);

  return (
    <div className="w-full md:col-span-4">
      <h2 className={`${lusitana.className} mb-4 text-xl md:text-2xl`}>
        Weekly Complaints
      </h2>
      <div className="rounded-xl bg-gray-50 p-4">
        <div className="flex justify-between text-sm">
          {weeks.map((week, i) => (
            <div key={i} className="flex flex-col items-center">
              <span className="text-lg font-semibold">{counts[i]}</span>
              <span className="text-gray-500">{week}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
