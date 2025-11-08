
import { useState, useEffect } from 'react';
import type { Invoice, InvoiceStatus } from '../types';

const INVOICES_STORAGE_KEY = 'ai-invoices';

export const useInvoices = () => {
  const [invoices, setInvoices] = useState<Invoice[]>(() => {
    try {
      const storedInvoices = window.localStorage.getItem(INVOICES_STORAGE_KEY);
      return storedInvoices ? JSON.parse(storedInvoices) : [];
    } catch (error) {
      console.error('Error reading from localStorage', error);
      return [];
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(INVOICES_STORAGE_KEY, JSON.stringify(invoices));
    } catch (error) {
      console.error('Error writing to localStorage', error);
    }
  }, [invoices]);

  const addInvoice = (invoice: Invoice) => {
    setInvoices(prevInvoices => [...prevInvoices, invoice]);
  };

  const updateInvoice = (id: string, updatedInvoice: Invoice) => {
    setInvoices(prevInvoices =>
      prevInvoices.map(invoice => (invoice.id === id ? updatedInvoice : invoice))
    );
  };
  
  const updateInvoiceStatus = (id: string, status: InvoiceStatus) => {
    setInvoices(prevInvoices =>
      prevInvoices.map(invoice => (invoice.id === id ? { ...invoice, status } : invoice))
    );
  };

  const deleteInvoice = (id: string) => {
    setInvoices(prevInvoices => prevInvoices.filter(invoice => invoice.id !== id));
  };

  return { invoices, addInvoice, updateInvoice, deleteInvoice, updateInvoiceStatus };
};
