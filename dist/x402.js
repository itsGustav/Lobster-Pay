"use strict";
/**
 * x402 Protocol Client - Multi-Chain Support
 * Handles HTTP 402 Payment Required responses
 * Supports Base and Solana payments
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.X402Client = void 0;
exports.createX402Fetch = createX402Fetch;
/**
 * X402 Client - Handles automatic payments
 */
class X402Client {
    constructor(config) {
        // Receipt cache (in-memory for now)
        this.receiptCache = new Map();
        this.providers = config.providers;
        this.maxAutoPayUSDC = config.maxAutoPayUSDC;
        this.preferredChain = config.preferredChain;
        this.onPayment = config.onPayment;
        this.onChallenge = config.onChallenge;
    }
    /**
     * Enhanced fetch with x402 support
     */
    async fetch(url, options) {
        // Check cache first
        const cachedProof = this.receiptCache.get(url);
        if (cachedProof && cachedProof.timestamp + 3600 > Date.now() / 1000) {
            // Use cached payment proof
            return this.fetchWithProof(url, cachedProof, options);
        }
        // Try without payment first
        let response = await fetch(url, options);
        // Handle 402 Payment Required
        if (response.status === 402) {
            const challenge = await this.parseChallenge(response);
            if (!challenge) {
                throw new Error('Invalid 402 response: missing payment challenge');
            }
            this.onChallenge?.(challenge);
            // Execute payment
            const proof = await this.pay(challenge);
            this.onPayment?.(proof);
            // Cache proof
            this.receiptCache.set(url, proof);
            // Retry with proof
            response = await this.fetchWithProof(url, proof, options);
        }
        return response;
    }
    /**
     * Parse payment challenge from 402 response
     */
    async parseChallenge(response) {
        try {
            const body = await response.json();
            if (body['x-payment-required']) {
                return body['x-payment-required'];
            }
            return null;
        }
        catch {
            return null;
        }
    }
    /**
     * Execute payment for challenge
     */
    async pay(challenge) {
        // Check expiration
        if (challenge.expires < Date.now() / 1000) {
            throw new Error('Payment challenge expired');
        }
        // Select chain to pay with
        const paymentOption = this.selectPaymentOption(challenge);
        if (!paymentOption) {
            const chains = challenge.chains.map(c => c.chain).join(', ');
            throw new Error(`No provider available for supported chains: ${chains}`);
        }
        const { chain, receiver, amount } = paymentOption;
        const provider = this.providers.get(chain);
        if (!provider) {
            throw new Error(`Provider not found for chain: ${chain}`);
        }
        // Check amount limit
        const amountNum = parseFloat(amount);
        if (this.maxAutoPayUSDC && amountNum > this.maxAutoPayUSDC) {
            throw new Error(`Payment amount ${amountNum} USDC exceeds limit ${this.maxAutoPayUSDC} USDC`);
        }
        console.log(`💳 [x402] Paying ${amount} USDC on ${chain} to ${receiver}`);
        // Execute payment
        const txHash = await provider.sendUSDC(receiver, amountNum);
        // Wait for confirmation
        await provider.waitForConfirmation(txHash);
        const proof = {
            chain,
            txHash,
            amount,
            receiver,
            nonce: challenge.nonce,
            timestamp: Math.floor(Date.now() / 1000),
        };
        return proof;
    }
    /**
     * Select best payment option from challenge
     */
    selectPaymentOption(challenge) {
        // Try preferred chain first
        if (this.preferredChain) {
            const option = challenge.chains.find(c => c.chain === this.preferredChain && this.providers.has(this.preferredChain));
            if (option) {
                return {
                    chain: this.preferredChain,
                    receiver: option.receiver,
                    amount: option.amount,
                };
            }
        }
        // Find first available chain
        for (const option of challenge.chains) {
            const chain = option.chain;
            if (this.providers.has(chain)) {
                return {
                    chain,
                    receiver: option.receiver,
                    amount: option.amount,
                };
            }
        }
        return null;
    }
    /**
     * Fetch with payment proof headers
     */
    async fetchWithProof(url, proof, options) {
        const headers = new Headers(options?.headers);
        // Add payment proof headers
        headers.set('X-Payment-Chain', proof.chain);
        headers.set('X-Payment-TxHash', proof.txHash);
        headers.set('X-Payment-Amount', proof.amount);
        headers.set('X-Payment-Nonce', proof.nonce);
        headers.set('X-Payment-Timestamp', proof.timestamp.toString());
        return fetch(url, {
            ...options,
            headers,
        });
    }
    /**
     * Clear receipt cache
     */
    clearCache() {
        this.receiptCache.clear();
    }
    /**
     * Get cached receipts
     */
    getCachedReceipts() {
        return Array.from(this.receiptCache.values());
    }
}
exports.X402Client = X402Client;
/**
 * Helper: Create x402 fetch function
 */
function createX402Fetch(config) {
    const client = new X402Client(config);
    return (url, options) => client.fetch(url, options);
}
//# sourceMappingURL=x402.js.map