// app/dashboard/drivers/[id]/DriverDetailsClient.tsx
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface DriverApplication {
  id: string;
  driverId: string;
  avatar: string;
  insuranceCertificateImage?: string | null;
  driversLicenseImage?: string | null;
  seats: string;
  vehicleImage1: string;
  vehicleImage2: string;
  canDriver: boolean;
  canDeliver: boolean;
  carColor: string;
  licenseExpiry: string;
  licenseNumber: string;
  vehicleReg: string;
  carMake: string;
  carModel: string;
  nrc: string;
  createdAt: {
    _seconds: number;
    _nanoseconds: number;
  } | null;
  driverVerificationStatus: string;
}

interface DriverDetailsClientProps {
  application: DriverApplication;
}

export default function DriverDetailsClient({ application }: DriverDetailsClientProps) {
  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [bookingClass, setBookingClass] = useState<string[]>([]);
  const [deliveryClass, setDeliveryClass] = useState<string[]>([]);
  const [applicationData, setApplicationData] = useState<DriverApplication>(application);
  const [denialReason, setDenialReason] = useState<string>('');
  const [message, setMessage] = useState<string | null>(null);
  const router = useRouter();

  const createdAtDate = applicationData.createdAt ? new Date(applicationData.createdAt._seconds * 1000) : null;

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
      setBookingClass((prev) =>
        prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]
      );
    } else {
      setDeliveryClass((prev) =>
        prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]
      );
    }
  };

  const handleApprove = async () => {
    const response = await fetch("https://banturide-api.onrender.com/admin/approve-driver-application", {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        applicationId: applicationData.id,
        driverId: applicationData.driverId,
        bookingClass,
        deliveryClass,
      }),
    });

    if (response.ok) {
      setMessage("Driver approved successfully");
      await fetchApplication();
    } else {
      setMessage("Failed to approve driver");
    }
  };

  const handleDeny = async () => {
    if (!denialReason) {
      setMessage("Please provide a reason for denial.");
      return;
    }

    const response = await fetch("https://banturide-api.onrender.com/admin/deny-driver-application", {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        applicationId: applicationData.id,
        driverId: applicationData.driverId,
        reason: denialReason,
      }),
    });

    if (response.ok) {
      setMessage("Driver denied successfully");
      await fetchApplication();
    } else {
      setMessage("Failed to deny driver");
    }
  };

  const fetchApplication = async () => {
    const response = await fetch(`https://banturide-api.onrender.com/admin/get-driver-application/${applicationData.id}`);
    if (response.ok) {
      const updatedApplication: DriverApplication = await response.json();
      setApplicationData(updatedApplication);
    } else {
      setMessage("Failed to fetch updated application data");
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <button onClick={() => router.back()} className="mb-4 text-blue-600 hover:underline">Back to Applications</button>
      {/* Rest of your JSX remains exactly the same */}
      <h1 className="mb-6 text-4xl font-bold text-gray-900">Driver Profile</h1>

      <div className="bg-white rounded-lg shadow-lg p-6 grid grid-cols-1 sm:grid-cols-3 gap-6">
        {/* Avatar and Basic Info */}
        <div className="flex flex-col items-center sm:items-start">
          <img src={applicationData.avatar || ''} alt="Driver Avatar" className="w-32 h-32 rounded-full border-4 border-blue-500 shadow-lg" />
          <h2 className="mt-4 text-2xl font-semibold">{applicationData.carMake} {applicationData.carModel}</h2>
          <p className="mt-1 text-lg font-bold text-gray-700"><span className="text-blue-500">Driver ID:</span> {applicationData.driverId}</p>
          <p className="text-lg font-bold text-gray-700"><span className="text-blue-500">NRC:</span> {applicationData.nrc}</p>
          <p className="text-lg font-bold text-gray-700"><span className="text-blue-500">Created At:</span> {createdAtDate?.toLocaleDateString()}</p>
          <p className="text-lg font-bold text-gray-700"><span className="text-blue-500">Verification Status:</span> {applicationData.driverVerificationStatus}</p>
        </div>

        {/* Vehicle Details */}
        <div className="col-span-2 space-y-4">
          <h3 className="text-xl font-bold text-gray-900">Vehicle Information</h3>
          <div className="bg-gray-100 p-4 rounded-lg shadow-sm">
            <p className="font-medium text-gray-700"><span className="font-bold">Vehicle Registration:</span> {applicationData.vehicleReg}</p>
            <p className="font-medium text-gray-700"><span className="font-bold">Seats:</span> {applicationData.seats}</p>
            <p className="font-medium text-gray-700"><span className="font-bold">Color:</span> {applicationData.carColor}</p>
            <p className="font-medium text-gray-700"><span className="font-bold">License Number:</span> {applicationData.licenseNumber}</p>
            <p className="font-medium text-gray-700"><span className="font-bold">License Expiry:</span> {applicationData.licenseExpiry}</p>
          </div>

          {/* Images Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <img
                src={applicationData.insuranceCertificateImage || ''}
                alt="Insurance Certificate"
                className="w-full h-32 object-cover cursor-pointer"
                onClick={() => openModal(applicationData.insuranceCertificateImage || '')}
              />
              <p className="p-2 font-medium text-gray-600">Insurance Certificate</p>
            </div>
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <img
                src={applicationData.driversLicenseImage || ''}
                alt="Driver's License"
                className="w-full h-32 object-cover cursor-pointer"
                onClick={() => openModal(applicationData.driversLicenseImage || '')}
              />
              <p className="p-2 font-medium text-gray-600">Driver's License</p>
            </div>
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <img
                src={applicationData.vehicleImage1 || ''}
                alt="Vehicle Image 1"
                className="w-full h-32 object-cover cursor-pointer"
                onClick={() => openModal(applicationData.vehicleImage1)}
              />
              <p className="p-2 font-medium text-gray-600">Vehicle Image 1</p>
            </div>
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <img
                src={applicationData.vehicleImage2 || ''}
                alt="Vehicle Image 2"
                className="w-full h-32 object-cover cursor-pointer"
                onClick={() => openModal(applicationData.vehicleImage2)}
              />
              <p className="p-2 font-medium text-gray-600">Vehicle Image 2</p>
            </div>
          </div>
        </div>
      </div>

      {/* Class Selection */}
      <div className="mt-6 bg-gray-100 p-4 rounded-lg shadow">
        <h3 className="text-xl font-bold text-gray-900">Select Classes</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
          <div>
            <h4 className="font-semibold">Booking Class:</h4>
            {['bantu-economy', 'bantu-comfort', 'bantu-executive'].map((value) => (
              <label key={value} className="block">
                <input
                  type="checkbox"
                  checked={bookingClass.includes(value)}
                  onChange={() => handleCheckboxChange(value, 'booking')}
                  className="mr-2"
                />
                {value}
              </label>
            ))}
          </div>
          <div>
            <h4 className="font-semibold">Delivery Class:</h4>
            {['bantu-micro', 'bantu-regular', 'bantu-macro'].map((value) => (
              <label key={value} className="block">
                <input
                  type="checkbox"
                  checked={deliveryClass.includes(value)}
                  onChange={() => handleCheckboxChange(value, 'delivery')}
                  className="mr-2"
                />
                {value}
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Denial Reason Input */}
      <div className="mt-6">
        <label htmlFor="denialReason" className="block text-sm font-medium text-gray-700">
          Reason for Denial (if applicable):
        </label>
        <textarea
          id="denialReason"
          value={denialReason}
          onChange={(e) => setDenialReason(e.target.value)}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-blue-500 p-2"
          rows={3}
          placeholder="Please provide a reason for denial..."
        />
      </div>

      {/* Action Buttons */}
      <div className="mt-6 flex space-x-4">
        <button
          onClick={handleApprove}
          className="flex-1 py-2 px-4 bg-green-600 text-white rounded-lg shadow hover:bg-green-500 focus:outline-none"
        >
          Approve
        </button>
        <button
          onClick={handleDeny}
          className="flex-1 py-2 px-4 bg-red-600 text-white rounded-lg shadow hover:bg-red-500 focus:outline-none"
        >
          Deny
        </button>
      </div>

      {/* Message Display */}
      {message && (
        <div className={`mt-4 text-lg font-semibold ${message.startsWith("Failed") ? "text-red-500" : "text-green-500"}`}>
          {message}
        </div>
      )}

      {/* Image Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-4 rounded-lg relative">
            <button onClick={closeModal} className="absolute top-2 right-2 text-gray-600 hover:text-gray-900">Close</button>
            {selectedImage && <img src={selectedImage} alt="Selected" className="max-w-full max-h-full" />}
          </div>
        </div>
      )}
    </div>
  );
}