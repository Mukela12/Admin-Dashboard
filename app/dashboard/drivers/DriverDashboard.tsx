"use client";

import { useState, useEffect } from "react";
import DriverTable from "./table";
import ChildPickupTable from "./ChildPickupTable";
import DriverDetails from "./[id]/DriverDetails/DriverDetails";
import ChildPickupDetails from "./[id]/ChildPickupDetails/ChildPickupDetails";
import ApprovalRatioChart from "../../dashboard-ui/ApprovalRatioChart";
import ProcessingTimeChart from "../../dashboard-ui/ProcessingTimeChart";
import { Application, ChildPickupApplication } from "@/app/lib/types";

export default function DriverDashboard({ initialDriverApplications, initialChildPickupApplications }: { initialDriverApplications: Application[], initialChildPickupApplications: ChildPickupApplication[] }) {
  const [driverApplications, setDriverApplications] = useState<Application[]>(initialDriverApplications || []);
  const [childPickupApplications, setChildPickupApplications] = useState<ChildPickupApplication[]>(initialChildPickupApplications || []);
  const [selectedApplication, setSelectedApplication] = useState<Application | ChildPickupApplication | null>(null);
  const [activeTab, setActiveTab] = useState<"drivers" | "childPickup">("drivers");

  const fetchDriverApplications = async () => {
    try {
      const response = await fetch("https://banturide-api-production.up.railway.app/admin/get-driver-applications");
      if (!response.ok) throw new Error(`Failed to fetch driver applications: ${response.status}`);
      const data = await response.json();
      console.log("Driver applications response:", data); // Debug log
      return Array.isArray(data.applications) ? data.applications : [];
    } catch (error) {
      console.error("Error fetching driver applications:", error);
      return [];
    }
  };

  const fetchChildPickupApplications = async () => {
    try {
      const response = await fetch("https://banturide-api-production.up.railway.app/admin/get-child-pickup-applications");
      if (!response.ok) throw new Error(`Failed to fetch child pickup applications: ${response.status}`);
      const data = await response.json();
      console.log("Child pickup applications response:", data); // Debug log
      return Array.isArray(data.applications) ? data.applications : [];
    } catch (error) {
      console.error("Error fetching child pickup applications:", error);
      return [];
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      const [drivers, childPickup] = await Promise.all([fetchDriverApplications(), fetchChildPickupApplications()]);
      setDriverApplications(drivers);
      setChildPickupApplications(childPickup);
    };
    fetchData();
  }, []);

  const refreshDriverApplications = async () => {
    const drivers = await fetchDriverApplications();
    setDriverApplications(drivers);
  };

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <ApprovalRatioChart applications={driverApplications} />
        <ProcessingTimeChart applications={driverApplications} />
      </div>
      <div className="mb-6">
        <div className="flex space-x-4 border-b border-gray-200 dark:border-gray-700">
          <button
            className={`px-4 py-2 text-sm font-medium ${activeTab === "drivers" ? "border-b-2 border-blue-600 text-blue-600 dark:text-blue-400" : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"}`}
            onClick={() => setActiveTab("drivers")}
          >
            Driver Applications
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium ${activeTab === "childPickup" ? "border-b-2 border-blue-600 text-blue-600 dark:text-blue-400" : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"}`}
            onClick={() => setActiveTab("childPickup")}
          >
            Child Pickup Applications
          </button>
        </div>
      </div>
      {!selectedApplication ? (
        activeTab === "drivers" ? (
          <DriverTable applications={driverApplications} onSelect={setSelectedApplication as (app: Application) => void} />
        ) : (
          <ChildPickupTable applications={childPickupApplications} onSelect={setSelectedApplication as (app: ChildPickupApplication) => void} />
        )
      ) : (
        activeTab === "drivers" ? (
          <DriverDetails
            application={selectedApplication as Application}
            onBack={() => {
              setSelectedApplication(null);
              refreshDriverApplications();
            }}
          />
        ) : (
          <ChildPickupDetails application={selectedApplication as ChildPickupApplication} onBack={() => setSelectedApplication(null)} />
        )
      )}
    </div>
  );
}

export async function getServerSideProps() {
  const fetchDriverApplications = async () => {
    try {
      const response = await fetch("https://banturide-api-production.up.railway.app/admin/get-driver-applications");
      if (!response.ok) throw new Error(`Failed to fetch driver applications: ${response.status}`);
      const data = await response.json();
      console.log("Server-side driver applications response:", data); // Debug log
      return Array.isArray(data.applications) ? data.applications : [];
    } catch (error) {
      console.error("Server-side error fetching driver applications:", error);
      return [];
    }
  };

  const fetchChildPickupApplications = async () => {
    try {
      const response = await fetch("https://banturide-api-production.up.railway.app/admin/get-child-pickup-applications");
      if (!response.ok) throw new Error(`Failed to fetch child pickup applications: ${response.status}`);
      const data = await response.json();
      console.log("Server-side child pickup applications response:", data); // Debug log
      return Array.isArray(data.applications) ? data.applications : [];
    } catch (error) {
      console.error("Server-side error fetching child pickup applications:", error);
      return [];
    }
  };

  const [driverApplications, childPickupApplications] = await Promise.all([
    fetchDriverApplications(),
    fetchChildPickupApplications(),
  ]);

  return {
    props: {
      initialDriverApplications: driverApplications || [],
      initialChildPickupApplications: childPickupApplications || [],
    },
  };
}