"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DriverApplication } from "@/app/lib/types";
import { ArrowLeftIcon, CheckCircleIcon, XCircleIcon, CalendarIcon, IdentificationIcon, PhoneIcon, StarIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import { useConfirm } from '@/app/lib/hooks/useConfirm';
import { useToast } from '@/app/lib/hooks/useToast';

interface DriverDetailsProps {
  application: DriverApplication;
  onBack: () => void;
}

const DriverDetails: React.FC<DriverDetailsProps> = ({ application, onBack }) => {
  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [rideClasses, setRideClasses] = useState<string[]>([]);
  const [deliveryClasses, setDeliveryClasses] = useState<string[]>([]);
  const [applicationData, setApplicationData] = useState<DriverApplication>(application);
  const [denialReason, setDenialReason] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const { confirm } = useConfirm();
  const { showToast } = useToast();
  const router = useRouter();

  // Fix timestamp handling - handle both Firebase timestamp and regular number
  const createdAtDate = applicationData.createdAt
    ? typeof applicationData.createdAt === 'number'
      ? new Date(applicationData.createdAt)
      : applicationData.createdAt._seconds
      ? new Date(applicationData.createdAt._seconds * 1000)
      : null
    : null;

  // Use a fixed locale and options
  const formattedDate = createdAtDate?.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const openModal = (image: string) => {
    setSelectedImage(image);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedImage(null);
  };

  const handleCheckboxChange = (value: string, type: 'booking' | 'delivery') => {
    if (type === 'booking') {
      setRideClasses((prev) =>
        prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]
      );
    } else {
      setDeliveryClasses((prev) =>
        prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]
      );
    }
  };

  const handleApprove = async () => {
    if (rideClasses.length === 0 && deliveryClasses.length === 0) {
      showToast('Please select at least one service class', 'error');
      return;
    }

    const confirmed = await confirm({
      title: 'Approve Driver Application',
      message: `Are you sure you want to approve ${applicationData.driverFullName}? This will grant them access to the platform.`,
      confirmText: 'Approve',
      variant: 'success',
    });

    if (!confirmed) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/drivers/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicationId: applicationData.id,
          driverId: applicationData.driverId,
          rideClasses,
          deliveryClasses,
        }),
      });

      if (response.ok) {
        showToast('Driver approved successfully', 'success');
        await fetchApplication();
      } else {
        showToast('Failed to approve driver', 'error');
      }
    } catch (error) {
      showToast('An error occurred', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeny = async () => {
    if (!denialReason.trim()) {
      showToast('Please provide a reason for denial', 'error');
      return;
    }

    const confirmed = await confirm({
      title: 'Deny Driver Application',
      message: `Are you sure you want to deny ${applicationData.driverFullName}? They will be notified of this decision.`,
      confirmText: 'Deny',
      variant: 'danger',
    });

    if (!confirmed) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/drivers/deny', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicationId: applicationData.id,
          driverId: applicationData.driverId,
          reason: denialReason,
        }),
      });

      if (response.ok) {
        showToast('Driver denied successfully', 'success');
        await fetchApplication();
      } else {
        showToast('Failed to deny driver', 'error');
      }
    } catch (error) {
      showToast('An error occurred', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchApplication = async () => {
    try {
      const response = await fetch(`/api/dashboard/applications/${applicationData.id}`);
      if (response.ok) {
        const data = await response.json();
        if (data.application) {
          setApplicationData(data.application);
        }
      } else {
        showToast('Failed to fetch updated application data', 'error');
      }
    } catch (error) {
      showToast('Error refreshing application', 'error');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <span className="status-badge status-approved">Approved</span>;
      case 'pending':
        return <span className="status-badge status-pending">Pending</span>;
      case 'failed':
      case 'denied':
      case 'rejected':
        return <span className="status-badge status-failed">Denied</span>;
      default:
        return <span className="status-badge bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">Unknown</span>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white mb-4 transition-colors">
          <ArrowLeftIcon className="h-5 w-5" />
          Back to Applications
        </button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Driver Profile</h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">Review driver application details</p>
          </div>
          <div>{getStatusBadge(applicationData.driverVerificationStatus)}</div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Driver Info */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 sticky top-6 border border-slate-100 dark:border-slate-700">
            {/* Avatar */}
            <div className="text-center mb-6">
              <div className="relative inline-block">
                <Image
                  src={applicationData.avatar || '/placeholder.png'}
                  alt="Driver Avatar"
                  width={120}
                  height={120}
                  className="rounded-full border-4 border-blue-100 dark:border-blue-900"
                />
              </div>
              <h2 className="mt-4 text-xl font-bold text-slate-900 dark:text-white">
                {applicationData.driverFullName || 'Unknown Driver'}
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {applicationData.carMake} {applicationData.carModel}
              </p>
            </div>

            {/* Basic Info */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                <PhoneIcon className="h-5 w-5 text-slate-600 dark:text-slate-300" />
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Phone Number</p>
                  <p className="font-semibold text-slate-900 dark:text-white">
                    {applicationData.driverPhoneNumber || 'N/A'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                <IdentificationIcon className="h-5 w-5 text-slate-600 dark:text-slate-300" />
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">NRC</p>
                  <p className="font-semibold text-slate-900 dark:text-white">{applicationData.nrc}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                <CalendarIcon className="h-5 w-5 text-slate-600 dark:text-slate-300" />
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Application Date</p>
                  <p className="font-semibold text-slate-900 dark:text-white">{formattedDate || 'N/A'}</p>
                </div>
              </div>

              {/* Driver Rating and Status */}
              {applicationData.driverRating && (
                <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                  <StarIcon className="h-5 w-5 text-yellow-500" />
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Rating</p>
                    <p className="font-semibold text-slate-900 dark:text-white">
                      {applicationData.driverRating}/5
                    </p>
                  </div>
                </div>
              )}

              {applicationData.driverStatus && (
                <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                  <div className={`w-3 h-3 rounded-full ${
                    applicationData.driverStatus === 'online' ? 'bg-green-500' : 'bg-slate-400'
                  }`}></div>
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Status</p>
                    <p className="font-semibold text-slate-900 dark:text-white capitalize">
                      {applicationData.driverStatus}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Details */}
        <div className="lg:col-span-2 space-y-8">
          {/* Vehicle Information */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 border border-slate-100 dark:border-slate-700">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Vehicle Information</h3>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Make</p>
                <p className="font-semibold text-slate-900 dark:text-white">{applicationData.carMake}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Model</p>
                <p className="font-semibold text-slate-900 dark:text-white">{applicationData.carModel}</p>
              </div>
              
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Registration</p>
                <p className="font-semibold text-slate-900 dark:text-white">{applicationData.vehicleReg}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Seats</p>
                <p className="font-semibold text-slate-900 dark:text-white">{applicationData.seats}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Color</p>
                <p className="font-semibold text-slate-900 dark:text-white">{applicationData.carColor}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">License Number</p>
                <p className="font-semibold text-slate-900 dark:text-white">{applicationData.licenseNumber}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">License Expiry</p>
                <p className="font-semibold text-slate-900 dark:text-white">{applicationData.licenseExpiry}</p>
              </div>
            </div>
          </div>

          {/* Service Capabilities */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 border border-slate-100 dark:border-slate-700">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Service Capabilities</h3>
            <div className="grid grid-cols-2 gap-6">
              <div className="flex items-center gap-3">
                <div className={`w-4 h-4 rounded-full ${applicationData.canDriver ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-slate-700 dark:text-slate-300">Can Drive</span>
              </div>
              <div className="flex items-center gap-3">
                <div className={`w-4 h-4 rounded-full ${applicationData.canDeliver ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-slate-700 dark:text-slate-300">Can Deliver</span>
              </div>
            </div>
          </div>

          {/* Document Images */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 border border-slate-100 dark:border-slate-700">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Documents</h3>
            <div className="grid grid-cols-2 gap-4">
              {[
                { src: applicationData.insuranceCertificate, title: "Insurance Certificate" },
                { src: applicationData.driversLicenseImage, title: "Driver's License" },
                { src: applicationData.vehicleImage1, title: "Vehicle Image 1" },
                { src: applicationData.vehicleImage2, title: "Vehicle Image 2" }
              ].map((doc, index) => (
                <div key={index} className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-600 hover:shadow-lg transition-shadow">
                  <Image
                    src={doc.src || '/placeholder.png'}
                    alt={doc.title}
                    width={300}
                    height={200}
                    className="w-full h-48 object-cover cursor-pointer"
                    onClick={() => doc.src && openModal(doc.src)}
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                    <p className="text-white text-sm font-medium">{doc.title}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Class Selection */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 border border-slate-100 dark:border-slate-700">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Service Classes</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-4">Ride Classes</h4>
                {["bantu-economy", "bantu-comfort", "bantu-executive"].map((option) => (
                  <label key={option} className="flex items-center gap-3 mb-3 cursor-pointer">
                    <input
                      type="checkbox"
                      value={option}
                      checked={rideClasses.includes(option)}
                      onChange={() => handleCheckboxChange(option, 'booking')}
                      className="w-4 h-4 text-blue-600 border-slate-300 dark:border-slate-600 rounded focus:ring-blue-500"
                    />
                    <span className="text-slate-700 dark:text-slate-300 capitalize">
                      {option.replace("bantu-", "").replace(/-/g, " ")}
                    </span>
                  </label>
                ))}
              </div>
              <div>
                <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-4">Delivery Classes</h4>
                {["bantu-micro", "bantu-regular", "bantu-macro"].map((option) => (
                  <label key={option} className="flex items-center gap-3 mb-3 cursor-pointer">
                    <input
                      type="checkbox"
                      value={option}
                      checked={deliveryClasses.includes(option)}
                      onChange={() => handleCheckboxChange(option, 'delivery')}
                      className="w-4 h-4 text-blue-600 border-slate-300 dark:border-slate-600 rounded focus:ring-blue-500"
                    />
                    <span className="text-slate-700 dark:text-slate-300 capitalize">
                      {option.replace("bantu-", "").replace(/-/g, " ")}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Denial Reason */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 border border-slate-100 dark:border-slate-700">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Denial Reason</h3>
            <textarea
              value={denialReason}
              onChange={(e) => setDenialReason(e.target.value)}
              rows={4}
              className="modern-input"
              placeholder="Provide reason for denial (required for denial)"
            />
          </div>

          {/* Action Buttons */}
          {applicationData.driverVerificationStatus === 'pending' && (
            <div className="flex gap-4">
              <button
                onClick={handleApprove}
                disabled={isLoading}
                className="btn-success flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <CheckCircleIcon className="h-5 w-5 inline mr-2" />
                {isLoading ? 'Processing...' : 'Approve Application'}
              </button>
              <button
                onClick={handleDeny}
                disabled={isLoading}
                className="btn-danger flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <XCircleIcon className="h-5 w-5 inline mr-2" />
                {isLoading ? 'Processing...' : 'Deny Application'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Image Modal */}
      {isModalOpen && selectedImage && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 max-w-4xl max-h-[90vh] overflow-auto">
            <img src={selectedImage} alt="Full View" className="w-full h-auto rounded-lg" />
            <button 
              onClick={closeModal} 
              className="mt-4 w-full btn-secondary"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DriverDetails;