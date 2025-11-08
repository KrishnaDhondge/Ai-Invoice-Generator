import { GoogleGenAI } from "@google/genai";
import { Invoice, InvoiceStatus } from "../types";
import { formatCurrency } from '../utils/currency';


// FIX: Aligned with Gemini API guidelines. Initialize client directly with environment variable
// and remove redundant checks, assuming the API key is always available.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateItemDescription = async (itemName: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Generate a concise, professional one-line description for an invoice item named: "${itemName}". Just provide the description, no preamble.`,
    });
    return response.text.trim();
  } catch (error) {
    console.error("Error generating item description:", error);
    return "Failed to generate description.";
  }
};

export const generateEmailBody = async (invoice: Invoice): Promise<string> => {
  const totalAmount = invoice.items.reduce((sum, item) => sum + item.quantity * item.rate, 0);
  const formattedTotal = formatCurrency(totalAmount, invoice.currency);
  const prompt = `
    Generate a professional and friendly email body to send an invoice.
    
    My Name: ${invoice.senderName}
    Client Name: ${invoice.clientName}
    Invoice Number: ${invoice.invoiceNumber}
    Due Date: ${invoice.dueDate}
    Total Amount: ${formattedTotal}
    
    The email should be ready to send. Don't include a subject line. Start with "Hi ${invoice.clientName}," and end with a sign-off from me.
  `;
  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error generating email body:", error);
    return `Subject: Invoice ${invoice.invoiceNumber} from ${invoice.senderName}\n\nHi ${invoice.clientName},\n\nPlease find attached invoice #${invoice.invoiceNumber} for ${formattedTotal}, due on ${invoice.dueDate}.\n\nThank you for your business.\n\nBest regards,\n${invoice.senderName}`;
  }
};

export const generateDashboardInsights = async (invoices: Invoice[]): Promise<string> => {
  if (invoices.length === 0) {
    return "No invoice data to analyze. Start by creating an invoice!";
  }

  // Find the most common currency to provide focused insights
  const currencyCounts = invoices.reduce((acc, inv) => {
    acc[inv.currency] = (acc[inv.currency] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const dominantCurrency = Object.keys(currencyCounts).reduce((a, b) => currencyCounts[a] > currencyCounts[b] ? a : b, '');

  if (!dominantCurrency) {
    return "No invoices with a consistent currency to analyze.";
  }
  
  const filteredInvoices = invoices.filter(inv => inv.currency === dominantCurrency);

  const totals = filteredInvoices.reduce((acc, inv) => {
      const invTotal = inv.items.reduce((sum, item) => sum + item.quantity * item.rate, 0);
      if(inv.status === InvoiceStatus.PAID) {
          acc.paid += invTotal;
      } else if (inv.status === InvoiceStatus.SENT || inv.status === InvoiceStatus.OVERDUE) {
          acc.unpaid += invTotal;
      }
      return acc;
  }, { paid: 0, unpaid: 0 });

  const statusCounts = filteredInvoices.reduce((acc, inv) => {
    acc[inv.status] = (acc[inv.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const prompt = `
    Analyze the following invoice data and provide very short, crisp, actionable insights in 2-3 bullet points. Use markdown for the bullet points.
    
    Data for ${dominantCurrency} invoices:
    - Total Invoices (${dominantCurrency}): ${filteredInvoices.length}
    - Invoices by Status: ${JSON.stringify(statusCounts)}
    - Total Paid Amount: ${formatCurrency(totals.paid, dominantCurrency)}
    - Total Unpaid (Sent or Overdue) Amount: ${formatCurrency(totals.unpaid, dominantCurrency)}

    Example format:
    * You have X overdue invoices. Follow up on them today.
    * Your paid vs. unpaid ratio is looking healthy. Keep it up!
  `;
  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error generating dashboard insights:", error);
    return "Could not generate AI insights at this time.";
  }
};