import { BanknotesIcon, ClockIcon, UserGroupIcon, InboxIcon } from '@heroicons/react/24/outline';
import { lusitana } from '@/app/fonts';
import { Application, Complaint } from '@/app/lib/types'; // Import the types

async function fetchDriverApplications(): Promise<Application[]> {
  try {
    const response = await fetch('https://banturide-api.onrender.com/admin/get-driver-applications');
    const data = await response.json();

    if (data.success && data.applications) {
      return data.applications;
    } else {
      console.warn('No applications found:', data.message || 'Unknown error');
      return [];
    }
  } catch (error) {
    console.error('Error fetching applications:', error);
    return [];
  }
}

async function fetchComplaints(): Promise<Complaint[]> {
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
    console.error('Error fetching complaints:', error);
    return [];
  }
}

export default async function CardWrapper() {
  const numberOfApplications = (await fetchDriverApplications()).length || 0;
  const numberOfComplaints = (await fetchComplaints()).length || 0;

  return (
    <>
      <Card title="Total Applications" value={numberOfApplications} type="invoices" />
      <Card title="Total Complaints" value={numberOfComplaints} type="customers" />
    </>
  );
}

export function Card({
  title,
  value,
  type,
}: {
  title: string;
  value: number | string;
  type: 'invoices' | 'customers' | 'pending' | 'collected';
}) {
  const iconMap = {
    collected: BanknotesIcon,
    customers: UserGroupIcon,
    pending: ClockIcon,
    invoices: InboxIcon,
  };

  const Icon = iconMap[type];

  return (
    <div className="rounded-xl bg-gray-50 p-2 shadow-sm">
      <div className="flex p-4">
        {Icon ? <Icon className="h-5 w-5 text-gray-700" /> : null}
        <h3 className="ml-2 text-sm font-medium">{title}</h3>
      </div>
      <p
        className={`${lusitana.className} truncate rounded-xl bg-white px-4 py-8 text-center text-2xl`}
      >
        {value}
      </p>
    </div>
  );
}