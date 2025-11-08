import React from 'react';
import { InvoiceStatus, type Invoice } from '../types';
import InvoiceStatusBadge from './InvoiceStatusBadge';
import AIAnalytics from './AIAnalytics';
import { formatCurrency } from '../utils/currency';

interface DashboardProps {
  invoices: Invoice[];
  onEdit: (invoice: Invoice) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: InvoiceStatus) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ invoices, onEdit, onDelete, onStatusChange }) => {
  const getTotalAmount = (invoice: Invoice) =>
    invoice.items.reduce((sum, item) => sum + item.quantity * item.rate, 0);

  return (
    <div className="space-y-6">
      <AIAnalytics invoices={invoices} />
      
      <h2 className="text-2xl font-bold text-slate-800 dark:text-white">All Invoices</h2>
      
      {invoices.length === 0 ? (
        <div className="text-center py-16 px-6 bg-white dark:bg-slate-800 rounded-lg shadow-sm">
            <span className="text-5xl mb-4 block" role="img" aria-label="empty">📭</span>
            <h3 className="text-xl font-semibold">No Invoices Yet</h3>
            <p className="text-slate-500 dark:text-slate-400 mt-2">Click "New Invoice" to create your first one.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow overflow-x-auto">
          <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
            <thead className="text-xs text-slate-700 uppercase bg-slate-50 dark:bg-slate-700 dark:text-slate-400">
              <tr>
                <th scope="col" className="px-6 py-3">Status</th>
                <th scope="col" className="px-6 py-3">Client</th>
                <th scope="col" className="px-6 py-3 hidden sm:table-cell">Due Date</th>
                <th scope="col" className="px-6 py-3 hidden md:table-cell">Amount</th>
                <th scope="col" className="px-6 py-3"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody>
              {invoices.map(invoice => (
                <tr key={invoice.id} className="bg-white dark:bg-slate-800 border-b dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600">
                  <td className="px-6 py-4">
                    <InvoiceStatusBadge status={invoice.status} />
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-900 dark:text-white truncate" style={{maxWidth: '150px'}}>{invoice.clientName}</td>
                  <td className="px-6 py-4 hidden sm:table-cell">{invoice.dueDate}</td>
                  <td className="px-6 py-4 font-medium text-slate-900 dark:text-white hidden md:table-cell">{formatCurrency(getTotalAmount(invoice), invoice.currency)}</td>
                  <td className="px-6 py-4 text-right space-x-1 sm:space-x-2 whitespace-nowrap">
                    <button onClick={() => onEdit(invoice)} className="font-medium text-blue-600 dark:text-blue-500 hover:underline">Edit</button>
                    <select
                      value={invoice.status}
                      onChange={(e) => onStatusChange(invoice.id, e.target.value as InvoiceStatus)}
                      className="bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md text-xs p-1 focus:ring-blue-500 focus:border-blue-500"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {Object.values(InvoiceStatus).map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <button onClick={() => onDelete(invoice.id)} className="font-medium text-red-600 dark:text-red-500 hover:underline">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Dashboard;