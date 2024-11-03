"use client";

import { useState, useEffect } from 'react';
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

    console.log( "Response: ",applicationData.id, applicationData.driverId, bookingClass, deliveryClass);  

    if (response.ok) {
      console.log( "Response: ",response);
      setMessage("Driver approved successfully");
      await fetchApplication(); 
    } else {
      console.log( "Response: ",response);
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
      console.log( "Response: ",response);
      setMessage("Driver denied successfully");
      await fetchApplication(); 
    } else {
      console.log( "Response: ",response);
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
        <div className="flex flex-col items-center sm:items-start">
          <img src={applicationData.avatar || ''} alt="Driver Avatar" className="w-32 h-32 rounded-full border-4 border-blue-500 shadow-lg" />
          <h2 className="mt-4 text-2xl font-semibold">{applicationData.carMake} {applicationData.carModel}</h2>
          <p className="mt-1 text-lg font-bold text-gray-700"><span className="text-blue-500">Driver ID:</span> {applicationData.driverId}</p>
          <p className="text-lg font-bold text-gray-700"><span className="text-blue-500">NRC:</span> {applicationData.nrc}</p>
          <p className="text-lg font-bold text-gray-700"><span className="text-blue-500">Created At:</span> {createdAtDate?.toLocaleDateString()}</p>
          <p className="text-lg font-bold text-gray-700"><span className="text-blue-500">Verification Status:</span> {applicationData.driverVerificationStatus}</p>
        </div>

        <div className="col-span-2 space-y-4">
          <h3 className="text-xl font-bold text-gray-900">Vehicle Information</h3>
          <div className="bg-gray-100 p-4 rounded-lg shadow-sm">
            <p className="font-medium text-gray-700"><span className="font-bold">Vehicle Registration:</span> {applicationData.vehicleReg}</p>
            <p className="font-medium text-gray-700"><span className="font-bold">Seats:</span> {applicationData.seats}</p>
            <p className="font-medium text-gray-700"><span className="font-bold">Color:</span> {applicationData.carColor}</p>
            <p className="font-medium text-gray-700"><span className="font-bold">License Number:</span> {applicationData.licenseNumber}</p>
            <p className="font-medium text-gray-700"><span className="font-bold">License Expiry:</span> {applicationData.licenseExpiry}</p>
          </div>

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
          
          <h3 className="text-xl font-bold text-gray-900">Actions</h3>
          <div className="space-y-4">
            <textarea
              placeholder="Reason for denial (if any)"
              value={denialReason}
              onChange={(e) => setDenialReason(e.target.value)}
              className="w-full p-2 border rounded-md"
            />
            <div className="flex space-x-4">
              <button
                onClick={handleApprove}
                className="bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600"
              >
                Approve
              </button>
              <button
                onClick={handleDeny}
                className="bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600"
              >
                Deny
              </button>
            </div>
            {message && <p className="text-red-500">{message}</p>}
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-black opacity-50 absolute inset-0" onClick={closeModal}></div>
          <div className="bg-white rounded-lg p-6 z-10">
            <img src={selectedImage || ''} alt="Modal" className="w-full h-96 object-cover" />
            <button className="mt-4 text-blue-600" onClick={closeModal}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DriverDetails; // Make sure this is a valid export
