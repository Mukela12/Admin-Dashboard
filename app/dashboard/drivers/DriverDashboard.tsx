"use client";

import { useState, useEffect } from "react";
import DriverTable from "./table"; // Adjust the import based on your structure
import DriverDetails from "./[id]/DriverDetails/DriverDetails"; // Adjust the import based on your structure
import { Application } from "@/app/lib/types";

export default function DriverDashboard() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);

  const fetchDriverApplications = async () => {
    try {
      const response = await fetch("https://banturide-api.onrender.com/admin/get-driver-applications");
      if (!response.ok) {
        throw new Error("Failed to fetch driver applications");
      }
      const data = await response.json();
      return data.applications;
    } catch (error) {
      console.error(error);
      return [];
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      const data = await fetchDriverApplications();
      setApplications(data);
    };

    fetchData();
  }, []);

  return (
    <div>
      {!selectedApplication ? (
        <DriverTable applications={applications} onSelect={setSelectedApplication} />
      ) : (
        <DriverDetails application={selectedApplication} onBack={() => setSelectedApplication(null)} />
      )}
    </div>
  );
}
