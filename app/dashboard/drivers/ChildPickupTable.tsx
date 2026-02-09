"use client";

import { useState, useEffect } from "react";
import { CheckCircleIcon, XCircleIcon, ExclamationCircleIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { ChildPickupApplication } from "@/app/lib/types";
import Image from "next/image";

interface ChildPickupTableProps {
  applications: ChildPickupApplication[];
  onSelect: (application: ChildPickupApplication) => void;
}

export default function ChildPickupTable({ applications, onSelect }: ChildPickupTableProps) {
  const [filteredApplications, setFilteredApplications] = useState<ChildPickupApplication[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    setFilteredApplications(applications || []);
  }, [applications]);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    const lowerCaseTerm = term.toLowerCase();
    setFilteredApplications(
      applications.filter((app) =>
        app.fullName.toLowerCase().includes(lowerCaseTerm) ||
        app.driverId.toLowerCase().includes(lowerCaseTerm)
      )
    );
  };

  const getStatusDetails = (status: string) => {
    switch (status) {
      case "approved":
        return { color: "status-approved", icon: <CheckCircleIcon className="h-4 w-4" /> };
      case "pending":
        return { color: "status-pending", icon: <ExclamationCircleIcon className="h-4 w-4" /> };
      case "denied":
        return { color: "status-failed", icon: <XCircleIcon className="h-4 w-4" /> };
      default:
        return { color: "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300", icon: null };
    }
  };

  return (
    <div className="w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Child Pickup Applications</h1>
        <p className="text-slate-600 dark:text-slate-400">Manage and review child pickup applications</p>
      </div>

      <div className="mb-6">
        <div className="relative max-w-md">
          <input
            type="text"
            placeholder="Search by driver name or ID..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="modern-input pl-10"
          />
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
            <thead className="bg-slate-50 dark:bg-slate-900">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                  Driver Details
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
              {filteredApplications.map((application) => {
                const { color, icon } = getStatusDetails(application.childPickUpStatus);
                return (
                  <tr key={application.id} className="hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-12 w-12 flex-shrink-0 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-700">
                          <Image
                            src="/placeholder.png" // Replace with actual avatar if available
                            alt={application.fullName}
                            width={48}
                            height={48}
                            className="h-12 w-12 object-cover"
                          />
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-semibold text-slate-900 dark:text-white">
                            {application.fullName}
                          </p>
                          <p className="text-sm text-slate-500 dark:text-slate-400">ID: {application.driverId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`status-badge ${color}`}>
                        {icon}
                        <span>{application.childPickUpStatus.charAt(0).toUpperCase() + application.childPickUpStatus.slice(1)}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => onSelect(application)}
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium text-sm transition-colors"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filteredApplications.length === 0 && (
            <div className="text-center py-12">
              <p className="text-slate-500 dark:text-slate-400">No applications found matching your search.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}