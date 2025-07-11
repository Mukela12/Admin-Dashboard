import { ArrowPathIcon } from '@heroicons/react/24/outline';
import { lusitana } from '@/app/fonts';
import { Complaint } from '@/app/lib/types';

async function fetchLatestComplaints(): Promise<Complaint[]> {
  try {
    const response = await fetch('https://banturide-api-production.up.railway.app/admin/get-complaints');
    const data = await response.json();

    if (data.success && data.complaints) {
      return data.complaints.slice(0, 6); // Get latest 6 complaints
    } else {
      console.warn('No complaints found:', data.message || 'Unknown error');
      return [];
    }
  } catch (error) {
    console.error('Error fetching complaints:', error);
    return [];
  }
}

export default async function LatestInvoices() {
  const complaints = await fetchLatestComplaints();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700 h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h2 className={`${lusitana.className} text-xl font-bold text-gray-900 dark:text-white`}>
          Latest Complaints
        </h2>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {complaints.length} recent
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        <div className="space-y-3">
          {complaints.length > 0 ? (
            complaints.map((complaint) => (
              <div
                key={complaint.id}
                className="p-4 rounded-xl bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {complaint.complainer}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 line-clamp-2">
                      {complaint.complaint}
                    </p>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                    {new Date(complaint.createdAt._seconds * 1000).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">No complaints available</p>
            </div>
          )}
        </div>
      </div>
      
      <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-center text-sm text-gray-500 dark:text-gray-400">
          <ArrowPathIcon className="h-4 w-4 mr-2" />
          Updated just now
        </div>
      </div>
    </div>
  );
}