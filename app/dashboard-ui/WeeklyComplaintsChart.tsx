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
  const response = await fetch('https://banturide-api-production.up.railway.app/admin/get-complaints');
  const data = await response.json();

  const complaints = Array.isArray(data.complaints) ? data.complaints : [];

  // Get the last 4 weeks of data
  const weeklyComplaints: Record<string, number> = {};
  const now = new Date();
  
  for (let i = 0; i < 4; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() - (i * 7));
    const week = getISOWeekNumber(date);
    const year = date.getFullYear();
    const key = `${year}-W${week}`;
    weeklyComplaints[key] = 0;
  }

  complaints.forEach((complaint: Complaint) => {
    if (complaint.createdAt?._seconds) {
      const date = new Date(complaint.createdAt._seconds * 1000);
      const week = getISOWeekNumber(date);
      const year = date.getFullYear();
      const key = `${year}-W${week}`;
      if (key in weeklyComplaints) {
        weeklyComplaints[key]++;
      }
    }
  });

  return weeklyComplaints;
}

export default async function WeeklyComplaintsChart() {
  const weeklyData = await fetchWeeklyComplaints();
  const entries = Object.entries(weeklyData).reverse(); // Reverse to show oldest first
  const maxCount = Math.max(...Object.values(weeklyData), 1);

  return (
    <div className="chart-container h-full flex flex-col">
      <h2 className={`${lusitana.className} text-xl font-bold text-gray-900 dark:text-white mb-6`}>
        Weekly Complaints
      </h2>
      <div className="flex-1 flex flex-col justify-center">
        <div className="space-y-6">
          {entries.map(([week, count], i) => {
            const height = (count / maxCount) * 100;
            return (
              <div key={i} className="flex items-center gap-4">
                <div className="w-20 text-sm text-gray-600 dark:text-gray-300">Week {week.split('-W')[1]}</div>
                <div className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-full h-10 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-orange-500 to-orange-400 rounded-full transition-all duration-500 flex items-center justify-end pr-3"
                    style={{ width: `${height}%` }}
                  >
                    <span className="text-white text-sm font-semibold">{count}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
          Past 4 weeks
        </div>
      </div>
    </div>
  );
}