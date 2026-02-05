/**
 * Multi-Chain LobsterAgent
 * Extends LobsterAgent with Solana + x402 support
 */
import { LobsterAgent } from './agent';
import type { LobsterConfig, Transfer, TransferOptions } from './types';
import { ChainName } from './chains';
import { X402PaymentProof } from './x402';
export interface MultiChainLobsterConfig extends LobsterConfig {
    chains?: {
        base?: {
            rpc?: string;
            privateKey: string;
            escrowAddress?: string;
            registryAddress?: string;
        };
        solana?: {
            rpc?: string;
            privateKey: string;
            escrowAddress?: string;
            registryAddress?: string;
        };
    };
    defaultChain?: ChainName;
    x402?: {
        enabled?: boolean;
        maxAutoPayUSDC?: number;
    };
}
export declare class MultiChainLobsterAgent extends LobsterAgent {
    private chainManager?;
    private x402Client?;
    private multiChainConfig?;
    constructor(config?: MultiChainLobsterConfig);
    /**
     * Initialize with multi-chain support
     */
    initialize(): Promise<void>;
    /**
     * Send USDC with chain selection
     */
    send(to: string, amount: number | string, opts?: {
        chain?: ChainName;
        memo?: string;
    }): Promise<Transfer>;
    /**
     * Multi-chain send implementation
     */
    private sendMultiChain;
    /**
     * Transfer with explicit chain selection
     */
    transfer(options: TransferOptions & {
        chain?: ChainName;
    }): Promise<Transfer>;
    /**
     * Get balance on specific chain
     */
    getBalance(chain?: ChainName): Promise<string>;
    /**
     * Get balances across all chains
     */
    getAllBalances(): Promise<Record<ChainName, {
        usdc: string;
        native: string;
        address: string;
    }>>;
    /**
     * Get active chains
     */
    getActiveChains(): ChainName[];
    /**
     * Get default chain
     */
    getDefaultChain(): ChainName;
    /**
     * x402 enabled fetch
     */
    payX402(url: string, options?: RequestInit): Promise<Response>;
    /**
     * Get x402 payment history
     */
    getX402Receipts(): X402PaymentProof[];
    /**
     * Create escrow on specific chain (Base only for now)
     */
    createEscrow(options: any & {
        chain?: ChainName;
    }): Promise<any>;
    /**
     * Get summary of all wallets and balances
     */
    getMultiChainSummary(): Promise<string>;
}
export { LobsterAgent } from './agent';
//# sourceMappingURL=agent-multichain.d.ts.map