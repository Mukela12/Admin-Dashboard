'use client';

import { useState } from 'react';
import { ArrowLeftIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import { ChildPickupApplication } from '@/app/lib/types';
import { useRouter } from 'next/navigation';

interface ChildPickupDetailsProps {
  application: ChildPickupApplication;
  onBack: () => void;
}

export default function ChildPickupDetails({ application, onBack }: ChildPickupDetailsProps) {
  const [denialReason, setDenialReason] = useState('');
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const router = useRouter();

  const handleApprove = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setMessage({ text: 'Please log in to continue', type: 'error' });
      router.push('/login');
      return;
    }

    try {
      const response = await fetch('https://banturide-api-production.up.railway.app/admin/approve-child-pickup-application', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          applicationId: application.id,
          driverId: application.driverId,
        }),
      });
      if (response.ok) {
        setMessage({ text: 'Application approved successfully', type: 'success' });
        setTimeout(onBack, 1500);
      } else {
        const errorData = await response.json();
        setMessage({ text: errorData.message || 'Failed to approve application', type: 'error' });
      }
    } catch (error) {
      setMessage({ text: 'Error approving application: ' , type: 'error' });
    }
  };

  const handleDeny = async () => {
    if (!denialReason) {
      setMessage({ text: 'Please provide a reason for denial', type: 'error' });
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      setMessage({ text: 'Please log in to continue', type: 'error' });
      router.push('/login');
      return;
    }

    try {
      const response = await fetch('https://banturide-api-production.up.railway.app/admin/deny-child-pickup-application', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          applicationId: application.id,
          driverId: application.driverId,
          reason: denialReason,
        }),
      });
      if (response.ok) {
        setMessage({ text: 'Application denied successfully', type: 'success' });
        setTimeout(onBack, 1500);
      } else {
        const errorData = await response.json();
        setMessage({ text: errorData.message || 'Failed to deny application', type: 'error' });
      }
    } catch (error) {
      setMessage({ text: 'Error denying application: ' , type: 'error' });
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <button onClick={onBack} className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white mb-4 transition-colors">
          <ArrowLeftIcon className="h-5 w-5" />
          Back to Applications
        </button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Child Pickup Application</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Review driver application for child pickup</p>
          </div>
          <span className={`status-badge ${application.childPickUpStatus === 'approved' ? 'status-approved' : application.childPickUpStatus === 'pending' ? 'status-pending' : 'status-failed'}`}>
            {application.childPickUpStatus.charAt(0).toUpperCase() + application.childPickUpStatus.slice(1)}
          </span>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 sticky top-6 border border-gray-100 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{application.fullName}</h2>
            <p className="text-gray-600 dark:text-gray-400">Driver ID: {application.driverId}</p>
          </div>
        </div>
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Emergency Contact</h3>
            <p><strong>Name:</strong> {application.emergencyContactDetails.name}</p>
            <p><strong>Phone:</strong> {application.emergencyContactDetails.phoneNumber}</p>
            <p><strong>Relationship:</strong> {application.emergencyContactDetails.relationship}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Police Clearance Document</h3>
            <Image
              src={application.policeClearanceDocument || '/placeholder.png'}
              alt="Police Clearance"
              width={300}
              height={200}
              className="w-full h-48 object-cover cursor-pointer rounded-xl border border-gray-200 dark:border-gray-600"
              onClick={() => application.policeClearanceDocument && window.open(application.policeClearanceDocument, '_blank')}
            />
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">References</h3>
            {application.references.map((ref, index) => (
              <div key={index} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg mb-2">
                <p><strong>Name:</strong> {ref.name}</p>
                <p><strong>Phone:</strong> {ref.phoneNumber}</p>
                <p><strong>Relationship:</strong> {ref.relationship}</p>
              </div>
            ))}
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Denial Reason</h3>
            <textarea
              value={denialReason}
              onChange={(e) => setDenialReason(e.target.value)}
              rows={4}
              className="modern-input w-full"
              placeholder="Provide reason for denial (required for denial)"
            />
          </div>
          <div className="flex gap-4">
            <button onClick={handleApprove} className="btn-success flex-1">
              <CheckCircleIcon className="h-5 w-5 inline mr-2" />
              Approve Application
            </button>
            <button onClick={handleDeny} className="btn-danger flex-1">
              <XCircleIcon className="h-5 w-5 inline mr-2" />
              Deny Application
            </button>
          </div>
          {message && (
            <div className={`p-4 rounded-xl ${message.type === 'success' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'}`}>
              {message.text}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}