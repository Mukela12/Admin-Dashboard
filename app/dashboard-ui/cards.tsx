import { BanknotesIcon, ClockIcon, UserGroupIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';
import { lusitana } from '@/app/fonts';
import { Application, Complaint } from '@/app/lib/types';

async function fetchDriverApplications(): Promise<Application[]> {
  try {
    const response = await fetch('https://banturide-api-production.up.railway.app/admin/get-driver-applications');
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
    const response = await fetch('https://banturide-api-production.up.railway.app/admin/get-complaints');
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
  const applications = await fetchDriverApplications();
  const complaints = await fetchComplaints();
  
  const totalApplications = applications.length;
  const totalComplaints = complaints.length;
  const pendingApplications = applications.filter(app => app.driverVerificationStatus === 'pending').length;
  const approvedApplications = applications.filter(app => app.driverVerificationStatus === 'approved').length;

  return (
    <>
      <Card 
        title="Total Applications" 
        value={totalApplications} 
        type="invoices"
        gradient="from-blue-600 to-blue-700"
      />
      <Card 
        title="Total Complaints" 
        value={totalComplaints} 
        type="customers"
        gradient="from-red-600 to-red-700"
      />
      <Card 
        title="Pending Review" 
        value={pendingApplications} 
        type="pending"
        gradient="from-yellow-600 to-yellow-700"
      />
      <Card 
        title="Approved Drivers" 
        value={approvedApplications} 
        type="collected"
        gradient="from-green-600 to-green-700"
      />
    </>
  );
}

export function Card({
  title,
  value,
  type,
  gradient,
}: {
  title: string;
  value: number | string;
  type: 'invoices' | 'customers' | 'pending' | 'collected';
  gradient: string;
}) {
  const iconMap = {
    collected: BanknotesIcon,
    customers: ExclamationCircleIcon,
    pending: ClockIcon,
    invoices: UserGroupIcon,
  };

  const Icon = iconMap[type];

  return (
    <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 shadow-lg border border-gray-100 dark:border-gray-700 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      {/* Background Decoration */}
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-5 dark:opacity-10`} />
      
      {/* Icon Container */}
      <div className={`mb-4 inline-flex rounded-xl bg-gradient-to-br ${gradient} p-3 shadow-lg`}>
        {Icon && <Icon className="h-6 w-6 text-white" />}
      </div>
      
      {/* Content */}
      <div>
        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
        <p className={`${lusitana.className} mt-2 text-3xl font-bold text-gray-900 dark:text-white`}>
          {value}
        </p>
      </div>
      
      {/* Subtle Border Gradient */}
      <div className={`absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r ${gradient}`} />
    </div>
  );
}