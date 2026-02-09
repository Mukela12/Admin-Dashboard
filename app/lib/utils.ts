// utils.ts

import { Revenue } from './types';

// Format currency in Zambian Kwacha
export const formatCurrency = (amount: number) => {
  return `K${amount.toFixed(2)}`;
};

// Format date to a readable local format
export const formatDateToLocal = (
  dateStr: string,
  locale: string = 'en-ZM',
) => {
  const date = new Date(dateStr);
  const options: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  };
  const formatter = new Intl.DateTimeFormat(locale, options);
  return formatter.format(date);
};

// Generate y-axis labels for charts based on highest count of applications or complaints
export const generateYAxis = (data: Revenue[]) => {
  const yAxisLabels = [];
  const highestCount = Math.max(...data.map((entry) => entry.revenue));
  const topLabel = Math.ceil(highestCount / 10) * 10;

  for (let i = topLabel; i >= 0; i -= 10) {
    yAxisLabels.push(i.toString());
  }

  return { yAxisLabels, topLabel };
};

// Pagination helper for e-hailing admin dashboard
export const generatePagination = (currentPage: number, totalPages: number) => {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  if (currentPage <= 3) {
    return [1, 2, 3, '...', totalPages - 1, totalPages];
  }
  if (currentPage >= totalPages - 2) {
    return [1, 2, '...', totalPages - 2, totalPages - 1, totalPages];
  }
  return [
    1,
    '...',
    currentPage - 1,
    currentPage,
    currentPage + 1,
    '...',
    totalPages,
  ];
};
