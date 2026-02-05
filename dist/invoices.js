"use strict";
/**
 * Pay Lobster Invoices Module
 * Payment requests between agents 🦞
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.invoices = void 0;
exports.createInvoice = createInvoice;
exports.getInvoice = getInvoice;
exports.getInvoices = getInvoices;
exports.getPendingInvoices = getPendingInvoices;
exports.markPaid = markPaid;
exports.declineInvoice = declineInvoice;
exports.cancelInvoice = cancelInvoice;
exports.formatInvoice = formatInvoice;
exports.getInvoicesSummary = getInvoicesSummary;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const INVOICES_FILE = path.join(process.env.HOME || '/tmp', '.paylobster', 'invoices.json');
function loadInvoices() {
    try {
        if (fs.existsSync(INVOICES_FILE)) {
            return JSON.parse(fs.readFileSync(INVOICES_FILE, 'utf-8'));
        }
    }
    catch (e) { }
    return { invoices: [] };
}
function saveInvoices(data) {
    const dir = path.dirname(INVOICES_FILE);
    if (!fs.existsSync(dir))
        fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(INVOICES_FILE, JSON.stringify(data, null, 2));
}
function generateId() {
    return 'inv_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}
/**
 * Create a new invoice
 */
function createInvoice(options) {
    const data = loadInvoices();
    const now = new Date();
    const expiresAt = options.expiresInDays
        ? new Date(now.getTime() + options.expiresInDays * 24 * 60 * 60 * 1000).toISOString()
        : undefined;
    const invoice = {
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
function getInvoice(id) {
    const data = loadInvoices();
    return data.invoices.find(i => i.id === id) || null;
}
/**
 * Get all invoices for a wallet
 */
function getInvoices(wallet) {
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
function getPendingInvoices(wallet) {
    const { received } = getInvoices(wallet);
    return received.filter(i => i.status === 'pending');
}
/**
 * Mark invoice as paid
 */
function markPaid(id, txHash) {
    const data = loadInvoices();
    const invoice = data.invoices.find(i => i.id === id);
    if (!invoice || invoice.status !== 'pending')
        return false;
    invoice.status = 'paid';
    invoice.paidAt = new Date().toISOString();
    invoice.paidTxHash = txHash;
    saveInvoices(data);
    return true;
}
/**
 * Decline an invoice
 */
function declineInvoice(id, wallet) {
    const data = loadInvoices();
    const invoice = data.invoices.find(i => i.id === id);
    if (!invoice || invoice.status !== 'pending')
        return false;
    if (invoice.to.toLowerCase() !== wallet.toLowerCase())
        return false;
    invoice.status = 'declined';
    saveInvoices(data);
    return true;
}
/**
 * Cancel an invoice (by creator)
 */
function cancelInvoice(id, wallet) {
    const data = loadInvoices();
    const invoice = data.invoices.find(i => i.id === id);
    if (!invoice || invoice.status !== 'pending')
        return false;
    if (invoice.from.toLowerCase() !== wallet.toLowerCase())
        return false;
    invoice.status = 'cancelled';
    saveInvoices(data);
    return true;
}
/**
 * Format invoice for display
 */
function formatInvoice(invoice, perspective) {
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
function getInvoicesSummary(wallet) {
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
    }
    else {
        output += `No pending invoices sent.\n`;
    }
    output += `\n📥 RECEIVED (${pendingReceived.length} pending)\n`;
    if (pendingReceived.length > 0) {
        output += pendingReceived.map(i => formatInvoice(i, 'receiver')).join('\n\n');
        output += `\n\n💸 To pay: $${pendingInAmount.toFixed(2)}\n`;
    }
    else {
        output += `No invoices to pay.\n`;
    }
    return output;
}
exports.invoices = {
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
//# sourceMappingURL=invoices.js.map