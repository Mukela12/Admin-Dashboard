"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeftIcon, CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import { ChildPickupApplication } from "@/app/lib/types";

const ChildPickupDetails: React.FC<{ application: ChildPickupApplication; onBack: () => void }> = ({ application, onBack }) => {
  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [denialReason, setDenialReason] = useState("");
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const router = useRouter();

  const updatedAtDate = application.updatedAt ? new Date(application.updatedAt) : null;

  const openModal = (image: string) => {
    setSelectedImage(image);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedImage(null);
  };

  const handleApprove = async () => {
    const response = await fetch("https://banturide-api-production.up.railway.app/admin/approve-child-pickup-application", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ applicationId: application.id, driverId: application.driverId }),
    });
    if (response.ok) {
      setMessage({ text: "Application approved successfully", type: "success" });
      fetchUpdatedApplication();
    } else {
      setMessage({ text: "Failed to approve application", type: "error" });
    }
  };

  const handleDeny = async () => {
    if (!denialReason) {
      setMessage({ text: "Please provide a reason for denial", type: "error" });
      return;
    }
    const response = await fetch("https://banturide-api-production.up.railway.app/admin/deny-child-pickup-application", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ applicationId: application.id, driverId: application.driverId, reason: denialReason }),
    });
    if (response.ok) {
      setMessage({ text: "Application denied successfully", type: "success" });
      fetchUpdatedApplication();
    } else {
      setMessage({ text: "Failed to deny application", type: "error" });
    }
  };

  const fetchUpdatedApplication = async () => {
    const response = await fetch(`https://banturide-api-production.up.railway.app/admin/get-child-pickup-application/${application.id}`);
    if (response.ok) {
      const updatedApplication: ChildPickupApplication = await response.json();
      // Update state or handle refresh
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <span className="status-badge status-approved">Approved</span>;
      case "pending":
        return <span className="status-badge status-pending">Pending</span>;
      case "denied":
        return <span className="status-badge status-failed">Denied</span>;
      default:
        return <span className="status-badge bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">Unknown</span>;
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
            <p className="text-gray-600 dark:text-gray-400 mt-1">Review application details</p>
          </div>
          <div>{getStatusBadge(application.childPickUpStatus)}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 sticky top-6 border border-gray-100 dark:border-gray-700">
            <div className="text-center mb-6">
              <div className="relative inline-block">
                <Image src="/placeholder.png" alt={application.fullName} width={120} height={120} className="rounded-full border-4 border-blue-100 dark:border-blue-900" />
              </div>
              <h2 className="mt-4 text-xl font-bold text-gray-900 dark:text-white">{application.fullName}</h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="font-semibold text-gray-900 dark:text-white">Driver ID: {application.driverId}</p>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="font-semibold text-gray-900 dark:text-white">Updated: {updatedAtDate?.toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Emergency Contact</h3>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Name</p>
                <p className="font-semibold text-gray-900 dark:text-white">{application.emergencyContactDetails.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Phone</p>
                <p className="font-semibold text-gray-900 dark:text-white">{application.emergencyContactDetails.phoneNumber}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Relationship</p>
                <p className="font-semibold text-gray-900 dark:text-white">{application.emergencyContactDetails.relationship}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">References</h3>
            <ul className="space-y-4">
              {application.references.map((ref, index) => (
                <li key={index} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <p className="font-semibold text-gray-900 dark:text-white">{ref.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Phone: {ref.phoneNumber}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Relationship: {ref.relationship}</p>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Police Clearance</h3>
            <div className="relative rounded-xl overflow-hidden border border-gray-200 dark:border-gray-600 hover:shadow-lg transition-shadow">
              <Image
                src={application.policeClearanceDocument}
                alt="Police Clearance"
                width={300}
                height={200}
                className="w-full h-48 object-cover cursor-pointer"
                onClick={() => openModal(application.policeClearanceDocument)}
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                <p className="text-white text-sm font-medium">Police Clearance</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Denial Reason</h3>
            <textarea
              value={denialReason}
              onChange={(e) => setDenialReason(e.target.value)}
              rows={4}
              className="modern-input"
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
            <div className={`p-4 rounded-xl ${message.type === "success" ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400" : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"}`}>
              {message.text}
            </div>
          )}
        </div>
      </div>

      {isModalOpen && selectedImage && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 max-w-4xl max-h-[90vh] overflow-auto">
            <img src={selectedImage} alt="Full View" className="w-full h-auto rounded-lg" />
            <button onClick={closeModal} className="mt-4 w-full btn-secondary">
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChildPickupDetails;