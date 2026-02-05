/**
 * Pay Lobster Subscriptions Module
 * Recurring payments between agents 🦞
 */
export interface Subscription {
    id: string;
    from: string;
    to: string;
    toName?: string;
    amount: string;
    period: 'daily' | 'weekly' | 'monthly' | 'yearly';
    periodMs: number;
    description?: string;
    status: 'active' | 'paused' | 'cancelled' | 'failed';
    createdAt: string;
    nextPayment: string;
    lastPayment?: string;
    paymentCount: number;
    totalPaid: string;
    failureCount: number;
    lastError?: string;
}
export interface SubscriptionsData {
    subscriptions: Subscription[];
    lastProcessed: string;
}
/**
 * Create a new subscription
 */
export declare function createSubscription(options: {
    from: string;
    to: string;
    toName?: string;
    amount: string;
    period: 'daily' | 'weekly' | 'monthly' | 'yearly';
    description?: string;
    startNow?: boolean;
}): Subscription;
/**
 * Get all subscriptions for a wallet (as payer or recipient)
 */
export declare function getSubscriptions(wallet: string): {
    paying: Subscription[];
    receiving: Subscription[];
};
/**
 * Get a subscription by ID
 */
export declare function getSubscription(id: string): Subscription | null;
/**
 * Cancel a subscription
 */
export declare function cancelSubscription(id: string, wallet: string): boolean;
/**
 * Pause a subscription
 */
export declare function pauseSubscription(id: string, wallet: string): boolean;
/**
 * Resume a paused subscription
 */
export declare function resumeSubscription(id: string, wallet: string): boolean;
/**
 * Process due subscriptions (called by cron/heartbeat)
 * Returns list of subscriptions that need payment
 */
export declare function getDueSubscriptions(): Subscription[];
/**
 * Record a successful payment for a subscription
 */
export declare function recordPayment(id: string, txHash: string): void;
/**
 * Record a failed payment
 */
export declare function recordFailure(id: string, error: string): void;
/**
 * Format subscription for display
 */
export declare function formatSubscription(sub: Subscription): string;
/**
 * Get subscription summary
 */
export declare function getSubscriptionSummary(wallet: string): string;
export declare const subscriptions: {
    create: typeof createSubscription;
    get: typeof getSubscription;
    getAll: typeof getSubscriptions;
    cancel: typeof cancelSubscription;
    pause: typeof pauseSubscription;
    resume: typeof resumeSubscription;
    getDue: typeof getDueSubscriptions;
    recordPayment: typeof recordPayment;
    recordFailure: typeof recordFailure;
    format: typeof formatSubscription;
    summary: typeof getSubscriptionSummary;
};
//# sourceMappingURL=subscriptions.d.ts.map