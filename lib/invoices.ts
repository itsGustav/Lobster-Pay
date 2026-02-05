/**
 * Pay Lobster Invoices Module
 * Payment requests between agents 🦞
 */

import * as fs from 'fs';
import * as path from 'path';

const INVOICES_FILE = path.join(process.env.HOME || '/tmp', '.paylobster', 'invoices.json');

export interface Invoice {
  id: string;
  from: string;           // Who's requesting payment (invoice creator)
  fromName?: string;
  to: string;             // Who should pay
  toName?: string;
  amount: string;         // USDC amount
  description: string;
  
  // State
  status: 'pending' | 'paid' | 'declined' | 'expired' | 'cancelled';
  createdAt: string;
  expiresAt?: string;     // Optional expiration
  paidAt?: string;
  paidTxHash?: string;
  
  // Metadata
  reference?: string;     // External reference number
  items?: InvoiceItem[];  // Line items
}

export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: string;
  total: string;
}

export interface InvoicesData {
  invoices: Invoice[];
}

function loadInvoices(): InvoicesData {
  try {
    if (fs.existsSync(INVOICES_FILE)) {
      return JSON.parse(fs.readFileSync(INVOICES_FILE, 'utf-8'));
    }
  } catch (e) {}
  return { invoices: [] };
}

