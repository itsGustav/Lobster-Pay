/**
 * x402 Protocol Client - Multi-Chain Support
 * Handles HTTP 402 Payment Required responses
 * Supports Base and Solana payments
 */
import { ChainProvider, ChainName } from './chains';
export interface X402PaymentChallenge {
    version: '1';
    chains: Array<{
        chain: 'base' | 'solana' | 'ethereum';
        network: string;
        receiver: string;
        asset: string;
        amount: string;
    }>;
    description: string;
    expires: number;
    nonce: string;
}
export interface X402PaymentProof {
    chain: ChainName;
    txHash: string;
    amount: string;
    receiver: string;
    nonce: string;
    timestamp: number;
}
export interface X402Config {
    providers: Map<ChainName, ChainProvider>;
    maxAutoPayUSDC?: number;
    preferredChain?: ChainName;
    onPayment?: (proof: X402PaymentProof) => void;
    onChallenge?: (challenge: X402PaymentChallenge) => void;
}
/**
 * X402 Client - Handles automatic payments
 */
export declare class X402Client {
    private providers;
    private maxAutoPayUSDC?;
    private preferredChain?;
    private onPayment?;
    private onChallenge?;
    private receiptCache;
    constructor(config: X402Config);
    /**
     * Enhanced fetch with x402 support
     */
    fetch(url: string, options?: RequestInit): Promise<Response>;
    /**
     * Parse payment challenge from 402 response
     */
    private parseChallenge;
    /**
     * Execute payment for challenge
     */
    private pay;
    /**
     * Select best payment option from challenge
     */
    private selectPaymentOption;
    /**
     * Fetch with payment proof headers
     */
    private fetchWithProof;
    /**
     * Clear receipt cache
     */
    clearCache(): void;
    /**
     * Get cached receipts
     */
    getCachedReceipts(): X402PaymentProof[];
}
/**
 * Helper: Create x402 fetch function
 */
export declare function createX402Fetch(config: X402Config): (url: string, options?: RequestInit) => Promise<Response>;
//# sourceMappingURL=x402.d.ts.map