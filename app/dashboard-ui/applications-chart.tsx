import { generateYAxis } from '@/app/lib/utils';
import { CalendarIcon } from '@heroicons/react/24/outline';
import { lusitana } from '@/app/fonts';
import { Application } from '@/app/lib/types';

async function fetchDriverApplications(): Promise<Application[]> {
  try {
    const response = await fetch('http://localhost:3000/api/dashboard/applications', {
      cache: 'no-store'
    });
    const data = await response.json();
    return data.applications || [];
  } catch (error) {
    console.error('Error fetching applications:', error);
    return [];
  }
}

export default async function ApplicationChart() {
  const applications: Application[] = await fetchDriverApplications();

  // Handle empty applications
  if (!applications || applications.length === 0) {
    return (
      <div className="chart-container h-full flex items-center justify-center">
        <p className="text-slate-500 dark:text-slate-400">No application data available</p>
      </div>
    );
  }

  // Grouping applications by month and counting approvals
  const monthlyApplications = applications.reduce((acc, app) => {
    // Handle both Firebase timestamp format and regular number timestamp
    let timestamp = 0;
    if (app.createdAt) {
      if (typeof app.createdAt === 'number') {
        timestamp = app.createdAt;
      } else if (app.createdAt._seconds) {
        timestamp = app.createdAt._seconds * 1000;
      }
    }

    if (timestamp) {
      const month = new Date(timestamp).toLocaleString('default', { month: 'short' });
      if (!acc[month]) acc[month] = 0;
      if (app.driverVerificationStatus === 'approved') acc[month]++;
    }
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.entries(monthlyApplications).map(([month, count]) => ({ month, revenue: count }));

  const chartHeight = 400;
  const { yAxisLabels, topLabel } = generateYAxis(chartData);

  if (!chartData || chartData.length === 0) {
    return <p className="mt-4 text-slate-400">No data available.</p>;
  }

  return (
    <div className="chart-container h-full">
      <div className="flex items-center justify-between mb-6">
        <h2 className={`${lusitana.className} text-xl font-bold text-slate-900 dark:text-white`}>
          Approved Applications
        </h2>
        <div className="flex items-center text-sm text-slate-500 dark:text-slate-400">
          <CalendarIcon className="h-4 w-4 mr-2" />
          Last 12 months
        </div>
      </div>
      
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl opacity-50" />
        <div className="relative bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-xl p-6">
          <div className="flex items-end gap-2 md:gap-4" style={{ height: `${chartHeight}px` }}>
            {/* Y-axis */}
            <div
              className="hidden sm:flex flex-col justify-between text-sm text-slate-400 dark:text-slate-500"
              style={{ height: `${chartHeight}px` }}
            >
              {yAxisLabels.map((label) => (
                <p key={label}>{label}</p>
              ))}
            </div>

            {/* Bars */}
            {chartData.map((data) => (
              <div key={data.month} className="flex-1 flex flex-col items-center justify-end gap-2">
                <div className="w-full relative group">
                  <div
                    className="w-full bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-lg transition-all duration-300 group-hover:from-blue-700 group-hover:to-blue-500"
                    style={{
                      height: `${(chartHeight / topLabel) * data.revenue}px`,
                    }}
                  >
                    {/* Tooltip */}
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-slate-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                      {data.revenue}
                    </div>
                  </div>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-300 font-medium">
                  {data.month}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}