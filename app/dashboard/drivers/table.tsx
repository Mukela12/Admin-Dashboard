"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { CheckCircleIcon, XCircleIcon, ExclamationCircleIcon } from "@heroicons/react/24/outline";
import Search from "@/app/search";
import { Application } from "@/app/lib/types";

interface DriverTableProps {
  applications: Application[];
  onSelect: (application: Application) => void;
}

export default function DriverTable({ applications, onSelect }: DriverTableProps) {
  const [filteredApplications, setFilteredApplications] = useState<Application[]>([]);

  useEffect(() => {
    setFilteredApplications(applications || []);
  }, [applications]);

  const handleSearch = (term: string) => {
    const lowerCaseTerm = term.toLowerCase();
    setFilteredApplications(
      applications.filter((application) =>
        application.carMake.toLowerCase().includes(lowerCaseTerm) ||
        application.carModel.toLowerCase().includes(lowerCaseTerm) ||
        application.licenseNumber.toLowerCase().includes(lowerCaseTerm) ||
        application.carColor.toLowerCase().includes(lowerCaseTerm)
      )
    );
  };

  const getStatusDetails = (status: string) => {
    switch (status) {
      case "approved":
        return {
          color: "bg-green-100 text-green-600",
          icon: <CheckCircleIcon className="h-5 w-5" aria-hidden="true" />
        };
      case "pending":
        return {
          color: "bg-orange-100 text-orange-600",
          icon: <ExclamationCircleIcon className="h-5 w-5" aria-hidden="true" />
        };
      case "failed":
        return {
          color: "bg-red-100 text-red-600",
          icon: <XCircleIcon className="h-5 w-5" aria-hidden="true" />
        };
      default:
        return {
          color: "bg-gray-100 text-gray-600",
          icon: null
        };
    }
  };

  return (
    <div className="w-full p-6 bg-white rounded-lg shadow-md">
      <h1 className="mb-8 text-xl md:text-2xl font-bold text-gray-800">Driver Applications</h1>
      <Search placeholder="Search drivers..." onSearch={handleSearch} />
      <div className="mt-6 flow-root">
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full align-middle">
            <div className="overflow-hidden rounded-lg border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200 bg-gray-50 text-gray-800">
                <thead className="bg-gray-200 text-left text-sm font-semibold uppercase tracking-wide text-gray-600">
                  <tr>
                    <th scope="col" className="px-4 py-4">Car Make & Model</th>
                    <th scope="col" className="px-4 py-4">License Number</th>
                    <th scope="col" className="px-4 py-4">Seats</th>
                    <th scope="col" className="px-4 py-4">Car Color</th>
                    <th scope="col" className="px-4 py-4">Status</th>
                    <th scope="col" className="px-4 py-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {filteredApplications.map((application) => {
                    const { color, icon } = getStatusDetails(application.driverVerificationStatus);
                    return (
                      <tr key={application.id} className="hover:bg-gray-100 transition">
                        <td className="px-4 py-5 text-sm">
                          <div className="flex items-center gap-3">
                            <Image
                              src={application.avatar || "/placeholder.png"}
                              className="rounded-full"
                              alt={`${application.carMake} ${application.carModel}`}
                              width={32}
                              height={32}
                              onError={(e) => {
                                e.currentTarget.src = "/placeholder.png";
                              }}
                            />
                            <span>{application.carMake} {application.carModel}</span>
                          </div>
                        </td>
                        <td className="px-4 py-5 text-sm">{application.licenseNumber}</td>
                        <td className="px-4 py-5 text-sm">{application.seats}</td>
                        <td className="px-4 py-5 text-sm">{application.carColor}</td>
                        <td className="px-4 py-5 text-sm">
                          <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${color}`}>
                            {icon} {application.driverVerificationStatus.charAt(0).toUpperCase() + application.driverVerificationStatus.slice(1).toLowerCase()}
                          </span>
                        </td>
                        <td className="px-4 py-5 text-center">
                          <button onClick={() => onSelect(application)} className="text-indigo-600 hover:text-indigo-900">
                            See More
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {filteredApplications.length === 0 && (
                <p className="p-4 text-gray-500 text-center">No matching applications found.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
