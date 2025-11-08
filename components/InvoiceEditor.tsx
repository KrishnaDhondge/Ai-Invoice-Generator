import React, { useState, useRef } from 'react';
import type { Invoice, InvoiceItem } from '../types';
import { InvoiceStatus } from '../types';
import { generateItemDescription, generateEmailBody } from '../services/geminiService';
import { currencies, formatCurrency } from '../utils/currency';

declare var jspdf: any;
declare var html2canvas: any;


interface InvoiceEditorProps {
  invoiceToEdit: Invoice | null;
  onSave: (invoice: Invoice) => void;
  onCancel: () => void;
}

const getTodayDate = () => new Date().toISOString().split('T')[0];

const createEmptyInvoice = (): Invoice => ({
  id: `INV-${Date.now()}`,
  invoiceNumber: `#${Math.floor(Math.random() * 9000) + 1000}`,
  clientName: '',
  clientEmail: '',
  clientAddress: '',
  senderName: '',
  senderEmail: '',
  senderAddress: '',
  issueDate: getTodayDate(),
  dueDate: getTodayDate(),
  items: [{ id: `ITEM-${Date.now()}`, description: '', quantity: 1, rate: 0 }],
  notes: '',
  status: InvoiceStatus.DRAFT,
  currency: 'USD',
});

