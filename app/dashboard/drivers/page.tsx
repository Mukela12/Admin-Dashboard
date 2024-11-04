"use client"; // Make sure this is included for client-side rendering

import { useState, useEffect } from "react";
import DriverTable from './table';
import { DriverDetails } from "./[id]/page"; // Use named import instead of default import
import { Application } from "@/app/lib/types";

export default function Page() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);

  const fetchDriverApplications = async () => {
    try {
      const response = await fetch("https://banturide-api.onrender.com/admin/get-driver-applications");
      if (!response.ok) {
        throw new Error("Failed to fetch driver applications");
      }
      const data = await response.json();
      setApplications(data.applications); // Ensure applications are set
    } catch (error) {
      console.error(error);
      setApplications([]); // Set to empty array on error
    }
  };

  useEffect(() => {
    fetchDriverApplications(); // Call the fetch function
  }, []);

  return (
    <main>
      {!selectedApplication ? (
        <DriverTable applications={applications} onSelect={setSelectedApplication} />
      ) : (
        <DriverDetails application={selectedApplication} onBack={() => setSelectedApplication(null)} />
      )}
    </main>
  );
}
