import { ArrowPathIcon } from '@heroicons/react/24/outline';
import { lusitana } from '@/app/fonts';
import { Complaint } from '@/app/lib/types';
import { collections } from '@/app/lib/firebase/collections';

async function fetchLatestComplaints(): Promise<Complaint[]> {
  try {
    const snapshot = await collections.complaints.orderBy('createdAt', 'desc').limit(6).get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Complaint));
  } catch (error) {
    console.error('Error fetching complaints:', error);
    return [];
  }
}

export default async function LatestInvoices() {
  const complaints = await fetchLatestComplaints();

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 border border-slate-100 dark:border-slate-700 h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h2 className={`${lusitana.className} text-xl font-bold text-slate-900 dark:text-white`}>
          Latest Complaints
        </h2>
        <div className="text-sm text-slate-500 dark:text-slate-400">
          {complaints.length} recent
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        <div className="space-y-3">
          {complaints.length > 0 ? (
            complaints.map((complaint) => (
              <div
                key={complaint.id}
                className="p-4 rounded-xl bg-slate-50 dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                      {complaint.complainer}
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-300 mt-1 line-clamp-2">
                      {complaint.complaint}
                    </p>
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                    {new Date(
                      typeof complaint.createdAt === 'number'
                        ? complaint.createdAt
                        : complaint.createdAt?._seconds
                        ? complaint.createdAt._seconds * 1000
                        : Date.now()
                    ).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <p className="text-slate-500 dark:text-slate-400">No complaints available</p>
            </div>
          )}
        </div>
      </div>
      
      <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-700">
        <div className="flex items-center justify-center text-sm text-slate-500 dark:text-slate-400">
          <ArrowPathIcon className="h-4 w-4 mr-2" />
          Updated just now
        </div>
      </div>
    </div>
  );
}