"use strict";
/**
 * Pay Lobster Subscriptions Module
 * Recurring payments between agents 🦞
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
exports.subscriptions = void 0;
exports.createSubscription = createSubscription;
exports.getSubscriptions = getSubscriptions;
exports.getSubscription = getSubscription;
exports.cancelSubscription = cancelSubscription;
exports.pauseSubscription = pauseSubscription;
exports.resumeSubscription = resumeSubscription;
exports.getDueSubscriptions = getDueSubscriptions;
exports.recordPayment = recordPayment;
exports.recordFailure = recordFailure;
exports.formatSubscription = formatSubscription;
exports.getSubscriptionSummary = getSubscriptionSummary;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const BASE_RPC = 'https://mainnet.base.org';
const SUBS_FILE = path.join(process.env.HOME || '/tmp', '.paylobster', 'subscriptions.json');
const PERIOD_MS = {
    'daily': 24 * 60 * 60 * 1000,
    'weekly': 7 * 24 * 60 * 60 * 1000,
    'monthly': 30 * 24 * 60 * 60 * 1000,
    'yearly': 365 * 24 * 60 * 60 * 1000,
};
function loadSubscriptions() {
    try {
        if (fs.existsSync(SUBS_FILE)) {
            return JSON.parse(fs.readFileSync(SUBS_FILE, 'utf-8'));
        }
    }
    catch (e) { }
    return { subscriptions: [], lastProcessed: new Date().toISOString() };
}
function saveSubscriptions(data) {
    const dir = path.dirname(SUBS_FILE);
    if (!fs.existsSync(dir))
        fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(SUBS_FILE, JSON.stringify(data, null, 2));
}
function generateId() {
    return 'sub_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}
/**
 * Create a new subscription
 */
function createSubscription(options) {
    const data = loadSubscriptions();
    const now = new Date();
    const periodMs = PERIOD_MS[options.period];
    const nextPayment = options.startNow
        ? now.toISOString()
        : new Date(now.getTime() + periodMs).toISOString();
    const sub = {
        id: generateId(),
        from: options.from.toLowerCase(),
        to: options.to.toLowerCase(),
        toName: options.toName,
        amount: options.amount,
        period: options.period,
        periodMs,
        description: options.description,
        status: 'active',
        createdAt: now.toISOString(),
        nextPayment,
        paymentCount: 0,
        totalPaid: '0',
        failureCount: 0,
    };
    data.subscriptions.push(sub);
    saveSubscriptions(data);
    return sub;
}
/**
 * Get all subscriptions for a wallet (as payer or recipient)
 */
function getSubscriptions(wallet) {
    const data = loadSubscriptions();
    const addr = wallet.toLowerCase();
    return {
        paying: data.subscriptions.filter(s => s.from === addr && s.status !== 'cancelled'),
        receiving: data.subscriptions.filter(s => s.to === addr && s.status !== 'cancelled'),
    };
}
/**
 * Get a subscription by ID
 */
function getSubscription(id) {
    const data = loadSubscriptions();
    return data.subscriptions.find(s => s.id === id) || null;
}
/**
 * Cancel a subscription
 */
function cancelSubscription(id, wallet) {
    const data = loadSubscriptions();
    const sub = data.subscriptions.find(s => s.id === id);
    if (!sub)
        return false;
    if (sub.from.toLowerCase() !== wallet.toLowerCase())
        return false;
    sub.status = 'cancelled';
    saveSubscriptions(data);
    return true;
}
/**
 * Pause a subscription
 */
function pauseSubscription(id, wallet) {
    const data = loadSubscriptions();
    const sub = data.subscriptions.find(s => s.id === id);
    if (!sub)
        return false;
    if (sub.from.toLowerCase() !== wallet.toLowerCase())
        return false;
    sub.status = 'paused';
    saveSubscriptions(data);
    return true;
}
/**
 * Resume a paused subscription
 */
