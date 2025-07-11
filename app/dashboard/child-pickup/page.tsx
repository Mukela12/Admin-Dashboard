"use client";

import { useState, useEffect } from "react";
import ChildPickupTable from './table';
import ChildPickupDetails from "./ChildPickupDetails";
import { ChildPickupApplication } from "@/app/lib/types";

export default function ChildPickupPage() {
  const [applications, setApplications] = useState<ChildPickupApplication[]>([]);
  const [selectedApplication, setSelectedApplication] = useState<ChildPickupApplication | null>(null);

  const fetchChildPickupApplications = async () => {
    try {
      const response = await fetch("https://banturide-api-production.up.railway.app/admin/get-child-pickup-applications", {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}` // Assuming token-based auth
        }
      });
      if (!response.ok) throw new Error("Failed to fetch child pickup applications");
      const data = await response.json();
      setApplications(data.applications || []);
    } catch (error) {
      console.error(error);
      setApplications([]);
    }
  };

  useEffect(() => {
    fetchChildPickupApplications();
  }, []);

  return (
    <main>
      {!selectedApplication ? (
        <ChildPickupTable applications={applications} onSelect={setSelectedApplication} />
      ) : (
        <ChildPickupDetails application={selectedApplication} onBack={() => setSelectedApplication(null)} />
      )}
    </main>
  );
}