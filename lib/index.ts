/**
 * Pay Lobster - Payment Infrastructure for AI Agents
 * The Stripe for autonomous agents on Base
 * 
 * @packageDocumentation
 */

export { LobsterAgent } from './agent';
export { createLobsterAgent, quickStart } from './easy';
export * from './types';
export { resolveUsername, registerUsername, getUsername, listUsernames } from './usernames';
export { getSwapQuote, executeSwap, getPrice, getSupportedTokens } from './swap';
export type { SwapQuote, SwapOptions, SwapResult } from './swap';
export { stats, loadStats, recordTransfer, recordEscrow, getStatsSummary, getLeaderboard } from './stats';
export type { PayLobsterStats, WalletStats } from './stats';
export { subscriptions } from './subscriptions';
export type { Subscription } from './subscriptions';
export { invoices } from './invoices';
export type { Invoice, InvoiceItem } from './invoices';
export { splits } from './splits';
export type { SplitRecipient, SplitResult } from './splits';
export { gamification } from './gamification';
export type { Badge, PlayerStats } from './gamification';

// Default export for convenience
export { LobsterAgent as default } from './agent';
