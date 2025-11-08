import React, { useState, useMemo } from 'react';
import type { Invoice } from '../types';
import { InvoiceStatus } from '../types';
import PieChart from './PieChart';
import { generateDashboardInsights } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';

interface AIAnalyticsProps {
  invoices: Invoice[];
}

const statusColors: Record<InvoiceStatus, string> = {
  [InvoiceStatus.DRAFT]: '#94a3b8', // slate-400
  [InvoiceStatus.SENT]: '#3b82f6',  // blue-500
  [InvoiceStatus.PAID]: '#22c55e',   // green-500
  [InvoiceStatus.OVERDUE]: '#ef4444', // red-500
};


const AIAnalytics: React.FC<AIAnalyticsProps> = ({ invoices }) => {
  const [insights, setInsights] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const chartData = useMemo(() => {
    const statusCounts = invoices.reduce((acc, invoice) => {
      acc[invoice.status] = (acc[invoice.status] || 0) + 1;
      return acc;
    }, {} as Record<InvoiceStatus, number>);

    return Object.entries(statusCounts)
      .map(([status, count]) => ({
        label: status,
        value: count,
        color: statusColors[status as InvoiceStatus],
      }))
      .filter(item => item.value > 0);
  }, [invoices]);

  const handleGetInsights = async () => {
    setIsLoading(true);
    setError('');
    setInsights('');
    try {
      const result = await generateDashboardInsights(invoices);
      setInsights(result);
    } catch (err) {
      setError('Failed to get AI insights. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mb-6 bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm">
      <h3 className="text-xl font-bold mb-4 text-slate-800 dark:text-white">Financial Snapshot</h3>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <PieChart data={chartData} />
        </div>
        <div className="flex flex-col justify-center">
            <button
              onClick={handleGetInsights}
              disabled={isLoading || invoices.length === 0}
              className="mb-4 inline-flex items-center justify-center px-5 py-2.5 text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-slate-400 dark:disabled:bg-slate-600 disabled:cursor-not-allowed"
            >
             {isLoading ? 'Analyzing...' : '💡 Get AI Insights'}
            </button>
            {error && <p className="text-sm text-red-500">{error}</p>}
            {insights && (
                 <div className="prose prose-sm dark:prose-invert max-w-none p-4 bg-slate-50 dark:bg-slate-700 rounded-md">
                    <ReactMarkdown>{insights}</ReactMarkdown>
                 </div>
            )}
            {invoices.length === 0 && <p className="text-center text-sm text-slate-500">Create an invoice to see your snapshot and get AI insights.</p>}
        </div>
      </div>
    </div>
  );
};

export default AIAnalytics;
