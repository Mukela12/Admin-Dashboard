// LatestComplaints.tsx
import { ArrowPathIcon } from '@heroicons/react/24/outline';
import { lusitana } from '@/app/fonts';
import { Complaint } from '@/app/lib/types';

async function fetchLatestComplaints(): Promise<Complaint[]> {
  try {
    const response = await fetch('https://banturide-api.onrender.com/admin/get-complaints');

    const data = await response.json();

    if (data.success && data.complaints) {
      return data.complaints;
    } else {
      console.warn('No complaints found:', data.message || 'Unknown error');
      return [];
    }
  } catch (error) {
    console.error('Error fetching complaints:', error instanceof Error ? error.message : error);
    return [];
  }
}

export default async function LatestComplaints() {
  const complaints = await fetchLatestComplaints();

  return (
    <div className="flex w-full flex-col md:col-span-4">
      <h2 className={`${lusitana.className} mb-4 text-xl md:text-2xl text-gray-800`}>
        Latest Complaints
      </h2>
      <div className="flex grow flex-col justify-between rounded-xl bg-gray-50 p-4 shadow-lg">
        <div className="bg-white rounded-lg shadow-sm divide-y divide-gray-200">
          {complaints.length > 0 ? (
            complaints.map((complaint, i) => (
              <div
                key={complaint.id}
                className={`flex items-center justify-between py-4 px-6 ${
                  i % 2 === 0 ? 'bg-gray-100' : 'bg-gray-50'
                } hover:bg-gray-200 transition-colors duration-200`}
              >
                <div className="flex items-center space-x-3">
                  <p className="truncate text-sm md:text-base text-gray-700">{complaint.complaint}</p>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold md:text-base text-gray-800">
                      {complaint.complainer}
                    </p>
                  </div>
                </div>
                <p className={`${lusitana.className} text-sm font-medium text-gray-500 md:text-base`}>
                  {new Date(complaint.createdAt._seconds * 1000).toLocaleDateString()}
                </p>
              </div>
            ))
          ) : (
            <p className="py-4 text-center text-gray-500">No complaints available.</p>
          )}
        </div>
        <div className="flex items-center pb-2 pt-6 justify-center text-gray-500">
          <ArrowPathIcon className="h-5 w-5 mr-2" />
          <h3 className="text-sm">Updated just now</h3>
        </div>
      </div>
    </div>
  );
}
