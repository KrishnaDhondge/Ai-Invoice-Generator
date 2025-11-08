
import React from 'react';
import { InvoiceStatus } from '../types';

interface InvoiceStatusBadgeProps {
  status: InvoiceStatus;
}

const statusColors: Record<InvoiceStatus, string> = {
  [InvoiceStatus.DRAFT]: 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300',
  [InvoiceStatus.SENT]: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  [InvoiceStatus.PAID]: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  [InvoiceStatus.OVERDUE]: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
};

const InvoiceStatusBadge: React.FC<InvoiceStatusBadgeProps> = ({ status }) => {
  return (
    <span
      className={`px-2.5 py-1 text-xs font-semibold rounded-full ${statusColors[status]}`}
    >
      {status}
    </span>
  );
};

export default InvoiceStatusBadge;
