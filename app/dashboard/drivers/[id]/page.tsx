"use client"; // This component uses client-side features

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from 'next/navigation';
import DriverDetails from './DriverDetails/DriverDetails';
import { Application } from "@/app/lib/types";

const DriverPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get('id'); // Get the driver ID from the URL query params
  const [application, setApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchApplicationDetails = async () => {
    try {
      const response = await fetch(`/api/dashboard/applications/${id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch application details");
      }
      const data = await response.json();
      setApplication(data.application);
    } catch (error) {
      console.error(error);
      setError("Failed to load driver details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchApplicationDetails();
    }
  }, [id]);

  if (loading) {
    return <div className="text-center">Loading...</div>;
  }

  if (error) {
    return <div className="text-red-600 text-center">{error}</div>;
  }

  if (!application) {
    return <div className="text-center">No application found.</div>;
  }

  return (
    <div>
      <DriverDetails application={application} onBack={() => router.push('/dashboard/drivers')} />
    </div>
  );
};

export default DriverPage;
