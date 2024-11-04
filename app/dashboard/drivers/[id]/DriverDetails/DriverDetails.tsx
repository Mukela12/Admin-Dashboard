"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DriverApplication } from "@/app/lib/types";

interface DriverDetailsProps {
  application: DriverApplication;
  onBack: () => void;
}

const DriverDetails: React.FC<DriverDetailsProps> = ({ application, onBack }) => {
  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [bookingClass, setBookingClass] = useState<string[]>([]);
  const [deliveryClass, setDeliveryClass] = useState<string[]>([]);
  const [applicationData, setApplicationData] = useState<DriverApplication>(application);
  const [denialReason, setDenialReason] = useState<string>(''); // State for denial reason
  const [message, setMessage] = useState<string | null>(null); // State for messages
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
      await fetchApplication(); // Refetch application data
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
      await fetchApplication(); // Refetch application data
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
      <button onClick={onBack} className="mb-4 text-blue-600 hover:underline">Back to Applications</button>
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
            <h4 className="font-semibold text-gray-800">Booking Class</h4>
            {["bantu-economy", "bantu-comfort", "bantu-executive"].map((option) => (
              <label key={option} className="block text-gray-700">
                <input
                  type="checkbox"
                  value={option}
                  checked={bookingClass.includes(option)}
                  onChange={() => handleCheckboxChange(option, 'booking')}
                  className="mr-2"
                />
                {option.replace("bantu-", "").replace(/-/g, " ").toUpperCase()}
              </label>
            ))}
          </div>
          <div>
            <h4 className="font-semibold text-gray-800">Delivery Class</h4>
            {["bantu-micro", "bantu-regular", "bantu-macro"].map((option) => (
              <label key={option} className="block text-gray-700">
                <input
                  type="checkbox"
                  value={option}
                  checked={deliveryClass.includes(option)}
                  onChange={() => handleCheckboxChange(option, 'delivery')}
                  className="mr-2"
                />
                {option.replace("bantu-", "").replace(/-/g, " ").toUpperCase()}
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Denial Reason Input */}
      <div className="mt-4">
        <label className="block text-gray-700 font-bold mb-2" htmlFor="denialReason">Reason for Denial:</label>
        <textarea
          id="denialReason"
          value={denialReason}
          onChange={(e) => setDenialReason(e.target.value)}
          rows={4}
          className="w-full p-2 border border-gray-300 rounded-lg"
          placeholder="Provide reason for denial (if applicable)"
        />
      </div>

      {/* Action Buttons */}
      <div className="mt-6 flex justify-between">
        <button onClick={handleApprove} className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600">
          Approve
        </button>
        <button onClick={handleDeny} className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600">
          Deny
        </button>
      </div>

      {/* Message Display */}
      {message && <p className="mt-4 text-red-500">{message}</p>}

      {/* Image Modal */}
      {isModalOpen && selectedImage && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-4">
            <img src={selectedImage} alt="Large View" className="max-w-full max-h-80" />
            <button onClick={closeModal} className="mt-2 bg-gray-500 text-white px-4 py-2 rounded">Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DriverDetails;
