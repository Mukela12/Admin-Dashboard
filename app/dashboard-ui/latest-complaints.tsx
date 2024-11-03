import { ArrowPathIcon } from '@heroicons/react/24/outline';
import { lusitana } from '@/app/fonts';
import { Complaint } from '@/app/lib/types'; // Import the Complaint type

async function fetchLatestComplaints(): Promise<Complaint[]> {
  try {
    const response = await fetch('https://banturide-api.onrender.com/admin/get-complaints');
    const data = await response.json();

    // Check if the API response is successful and has data
    if (data.success && data.complaints) {
      return data.complaints;
    } else {
      console.warn('No complaints found:', data.message || 'Unknown error');
      return []; // Return an empty array if no data is available
    }
  } catch (error) {
    console.error('Error fetching complaints:', error);
    return [];
  }
}

export default async function LatestInvoices() {
  const complaints = await fetchLatestComplaints();

  return (
    <div className="flex w-full flex-col md:col-span-4">
      <h2 className={`${lusitana.className} mb-4 text-xl md:text-2xl`}>
        Latest Complaints
      </h2>
      <div className="flex grow flex-col justify-between rounded-xl bg-gray-50 p-4">
        <div className="bg-white px-6">
          {complaints.length > 0 ? (
            complaints.map((complaint, i) => (
              <div key={complaint.id} className="flex flex-row items-center justify-between py-4 border-t">
                <div className="flex items-center">
                  <p>{complaint.complaint}</p>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold md:text-base">
                      {complaint.complainer}
                    </p>
                  </div>
                </div>
                <p className={`${lusitana.className} truncate text-sm font-medium md:text-base`}>
                  {new Date(complaint.createdAt._seconds * 1000).toLocaleDateString()}
                </p>
              </div>
            ))
          ) : (
            <p className="py-4 text-center text-gray-500">No data</p>
          )}
        </div>
        <div className="flex items-center pb-2 pt-6">
          <ArrowPathIcon className="h-5 w-5 text-gray-500" />
          <h3 className="ml-2 text-sm text-gray-500">Updated just now</h3>
        </div>
      </div>
    </div>
  );
}