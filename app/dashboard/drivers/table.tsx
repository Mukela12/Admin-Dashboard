"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { CheckCircleIcon, XCircleIcon, ExclamationCircleIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { Application } from "@/app/lib/types";

interface DriverTableProps {
  applications: Application[];
  onSelect: (application: Application) => void;
}

export default function DriverTable({ applications, onSelect }: DriverTableProps) {
  const [filteredApplications, setFilteredApplications] = useState<Application[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    setFilteredApplications(applications || []);
  }, [applications]);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    const lowerCaseTerm = term.toLowerCase();
    setFilteredApplications(
      applications.filter((application) =>
        application.carMake?.toLowerCase().includes(lowerCaseTerm) ||
        application.carModel?.toLowerCase().includes(lowerCaseTerm) ||
        application.licenseNumber?.toLowerCase().includes(lowerCaseTerm) ||
        application.carColor?.toLowerCase().includes(lowerCaseTerm)
      )
    );
  };

  const getStatusDetails = (status: string | undefined) => {
    const statusValue = status || 'pending';

    switch (statusValue) {
      case "approved":
        return {
          color: "status-approved",
          icon: <CheckCircleIcon className="h-4 w-4" aria-hidden="true" />
        };
      case "denied":
      case "failed":
        return {
          color: "status-failed",
          icon: <XCircleIcon className="h-4 w-4" aria-hidden="true" />
        };
      case "pending":
      default:
        return {
          color: "status-pending",
          icon: <ExclamationCircleIcon className="h-4 w-4" aria-hidden="true" />
        };
    }
  };

  return (
    <div className="w-full">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-50 mb-3 tracking-tight">
          Driver Applications
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400">
          Review and manage driver applications
        </p>
      </div>

      <div className="mb-6">
        <div className="relative max-w-md">
          <input
            type="text"
            placeholder="Search by car make, model, license, or color..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="input pl-10"
          />
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
        </div>
      </div>

      <div className="table-container">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
            <thead className="table-header">
              <tr>
                <th scope="col" className="table-header-cell">
                  Driver Details
                </th>
                <th scope="col" className="table-header-cell">
                  License Number
                </th>
                <th scope="col" className="table-header-cell">
                  Vehicle Info
                </th>
                <th scope="col" className="table-header-cell">
                  Status
                </th>
                <th scope="col" className="table-header-cell text-center">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
              {filteredApplications.map((application) => {
                const status = application.driverVerificationStatus || 'pending';
                const { color, icon } = getStatusDetails(status);

                return (
                  <tr key={application.id} className="table-row">
                    <td className="table-cell">
                      <div className="flex items-center">
                        <div className="h-12 w-12 flex-shrink-0 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-700">
                          <Image
                            src={application.avatar || "/placeholder.png"}
                            alt={`${application.carMake || ''} ${application.carModel || ''}`}
                            width={48}
                            height={48}
                            className="h-12 w-12 object-cover"
                            onError={(e) => {
                              e.currentTarget.src = "/placeholder.png";
                            }}
                          />
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">
                            {application.carMake || 'Unknown'} {application.carModel || ''}
                          </p>
                          <p className="text-sm text-slate-500 dark:text-slate-400">
                            ID: {application.driverId || 'N/A'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="table-cell">
                      <p className="text-sm text-slate-900 dark:text-slate-100">
                        {application.licenseNumber || 'N/A'}
                      </p>
                    </td>
                    <td className="table-cell">
                      <div>
                        <p className="text-sm text-slate-900 dark:text-slate-100">
                          {application.seats || 0} seats
                        </p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          {application.carColor || 'N/A'}
                        </p>
                      </div>
                    </td>
                    <td className="table-cell">
                      <span className={`status-badge ${color}`}>
                        {icon}
                        <span>{status.charAt(0).toUpperCase() + status.slice(1)}</span>
                      </span>
                    </td>
                    <td className="table-cell text-center">
                      <button
                        onClick={() => onSelect(application)}
                        className="btn-ghost btn-sm"
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
            <div className="empty-state">
              <div className="empty-state-title">No applications found</div>
              <div className="empty-state-description">
                {searchTerm ? 'Try adjusting your search criteria' : 'No driver applications available'}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
