"use client";

import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Application } from '@/app/lib/types';

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend, Filler);

interface ProcessingTimeChartProps {
  applications?: Application[];
}

export default function ProcessingTimeChart({ applications = [] }: ProcessingTimeChartProps) {
  if (!applications || applications.length === 0) {
    return (
      <div className="chart-container h-full flex flex-col items-center justify-center">
        <h2 className="lusitana text-xl font-bold text-slate-900 dark:text-white mb-6">
          Average Processing Time
        </h2>
        <p className="text-slate-600 dark:text-slate-300">No data available</p>
      </div>
    );
  }

  const sortedApplications = applications.sort((a, b) => {
    const aTime = typeof a.createdAt === 'number' ? a.createdAt : (a.createdAt?._seconds || 0);
    const bTime = typeof b.createdAt === 'number' ? b.createdAt : (b.createdAt?._seconds || 0);
    return aTime - bTime;
  });

  const processingTimes = sortedApplications.map((app) => {
    if (!app.createdAt || !app.updatedAt) return 0;

    const submittedTime = typeof app.createdAt === 'number'
      ? app.createdAt
      : app.createdAt._seconds
      ? app.createdAt._seconds * 1000
      : 0;

    const processedTime = typeof app.updatedAt === 'number'
      ? app.updatedAt
      : app.updatedAt._seconds
      ? app.updatedAt._seconds * 1000
      : 0;

    const submittedAt = new Date(submittedTime).getTime();
    const processedAt = new Date(processedTime).getTime();
    return Math.max(0, (processedAt - submittedAt) / (1000 * 60 * 60 * 24));
  });

  const labels = sortedApplications.map((app) => {
    if (!app.createdAt) return '';
    const timestamp = typeof app.createdAt === 'number'
      ? app.createdAt
      : app.createdAt._seconds
      ? app.createdAt._seconds * 1000
      : Date.now();
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  });

  const data = {
    labels,
    datasets: [
      {
        label: 'Processing Time (Days)',
        data: processingTimes,
        fill: true,
        backgroundColor: (context: any) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 200);
          gradient.addColorStop(0, 'rgba(99, 102, 241, 0.3)');
          gradient.addColorStop(1, 'rgba(99, 102, 241, 0.01)');
          return gradient;
        },
        borderColor: 'rgb(99, 102, 241)',
        borderWidth: 3,
        tension: 0.4,
        pointRadius: 4,
        pointBackgroundColor: 'white',
        pointBorderColor: 'rgb(99, 102, 241)',
        pointBorderWidth: 2,
        pointHoverRadius: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        borderRadius: 8,
        titleFont: {
          size: 14,
        },
        bodyFont: {
          size: 13,
        },
        callbacks: {
          label: (context: any) => `${context.parsed.y.toFixed(1)} days`,
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
          color: 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          color: '#4B5563',
          maxRotation: 0,
          autoSkip: true,
          maxTicksLimit: 6,
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          color: '#4B5563',
          callback: (value: any) => `${value}d`,
        },
      },
    },
  };

  return (
    <div className="chart-container h-full flex flex-col">
      <h2 className="lusitana text-xl font-bold text-slate-900 dark:text-white mb-6">
        Average Processing Time
      </h2>
      <div className="flex-1" style={{ minHeight: '300px' }}>
        <Line data={data} options={options} />
      </div>
    </div>
  );
}