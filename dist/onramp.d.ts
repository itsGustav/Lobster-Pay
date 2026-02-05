/**
 * Coinbase Onramp Integration
 * Card-to-crypto payments via Coinbase Pay
 *
 * Enables users to fund their wallets with USDC using:
 * - Debit/credit cards
 * - Apple Pay (US)
 * - Bank transfers
 * - Existing Coinbase balance
 */
export interface OnrampConfig {
    /** CDP API Key ID */
    apiKeyId?: string;
    /** CDP Private Key (base64 or PEM) */
    privateKey?: string;
}
export interface OnrampSessionParams {
    /** Destination wallet address */
    destinationAddress: string;
    /** Blockchain network (default: 'base') */
    blockchain?: string;
    /** Assets to enable (default: ['USDC']) */
    assets?: string[];
    /** Client IP for security validation */
    clientIp?: string;
}
export interface OnrampUrlParams {
    /** Session token from API */
    sessionToken: string;
    /** Amount in USD */
    amount: number;
    /** Asset to purchase (default: 'USDC') */
    asset?: string;
    /** Fiat currency (default: 'USD') */
    fiatCurrency?: string;
    /** Redirect URL after completion */
    redirectUrl?: string;
}
export interface OnrampSession {
    token: string;
    channelId?: string;
}
export interface OnrampResult {
    /** URL to open Coinbase Pay */
    url: string;
    /** Session token (for tracking) */
    sessionToken: string;
    /** Amount in USD */
    amount: number;
    /** Destination address */
    destinationAddress: string;
}
/**
 * Get a session token for Coinbase Onramp
 */
export declare function getOnrampSession(params: OnrampSessionParams, config?: OnrampConfig): Promise<OnrampSession>;
/**
 * Generate a Coinbase Onramp URL
 */
export declare function generateOnrampUrl(params: OnrampUrlParams): string;
/**
 * Create a complete onramp flow - get session and generate URL
 *
 * @example
 * ```typescript
 * const result = await createOnrampUrl({
 *   destinationAddress: '0x1234...',
 *   amount: 100, // $100 USD
 * });
 * console.log('Fund your wallet:', result.url);
 * ```
 */
export declare function createOnrampUrl(params: {
    destinationAddress: string;
    amount: number;
    blockchain?: string;
    assets?: string[];
    fiatCurrency?: string;
    redirectUrl?: string;
    clientIp?: string;
}, config?: OnrampConfig): Promise<OnrampResult>;
/**
 * Check onramp transaction status
 */
export declare function getOnrampStatus(partnerUserId: string, config?: OnrampConfig): Promise<any>;
/**
 * Onramp manager for the LobsterAgent
 */
export declare const onramp: {
    /**
     * Generate a URL for the user to fund their wallet with a card
     *
     * @example
     * ```typescript
     * const { url } = await onramp.fundWithCard({
     *   address: '0x1234...',
     *   amount: 50 // $50 USD
     * });
     * console.log('Click to add funds:', url);
     * ```
     */
    fundWithCard(params: {
        address: string;
        amount: number;
        asset?: string;
        redirectUrl?: string;
    }, config?: OnrampConfig): Promise<OnrampResult>;
    /**
     * Get a simple URL without server-side session (uses Coinbase's default flow)
     * Less secure but works without CDP credentials
     */
    getSimpleUrl(params: {
        address: string;
        amount: number;
        asset?: string;
    }): string;
    /**
     * Check status of an onramp transaction
     */
    getStatus: typeof getOnrampStatus;
};
export default onramp;
//# sourceMappingURL=onramp.d.ts.map