/**
 * Chain Factory - Returns appropriate provider based on chain name
 */
import { ChainProvider, ChainName, MultiChainConfig } from './types';
/**
 * Create a chain provider instance
 */
export declare function createChainProvider(chain: ChainName, config: MultiChainConfig): ChainProvider;
/**
 * Multi-chain manager
 */
export declare class MultiChainManager {
    private providers;
    private defaultChain;
    constructor(config: MultiChainConfig);
    /**
     * Get provider for specific chain
     */
    getProvider(chain?: ChainName): ChainProvider;
    /**
     * Get all active chains
     */
    getActiveChains(): ChainName[];
    /**
     * Get default chain
     */
    getDefaultChain(): ChainName;
    /**
     * Check if chain is supported
     */
    hasChain(chain: ChainName): boolean;
    /**
     * Get balances across all chains
     */
    getAllBalances(): Promise<Record<ChainName, {
        usdc: string;
        native: string;
        address: string;
    }>>;
}
export * from './types';
export { BaseProvider } from './base';
export { SolanaProvider } from './solana';
//# sourceMappingURL=index.d.ts.map