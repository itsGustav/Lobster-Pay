/**
 * Pay Lobster Invoices Module
 * Payment requests between agents 🦞
 */
export interface Invoice {
    id: string;
    from: string;
    fromName?: string;
    to: string;
    toName?: string;
    amount: string;
    description: string;
    status: 'pending' | 'paid' | 'declined' | 'expired' | 'cancelled';
    createdAt: string;
    expiresAt?: string;
    paidAt?: string;
    paidTxHash?: string;
    reference?: string;
    items?: InvoiceItem[];
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
/**
 * Create a new invoice
 */
export declare function createInvoice(options: {
    from: string;
    fromName?: string;
    to: string;
    toName?: string;
    amount: string;
    description: string;
    reference?: string;
    items?: InvoiceItem[];
    expiresInDays?: number;
}): Invoice;
/**
 * Get invoice by ID
 */
export declare function getInvoice(id: string): Invoice | null;
/**
 * Get all invoices for a wallet
 */
export declare function getInvoices(wallet: string): {
    sent: Invoice[];
    received: Invoice[];
};
/**
 * Get pending invoices to pay
 */
export declare function getPendingInvoices(wallet: string): Invoice[];
/**
 * Mark invoice as paid
 */
export declare function markPaid(id: string, txHash: string): boolean;
/**
 * Decline an invoice
 */
export declare function declineInvoice(id: string, wallet: string): boolean;
/**
 * Cancel an invoice (by creator)
 */
export declare function cancelInvoice(id: string, wallet: string): boolean;
/**
 * Format invoice for display
 */
export declare function formatInvoice(invoice: Invoice, perspective: 'sender' | 'receiver'): string;
/**
 * Get invoices summary
 */
export declare function getInvoicesSummary(wallet: string): string;
export declare const invoices: {
    create: typeof createInvoice;
    get: typeof getInvoice;
    getAll: typeof getInvoices;
    getPending: typeof getPendingInvoices;
    markPaid: typeof markPaid;
    decline: typeof declineInvoice;
    cancel: typeof cancelInvoice;
    format: typeof formatInvoice;
    summary: typeof getInvoicesSummary;
};
//# sourceMappingURL=invoices.d.ts.map