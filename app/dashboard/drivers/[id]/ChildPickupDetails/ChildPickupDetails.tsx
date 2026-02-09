"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeftIcon, CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import { ChildPickupApplication } from "@/app/lib/types";
import { useConfirm } from "@/app/lib/hooks/useConfirm";
import { useToast } from "@/app/lib/hooks/useToast";

const ChildPickupDetails: React.FC<{ application: ChildPickupApplication; onBack: () => void }> = ({ application, onBack }) => {
  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [denialReason, setDenialReason] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { confirm } = useConfirm();
  const { showToast } = useToast();

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
    const confirmed = await confirm({
      title: "Approve Child Pickup Application",
      message: `Are you sure you want to approve ${application.fullName}'s child pickup application?`,
      confirmText: "Approve",
      variant: "success",
    });
    if (!confirmed) return;

    setIsLoading(true);
    try {
      const response = await fetch("/api/child-pickup/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationId: application.id, driverId: application.driverId }),
      });
      if (response.ok) {
        showToast("Application approved successfully", "success");
        fetchUpdatedApplication();
      } else {
        showToast("Failed to approve application", "error");
      }
    } catch (error) {
      showToast("Error approving application", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeny = async () => {
    if (!denialReason) {
      showToast("Please provide a reason for denial", "error");
      return;
    }

    const confirmed = await confirm({
      title: "Deny Child Pickup Application",
      message: `Are you sure you want to deny ${application.fullName}'s child pickup application?`,
      confirmText: "Deny",
      variant: "danger",
    });
    if (!confirmed) return;

    setIsLoading(true);
    try {
      const response = await fetch("/api/child-pickup/deny", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationId: application.id, reason: denialReason }),
      });
      if (response.ok) {
        showToast("Application denied successfully", "success");
        fetchUpdatedApplication();
      } else {
        showToast("Failed to deny application", "error");
      }
    } catch (error) {
      showToast("Error denying application", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUpdatedApplication = async () => {
    try {
      const response = await fetch(`/api/dashboard/child-pickup-applications/${application.id}`);
      if (response.ok) {
        const data = await response.json();
        // Update state or handle refresh
      }
    } catch (error) {
      console.error('Error fetching updated application:', error);
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
        return <span className="status-badge bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">Unknown</span>;
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
            <p className="text-slate-600 dark:text-slate-400 mt-1">Review application details</p>
          </div>
          <div>{getStatusBadge(application.childPickUpStatus)}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 sticky top-6 border border-slate-100 dark:border-slate-700">
            <div className="text-center mb-6">
              <div className="relative inline-block">
                <Image src="/placeholder.png" alt={application.fullName} width={120} height={120} className="rounded-full border-4 border-blue-100 dark:border-blue-900" />
              </div>
              <h2 className="mt-4 text-xl font-bold text-slate-900 dark:text-white">{application.fullName}</h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                <p className="font-semibold text-slate-900 dark:text-white">Driver ID: {application.driverId}</p>
              </div>
              <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                <p className="font-semibold text-slate-900 dark:text-white">Updated: {updatedAtDate?.toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 border border-slate-100 dark:border-slate-700">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Emergency Contact</h3>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Name</p>
                <p className="font-semibold text-slate-900 dark:text-white">{application.emergencyContactDetails?.name || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Phone</p>
                <p className="font-semibold text-slate-900 dark:text-white">{application.emergencyContactDetails?.phoneNumber || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Relationship</p>
                <p className="font-semibold text-slate-900 dark:text-white">{application.emergencyContactDetails?.relationship || '-'}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 border border-slate-100 dark:border-slate-700">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">References</h3>
            <ul className="space-y-4">
              {application.references.map((ref, index) => (
                <li key={index} className="p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                  <p className="font-semibold text-slate-900 dark:text-white">{ref.name}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Phone: {ref.phoneNumber}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Relationship: {ref.relationship}</p>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 border border-slate-100 dark:border-slate-700">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Police Clearance</h3>
            <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-600 hover:shadow-lg transition-shadow">
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

          <div className="flex gap-4">
            <button onClick={handleApprove} disabled={isLoading} className="btn-success flex-1 disabled:opacity-50 disabled:cursor-not-allowed">
              <CheckCircleIcon className="h-5 w-5 inline mr-2" />
              {isLoading ? "Processing..." : "Approve Application"}
            </button>
            <button onClick={handleDeny} disabled={isLoading} className="btn-danger flex-1 disabled:opacity-50 disabled:cursor-not-allowed">
              <XCircleIcon className="h-5 w-5 inline mr-2" />
              {isLoading ? "Processing..." : "Deny Application"}
            </button>
          </div>
        </div>
      </div>

      {isModalOpen && selectedImage && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 max-w-4xl max-h-[90vh] overflow-auto">
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