function resumeSubscription(id, wallet) {
    const data = loadSubscriptions();
    const sub = data.subscriptions.find(s => s.id === id);
    if (!sub)
        return false;
    if (sub.from.toLowerCase() !== wallet.toLowerCase())
        return false;
    if (sub.status !== 'paused')
        return false;
    sub.status = 'active';
    sub.nextPayment = new Date().toISOString(); // Process on next run
    saveSubscriptions(data);
    return true;
}
/**
 * Process due subscriptions (called by cron/heartbeat)
 * Returns list of subscriptions that need payment
 */
function getDueSubscriptions() {
    const data = loadSubscriptions();
    const now = new Date();
    return data.subscriptions.filter(sub => {
        if (sub.status !== 'active')
            return false;
        const nextPayment = new Date(sub.nextPayment);
        return nextPayment <= now;
    });
}
/**
 * Record a successful payment for a subscription
 */
function recordPayment(id, txHash) {
    const data = loadSubscriptions();
    const sub = data.subscriptions.find(s => s.id === id);
    if (!sub)
        return;
    const now = new Date();
    sub.lastPayment = now.toISOString();
    sub.nextPayment = new Date(now.getTime() + sub.periodMs).toISOString();
    sub.paymentCount += 1;
    sub.totalPaid = (parseFloat(sub.totalPaid) + parseFloat(sub.amount)).toFixed(2);
    sub.failureCount = 0;
    sub.lastError = undefined;
    saveSubscriptions(data);
}
/**
 * Record a failed payment
 */
function recordFailure(id, error) {
    const data = loadSubscriptions();
    const sub = data.subscriptions.find(s => s.id === id);
    if (!sub)
        return;
    sub.failureCount += 1;
    sub.lastError = error;
    // Auto-pause after 3 failures
    if (sub.failureCount >= 3) {
        sub.status = 'failed';
    }
    saveSubscriptions(data);
}
/**
 * Format subscription for display
 */
function formatSubscription(sub) {
    const statusEmoji = {
        active: '✅',
        paused: '⏸️',
        cancelled: '❌',
        failed: '⚠️',
    }[sub.status];
    const toDisplay = sub.toName || `${sub.to.slice(0, 6)}...${sub.to.slice(-4)}`;
    const nextDate = new Date(sub.nextPayment).toLocaleDateString();
    return `${statusEmoji} $${sub.amount}/${sub.period} → ${toDisplay}
   ID: ${sub.id}
   Next: ${nextDate} | Paid: ${sub.paymentCount}x ($${sub.totalPaid})`;
}
/**
 * Get subscription summary
 */
function getSubscriptionSummary(wallet) {
    const { paying, receiving } = getSubscriptions(wallet);
    const activePaying = paying.filter(s => s.status === 'active');
    const activeReceiving = receiving.filter(s => s.status === 'active');
    const monthlyOut = activePaying.reduce((sum, s) => {
        const monthly = parseFloat(s.amount) * (PERIOD_MS['monthly'] / s.periodMs);
        return sum + monthly;
    }, 0);
    const monthlyIn = activeReceiving.reduce((sum, s) => {
        const monthly = parseFloat(s.amount) * (PERIOD_MS['monthly'] / s.periodMs);
        return sum + monthly;
    }, 0);
    let output = `🔄 Your Subscriptions\n\n`;
    if (activePaying.length > 0) {
        output += `📤 PAYING (${activePaying.length})\n`;
        output += activePaying.map(formatSubscription).join('\n\n');
        output += `\n\n💸 Monthly outflow: ~$${monthlyOut.toFixed(2)}\n`;
    }
    else {
        output += `📤 No active subscriptions\n`;
    }
    output += `\n`;
    if (activeReceiving.length > 0) {
        output += `📥 RECEIVING (${activeReceiving.length})\n`;
        output += activeReceiving.map(formatSubscription).join('\n\n');
        output += `\n\n💰 Monthly inflow: ~$${monthlyIn.toFixed(2)}\n`;
    }
    return output;
}
exports.subscriptions = {
    create: createSubscription,
    get: getSubscription,
    getAll: getSubscriptions,
    cancel: cancelSubscription,
    pause: pauseSubscription,
    resume: resumeSubscription,
    getDue: getDueSubscriptions,
    recordPayment,
    recordFailure,
    format: formatSubscription,
    summary: getSubscriptionSummary,
};
//# sourceMappingURL=subscriptions.js.map