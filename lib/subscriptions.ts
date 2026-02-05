/**
 * Pay Lobster Subscriptions Module
 * Recurring payments between agents 🦞
 */

import * as fs from 'fs';
import * as path from 'path';
import { ethers } from 'ethers';
import { CONTRACTS, ERC20_ABI } from './contracts';

const BASE_RPC = 'https://mainnet.base.org';
const SUBS_FILE = path.join(process.env.HOME || '/tmp', '.paylobster', 'subscriptions.json');

export interface Subscription {
  id: string;
  from: string;           // Payer address
  to: string;             // Recipient address
  toName?: string;        // @username or name.base.eth
  amount: string;         // USDC amount per period
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  periodMs: number;       // Period in milliseconds
  description?: string;
  
  // State
  status: 'active' | 'paused' | 'cancelled' | 'failed';
  createdAt: string;
  nextPayment: string;    // ISO date of next payment
  lastPayment?: string;   // ISO date of last successful payment
  paymentCount: number;   // Total successful payments
  totalPaid: string;      // Total USDC paid
  
  // Failure tracking
  failureCount: number;
  lastError?: string;
}

export interface SubscriptionsData {
  subscriptions: Subscription[];
  lastProcessed: string;
}

const PERIOD_MS: Record<string, number> = {
  'daily': 24 * 60 * 60 * 1000,
  'weekly': 7 * 24 * 60 * 60 * 1000,
  'monthly': 30 * 24 * 60 * 60 * 1000,
  'yearly': 365 * 24 * 60 * 60 * 1000,
};

function loadSubscriptions(): SubscriptionsData {
  try {
    if (fs.existsSync(SUBS_FILE)) {
      return JSON.parse(fs.readFileSync(SUBS_FILE, 'utf-8'));
    }
  } catch (e) {}
  return { subscriptions: [], lastProcessed: new Date().toISOString() };
}

function saveSubscriptions(data: SubscriptionsData): void {
  const dir = path.dirname(SUBS_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(SUBS_FILE, JSON.stringify(data, null, 2));
}

function generateId(): string {
  return 'sub_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

/**
 * Create a new subscription
 */
export function createSubscription(options: {
  from: string;
  to: string;
  toName?: string;
  amount: string;
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  description?: string;
  startNow?: boolean;
}): Subscription {
  const data = loadSubscriptions();
  
  const now = new Date();
  const periodMs = PERIOD_MS[options.period];
  const nextPayment = options.startNow 
    ? now.toISOString() 
    : new Date(now.getTime() + periodMs).toISOString();
  
  const sub: Subscription = {
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
export function getSubscriptions(wallet: string): {
  paying: Subscription[];
  receiving: Subscription[];
} {
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
export function getSubscription(id: string): Subscription | null {
  const data = loadSubscriptions();
  return data.subscriptions.find(s => s.id === id) || null;
}

/**
 * Cancel a subscription
 */
export function cancelSubscription(id: string, wallet: string): boolean {
  const data = loadSubscriptions();
  const sub = data.subscriptions.find(s => s.id === id);
  
  if (!sub) return false;
  if (sub.from.toLowerCase() !== wallet.toLowerCase()) return false;
  
  sub.status = 'cancelled';
  saveSubscriptions(data);
  return true;
}

/**
 * Pause a subscription
 */
export function pauseSubscription(id: string, wallet: string): boolean {
  const data = loadSubscriptions();
  const sub = data.subscriptions.find(s => s.id === id);
  
  if (!sub) return false;
  if (sub.from.toLowerCase() !== wallet.toLowerCase()) return false;
  
  sub.status = 'paused';
  saveSubscriptions(data);
  return true;
}

/**
 * Resume a paused subscription
 */
export function resumeSubscription(id: string, wallet: string): boolean {
  const data = loadSubscriptions();
  const sub = data.subscriptions.find(s => s.id === id);
  
  if (!sub) return false;
  if (sub.from.toLowerCase() !== wallet.toLowerCase()) return false;
  if (sub.status !== 'paused') return false;
  
  sub.status = 'active';
  sub.nextPayment = new Date().toISOString(); // Process on next run
  saveSubscriptions(data);
  return true;
}

/**
 * Process due subscriptions (called by cron/heartbeat)
 * Returns list of subscriptions that need payment
 */
export function getDueSubscriptions(): Subscription[] {
  const data = loadSubscriptions();
  const now = new Date();
  
  return data.subscriptions.filter(sub => {
    if (sub.status !== 'active') return false;
    const nextPayment = new Date(sub.nextPayment);
    return nextPayment <= now;
  });
}

/**
 * Record a successful payment for a subscription
 */
export function recordPayment(id: string, txHash: string): void {
  const data = loadSubscriptions();
  const sub = data.subscriptions.find(s => s.id === id);
  
  if (!sub) return;
  
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
export function recordFailure(id: string, error: string): void {
  const data = loadSubscriptions();
  const sub = data.subscriptions.find(s => s.id === id);
  
  if (!sub) return;
  
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
export function formatSubscription(sub: Subscription): string {
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
export function getSubscriptionSummary(wallet: string): string {
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
  } else {
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

export const subscriptions = {
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
