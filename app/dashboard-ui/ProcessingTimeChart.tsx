// ProcessingTimeChart.tsx
"use client"; // Marking this file as a client component

import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Application } from '@/app/lib/types'; // Adjust the import path as necessary

// Register chart components with ChartJS
ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend);

// Fetch applications data from the API
async function fetchApplications(): Promise<Application[]> {
  const response = await fetch('https://banturide-api.onrender.com/admin/get-applications');
  const data = await response.json();
  return data.applications || [];
}

export default function ProcessingTimeChart() {
  const [processingTimes, setProcessingTimes] = useState<number[]>([]);
  const [labels, setLabels] = useState<string[]>([]);

  useEffect(() => {
    async function calculateProcessingTimes() {
      const applications = await fetchApplications();

      // Calculate processing times in days
      const times = applications.map((app) => {
        if (!app.createdAt || !app.updatedAt) return 0; // Handle missing dates
        const submittedAt = new Date(app.createdAt._seconds * 1000).getTime();
        const processedAt = new Date(app.updatedAt._seconds * 1000).getTime();
        return (processedAt - submittedAt) / (1000 * 60 * 60 * 24); // time in days
      });

      // Generate labels (you can adjust this for better date formatting)
      const dateLabels = applications.map((app, i) => `App ${i + 1}`);
      setProcessingTimes(times);
      setLabels(dateLabels);
    }

    calculateProcessingTimes();
  }, []);

  const data = {
    labels,
    datasets: [
      {
        label: 'Processing Time (Days)',
        data: processingTimes,
        fill: false,
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        tension: 0.2,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Applications',
        },
      },
      y: {
        title: {
          display: true,
          text: 'Processing Time (Days)',
        },
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="w-full md:col-span-4">
      <h2 className="text-xl md:text-2xl mb-4">Processing Time per Application</h2>
      <div className="rounded-xl bg-gray-50 p-4">
        <Line data={data} options={options} />
      </div>
    </div>
  );
}