const InvoiceEditor: React.FC<InvoiceEditorProps> = ({ invoiceToEdit, onSave, onCancel }) => {
  const [invoice, setInvoice] = useState<Invoice>(invoiceToEdit || createEmptyInvoice());
  const [isGenerating, setIsGenerating] = useState<string | null>(null);
  const invoicePreviewRef = useRef<HTMLDivElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setInvoice(prev => ({ ...prev, [name]: value }));
  };

  const handleItemChange = (itemId: string, field: keyof InvoiceItem, value: string | number) => {
    setInvoice(prev => ({
      ...prev,
      items: prev.items.map(item =>
        item.id === itemId ? { ...item, [field]: value } : item
      ),
    }));
  };

  const handleAddItem = () => {
    setInvoice(prev => ({
      ...prev,
      items: [
        ...prev.items,
        { id: `ITEM-${Date.now()}`, description: '', quantity: 1, rate: 0 },
      ],
    }));
  };

  const handleRemoveItem = (itemId: string) => {
    setInvoice(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== itemId),
    }));
  };
  
  const handleGenerateDescription = async (itemId: string) => {
      const item = invoice.items.find(i => i.id === itemId);
      if(!item || !item.description) {
        alert("Please provide a name for the item first.");
        return;
      }
      setIsGenerating(itemId);
      const description = await generateItemDescription(item.description);
      handleItemChange(itemId, 'description', description);
      setIsGenerating(null);
  }

  const handleDownloadPdf = () => {
    const input = invoicePreviewRef.current;
    if (input) {
      html2canvas(input, { scale: 2 }).then((canvas: any) => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jspdf.jsPDF({
          orientation: 'p',
          unit: 'px',
          format: [canvas.width, canvas.height]
        });
        pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
        pdf.save(`invoice-${invoice.invoiceNumber}.pdf`);
      });
    }
  };

  const handleSendEmail = async () => {
    const emailBody = await generateEmailBody(invoice);
    const subject = `Invoice ${invoice.invoiceNumber} from ${invoice.senderName}`;
    const mailtoLink = `mailto:${invoice.clientEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(emailBody)}`;
    window.location.href = mailtoLink;
  }

  const subtotal = invoice.items.reduce((sum, item) => sum + item.quantity * item.rate, 0);
  const tax = subtotal * 0.1; // Example 10% tax
  const total = subtotal + tax;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Form Section */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow space-y-6">
        <h2 className="text-2xl font-bold">{invoiceToEdit ? 'Edit Invoice' : 'Create New Invoice'}</h2>

        {/* Sender & Client Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <h3 className="font-semibold">From</h3>
            <input type="text" name="senderName" value={invoice.senderName} onChange={handleChange} placeholder="Your Name" className="input-field" />
            <input type="email" name="senderEmail" value={invoice.senderEmail} onChange={handleChange} placeholder="Your Email" className="input-field" />
            <textarea name="senderAddress" value={invoice.senderAddress} onChange={handleChange} placeholder="Your Address" className="input-field" rows={2}></textarea>
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold">To</h3>
            <input type="text" name="clientName" value={invoice.clientName} onChange={handleChange} placeholder="Client's Name" className="input-field" />
            <input type="email" name="clientEmail" value={invoice.clientEmail} onChange={handleChange} placeholder="Client's Email" className="input-field" />
            <textarea name="clientAddress" value={invoice.clientAddress} onChange={handleChange} placeholder="Client's Address" className="input-field" rows={2}></textarea>
          </div>
        </div>

        {/* Invoice Meta */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
                <label className="font-semibold text-sm">Issue Date</label>
                <input type="date" name="issueDate" value={invoice.issueDate} onChange={handleChange} className="input-field" />
            </div>
             <div className="space-y-2">
                <label className="font-semibold text-sm">Due Date</label>
                <input type="date" name="dueDate" value={invoice.dueDate} onChange={handleChange} className="input-field" />
            </div>
            <div className="space-y-2">
                <label className="font-semibold text-sm">Currency</label>
                 <select name="currency" value={invoice.currency} onChange={handleChange} className="input-field">
                    {currencies.map(c => <option key={c.code} value={c.code}>{c.code} - {c.name}</option>)}
                 </select>
            </div>
        </div>

        {/* Items Table */}
        <div className="space-y-2">
            <h3 className="font-semibold">Items</h3>
            {invoice.items.map((item, index) => (
                <div key={item.id} className="grid grid-cols-12 gap-2 items-center">
                    <div className="col-span-6 relative">
                        <input 
                            type="text" 
                            placeholder="Item Name / Description" 
                            value={item.description}
                            onChange={e => handleItemChange(item.id, 'description', e.target.value)}
                            className="input-field w-full"
                        />
                         <button 
                            onClick={() => handleGenerateDescription(item.id)} 
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-lg hover:text-blue-500"
                            disabled={isGenerating === item.id}
                            title="Generate with AI"
                         >
                             {isGenerating === item.id ? '...': '✨'}
                         </button>
                    </div>
                    <input type="number" placeholder="Qty" value={item.quantity} onChange={e => handleItemChange(item.id, 'quantity', parseFloat(e.target.value))} className="input-field col-span-2" />
                    <input type="number" placeholder="Rate" value={item.rate} onChange={e => handleItemChange(item.id, 'rate', parseFloat(e.target.value))} className="input-field col-span-2" />
                    <div className="col-span-2 flex justify-end">
                         {formatCurrency(item.quantity * item.rate, invoice.currency)}
                        <button onClick={() => handleRemoveItem(item.id)} className="text-red-500 hover:text-red-700 ml-2">🗑️</button>
                    </div>
                </div>
            ))}
            <button onClick={handleAddItem} className="text-sm font-semibold text-blue-600 hover:text-blue-800">+ Add Item</button>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end space-x-3 pt-4 border-t dark:border-slate-700">
            <button onClick={onCancel} className="px-4 py-2 rounded-lg bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600">Cancel</button>
            <button onClick={() => onSave(invoice)} className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700">Save Invoice</button>
        </div>
      </div>

      {/* Preview Section */}
      <div>
        <div className="sticky top-8">
            <div ref={invoicePreviewRef} className="bg-white dark:bg-slate-800 p-8 rounded-lg shadow">
              {/* Invoice Header */}
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h1 className="text-2xl font-bold text-slate-900 dark:text-white">INVOICE</h1>
                  <p className="text-slate-500">{invoice.invoiceNumber}</p>
                </div>
                <div className="text-right">
                    <p className="font-semibold">{invoice.senderName || 'Your Company'}</p>
                    <p className="text-sm text-slate-500">{invoice.senderAddress || '123 Street, City'}</p>
                </div>
              </div>
              
              {/* Client and Dates */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div>
                  <p className="text-sm text-slate-500">Billed To</p>
                  <p className="font-semibold">{invoice.clientName || 'Client Name'}</p>
                  <p className="text-sm text-slate-500">{invoice.clientAddress || 'Client Address'}</p>
                </div>
                <div className="text-right">
                    <p className="text-sm text-slate-500">Issue Date: <span className="font-medium text-slate-700 dark:text-slate-300">{invoice.issueDate}</span></p>
                    <p className="text-sm text-slate-500">Due Date: <span className="font-medium text-slate-700 dark:text-slate-300">{invoice.dueDate}</span></p>
                </div>
              </div>

              {/* Items Table */}
              <table className="w-full text-sm mb-8">
                <thead className="border-b-2 dark:border-slate-600">
                  <tr>
                    <th className="text-left font-semibold p-2">Description</th>
                    <th className="text-center font-semibold p-2">Qty</th>
                    <th className="text-right font-semibold p-2">Rate</th>
                    <th className="text-right font-semibold p-2">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.items.map(item => (
                    <tr key={item.id} className="border-b dark:border-slate-700">
                      <td className="p-2">{item.description || '...'}</td>
                      <td className="text-center p-2">{item.quantity}</td>
                      <td className="text-right p-2">{formatCurrency(item.rate, invoice.currency)}</td>
                      <td className="text-right p-2">{formatCurrency(item.quantity * item.rate, invoice.currency)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Totals */}
              <div className="flex justify-end">
                <div className="w-full max-w-xs space-y-2">
                  <div className="flex justify-between text-sm"><span>Subtotal</span><span>{formatCurrency(subtotal, invoice.currency)}</span></div>
                  <div className="flex justify-between text-sm"><span>Tax (10%)</span><span>{formatCurrency(tax, invoice.currency)}</span></div>
                  <div className="flex justify-between font-bold text-lg border-t-2 pt-2 mt-2 dark:border-slate-600"><span>Total</span><span>{formatCurrency(total, invoice.currency)}</span></div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-center space-x-3">
              <button onClick={handleDownloadPdf} className="action-btn">📄 Download PDF</button>
              <button onClick={handleSendEmail} className="action-btn">📧 Send Email</button>
            </div>
        </div>
      </div>

       <style>{`
        .input-field {
          @apply w-full p-2 border border-slate-300 rounded-md bg-slate-50 dark:bg-slate-700 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none;
        }
        .action-btn {
            @apply px-5 py-2.5 text-sm font-medium text-center text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 transition-colors;
        }
      `}</style>
    </div>
  );
};

export default InvoiceEditor;