function saveInvoices(data: InvoicesData): void {
  const dir = path.dirname(INVOICES_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(INVOICES_FILE, JSON.stringify(data, null, 2));
}

function generateId(): string {
  return 'inv_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

/**
 * Create a new invoice
 */
export function createInvoice(options: {
  from: string;
  fromName?: string;
  to: string;
  toName?: string;
  amount: string;
  description: string;
  reference?: string;
  items?: InvoiceItem[];
  expiresInDays?: number;
}): Invoice {
  const data = loadInvoices();
  
  const now = new Date();
  const expiresAt = options.expiresInDays 
    ? new Date(now.getTime() + options.expiresInDays * 24 * 60 * 60 * 1000).toISOString()
    : undefined;
  
  const invoice: Invoice = {
    id: generateId(),
    from: options.from.toLowerCase(),
    fromName: options.fromName,
    to: options.to.toLowerCase(),
    toName: options.toName,
    amount: options.amount,
    description: options.description,
    status: 'pending',
    createdAt: now.toISOString(),
    expiresAt,
    reference: options.reference,
    items: options.items,
  };
  
  data.invoices.push(invoice);
  saveInvoices(data);
  
  return invoice;
}

/**
 * Get invoice by ID
 */
export function getInvoice(id: string): Invoice | null {
  const data = loadInvoices();
  return data.invoices.find(i => i.id === id) || null;
}

/**
 * Get all invoices for a wallet
 */
export function getInvoices(wallet: string): {
  sent: Invoice[];      // Invoices I created (requesting payment)
  received: Invoice[];  // Invoices I need to pay
} {
  const data = loadInvoices();
  const addr = wallet.toLowerCase();
  
  // Check for expired invoices
  const now = new Date();
  data.invoices.forEach(inv => {
    if (inv.status === 'pending' && inv.expiresAt) {
      if (new Date(inv.expiresAt) < now) {
        inv.status = 'expired';
      }
    }
  });
  saveInvoices(data);
  
  return {
    sent: data.invoices.filter(i => i.from === addr),
    received: data.invoices.filter(i => i.to === addr),
  };
}

/**
 * Get pending invoices to pay
 */
export function getPendingInvoices(wallet: string): Invoice[] {
  const { received } = getInvoices(wallet);
  return received.filter(i => i.status === 'pending');
}

/**
 * Mark invoice as paid
 */
export function markPaid(id: string, txHash: string): boolean {
  const data = loadInvoices();
  const invoice = data.invoices.find(i => i.id === id);
  
  if (!invoice || invoice.status !== 'pending') return false;
  
  invoice.status = 'paid';
  invoice.paidAt = new Date().toISOString();
  invoice.paidTxHash = txHash;
  
  saveInvoices(data);
  return true;
}

/**
 * Decline an invoice
 */
export function declineInvoice(id: string, wallet: string): boolean {
  const data = loadInvoices();
  const invoice = data.invoices.find(i => i.id === id);
  
  if (!invoice || invoice.status !== 'pending') return false;
  if (invoice.to.toLowerCase() !== wallet.toLowerCase()) return false;
  
  invoice.status = 'declined';
  saveInvoices(data);
  return true;
}

/**
 * Cancel an invoice (by creator)
 */
export function cancelInvoice(id: string, wallet: string): boolean {
  const data = loadInvoices();
  const invoice = data.invoices.find(i => i.id === id);
  
  if (!invoice || invoice.status !== 'pending') return false;
  if (invoice.from.toLowerCase() !== wallet.toLowerCase()) return false;
  
  invoice.status = 'cancelled';
  saveInvoices(data);
  return true;
}

/**
 * Format invoice for display
 */
export function formatInvoice(invoice: Invoice, perspective: 'sender' | 'receiver'): string {
  const statusEmoji = {
    pending: '🟡',
    paid: '✅',
    declined: '❌',
    expired: '⏰',
    cancelled: '🚫',
  }[invoice.status];
  
  const otherParty = perspective === 'sender' 
    ? (invoice.toName || `${invoice.to.slice(0, 6)}...${invoice.to.slice(-4)}`)
    : (invoice.fromName || `${invoice.from.slice(0, 6)}...${invoice.from.slice(-4)}`);
  
  const direction = perspective === 'sender' ? '→' : '←';
  
  let output = `${statusEmoji} $${invoice.amount} ${direction} ${otherParty}
   ID: ${invoice.id}
   "${invoice.description}"`;
  
  if (invoice.status === 'pending' && invoice.expiresAt) {
    const expires = new Date(invoice.expiresAt).toLocaleDateString();
    output += `\n   Expires: ${expires}`;
  }
  
  if (invoice.status === 'paid' && invoice.paidTxHash) {
    output += `\n   Tx: ${invoice.paidTxHash.slice(0, 10)}...`;
  }
  
  return output;
}

/**
 * Get invoices summary
 */
export function getInvoicesSummary(wallet: string): string {
  const { sent, received } = getInvoices(wallet);
  
  const pendingSent = sent.filter(i => i.status === 'pending');
  const pendingReceived = received.filter(i => i.status === 'pending');
  
  const pendingInAmount = pendingReceived.reduce((sum, i) => sum + parseFloat(i.amount), 0);
  const pendingOutAmount = pendingSent.reduce((sum, i) => sum + parseFloat(i.amount), 0);
  
  let output = `🧾 Your Invoices\n\n`;
  
  output += `📤 SENT (${pendingSent.length} pending)\n`;
  if (pendingSent.length > 0) {
    output += pendingSent.map(i => formatInvoice(i, 'sender')).join('\n\n');
    output += `\n\n💰 Awaiting: $${pendingOutAmount.toFixed(2)}\n`;
  } else {
    output += `No pending invoices sent.\n`;
  }
  
  output += `\n📥 RECEIVED (${pendingReceived.length} pending)\n`;
  if (pendingReceived.length > 0) {
    output += pendingReceived.map(i => formatInvoice(i, 'receiver')).join('\n\n');
    output += `\n\n💸 To pay: $${pendingInAmount.toFixed(2)}\n`;
  } else {
    output += `No invoices to pay.\n`;
  }
  
  return output;
}

export const invoices = {
  create: createInvoice,
  get: getInvoice,
  getAll: getInvoices,
  getPending: getPendingInvoices,
  markPaid,
  decline: declineInvoice,
  cancel: cancelInvoice,
  format: formatInvoice,
  summary: getInvoicesSummary,
};
