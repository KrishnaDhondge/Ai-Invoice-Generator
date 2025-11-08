import React, { useState } from 'react';
import Dashboard from './components/Dashboard';
import InvoiceEditor from './components/InvoiceEditor';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Footer from './components/Footer';
import { useInvoices } from './hooks/useInvoices';
import type { Invoice } from './types';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState('dashboard');
  const [invoiceToEdit, setInvoiceToEdit] = useState<Invoice | null>(null);
  const { invoices, addInvoice, updateInvoice, deleteInvoice, updateInvoiceStatus } = useInvoices();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleCreateNew = () => {
    setInvoiceToEdit(null);
    setCurrentView('editor');
    setIsSidebarOpen(false);
  };

  const handleEditInvoice = (invoice: Invoice) => {
    setInvoiceToEdit(invoice);
    setCurrentView('editor');
    setIsSidebarOpen(false);
  };
  
  const handleSaveInvoice = (invoice: Invoice) => {
    if (invoices.find(inv => inv.id === invoice.id)) {
      updateInvoice(invoice.id, invoice);
    } else {
      addInvoice(invoice);
    }
    setCurrentView('dashboard');
  };
  
  const handleSetView = (view: string) => {
      setCurrentView(view);
      setIsSidebarOpen(false);
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200">
      <Header onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar 
            currentView={currentView} 
            setCurrentView={handleSetView} 
            onCreateNew={handleCreateNew}
            isOpen={isSidebarOpen}
            setIsOpen={setIsSidebarOpen}
        />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {currentView === 'dashboard' && (
            <Dashboard 
              invoices={invoices} 
              onEdit={handleEditInvoice} 
              onDelete={deleteInvoice}
              onStatusChange={updateInvoiceStatus}
            />
          )}
          {currentView === 'editor' && (
            <InvoiceEditor 
              invoiceToEdit={invoiceToEdit} 
              onSave={handleSaveInvoice}
              onCancel={() => setCurrentView('dashboard')}
            />
          )}
        </main>
      </div>
       <Footer />
    </div>
  );
};

export default App;
