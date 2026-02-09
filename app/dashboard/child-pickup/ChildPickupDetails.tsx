'use client';

import { useState } from 'react';
import { ArrowLeftIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import { ChildPickupApplication } from '@/app/lib/types';
import { useRouter } from 'next/navigation';
import { useConfirm } from '@/app/lib/hooks/useConfirm';
import { useToast } from '@/app/lib/hooks/useToast';

interface ChildPickupDetailsProps {
  application: ChildPickupApplication;
  onBack: () => void;
}

export default function ChildPickupDetails({ application, onBack }: ChildPickupDetailsProps) {
  const [denialReason, setDenialReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { confirm } = useConfirm();
  const { showToast } = useToast();

  const handleApprove = async () => {
    const confirmed = await confirm({
      title: 'Approve Child Pickup Application',
      message: `Are you sure you want to approve ${application.fullName}'s child pickup application?`,
      confirmText: 'Approve',
      variant: 'success',
    });
    if (!confirmed) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/child-pickup/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicationId: application.id,
          driverId: application.driverId,
        }),
      });
      if (response.ok) {
        showToast('Application approved successfully', 'success');
        setTimeout(onBack, 1500);
      } else {
        const errorData = await response.json();
        showToast(errorData.message || 'Failed to approve application', 'error');
      }
    } catch (error) {
      showToast('Error approving application', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeny = async () => {
    if (!denialReason) {
      showToast('Please provide a reason for denial', 'error');
      return;
    }

    const confirmed = await confirm({
      title: 'Deny Child Pickup Application',
      message: `Are you sure you want to deny ${application.fullName}'s child pickup application?`,
      confirmText: 'Deny',
      variant: 'danger',
    });
    if (!confirmed) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/child-pickup/deny', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicationId: application.id,
          reason: denialReason,
        }),
      });
      if (response.ok) {
        showToast('Application denied successfully', 'success');
        setTimeout(onBack, 1500);
      } else {
        const errorData = await response.json();
        showToast(errorData.message || 'Failed to deny application', 'error');
      }
    } catch (error) {
      showToast('Error denying application', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white mb-4 transition-colors">
          <ArrowLeftIcon className="h-5 w-5" />
          Back to Applications
        </button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Child Pickup Application</h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">Review driver application for child pickup</p>
          </div>
          <span className={`status-badge ${application.childPickUpStatus === 'approved' ? 'status-approved' : application.childPickUpStatus === 'pending' ? 'status-pending' : 'status-failed'}`}>
            {application.childPickUpStatus.charAt(0).toUpperCase() + application.childPickUpStatus.slice(1)}
          </span>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 sticky top-6 border border-slate-100 dark:border-slate-700">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">{application.fullName}</h2>
            <p className="text-slate-600 dark:text-slate-400">Driver ID: {application.driverId}</p>
          </div>
        </div>
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 border border-slate-100 dark:border-slate-700">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Emergency Contact</h3>
            <p><strong>Name:</strong> {application.emergencyContactDetails?.name || '-'}</p>
            <p><strong>Phone:</strong> {application.emergencyContactDetails?.phoneNumber || '-'}</p>
            <p><strong>Relationship:</strong> {application.emergencyContactDetails?.relationship || '-'}</p>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 border border-slate-100 dark:border-slate-700">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Police Clearance Document</h3>
            <Image
              src={application.policeClearanceDocument || '/placeholder.png'}
              alt="Police Clearance"
              width={300}
              height={200}
              className="w-full h-48 object-cover cursor-pointer rounded-xl border border-slate-200 dark:border-slate-600"
              onClick={() => application.policeClearanceDocument && window.open(application.policeClearanceDocument, '_blank')}
            />
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 border border-slate-100 dark:border-slate-700">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">References</h3>
            {application.references.map((ref, index) => (
              <div key={index} className="p-4 bg-slate-50 dark:bg-slate-700 rounded-lg mb-2">
                <p><strong>Name:</strong> {ref.name}</p>
                <p><strong>Phone:</strong> {ref.phoneNumber}</p>
                <p><strong>Relationship:</strong> {ref.relationship}</p>
              </div>
            ))}
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 border border-slate-100 dark:border-slate-700">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Denial Reason</h3>
            <textarea
              value={denialReason}
              onChange={(e) => setDenialReason(e.target.value)}
              rows={4}
              className="modern-input w-full"
              placeholder="Provide reason for denial (required for denial)"
            />
          </div>
          <div className="flex gap-4">
            <button onClick={handleApprove} disabled={isLoading} className="btn-success flex-1 disabled:opacity-50 disabled:cursor-not-allowed">
              <CheckCircleIcon className="h-5 w-5 inline mr-2" />
              {isLoading ? 'Processing...' : 'Approve Application'}
            </button>
            <button onClick={handleDeny} disabled={isLoading} className="btn-danger flex-1 disabled:opacity-50 disabled:cursor-not-allowed">
              <XCircleIcon className="h-5 w-5 inline mr-2" />
              {isLoading ? 'Processing...' : 'Deny Application'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}