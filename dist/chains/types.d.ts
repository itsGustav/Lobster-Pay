/**
 * Chain Abstraction Layer - Type Definitions
 * Supports Base (Ethereum L2) and Solana
 */
export type ChainName = 'base' | 'solana';
export interface ChainConfig {
    name: ChainName;
    rpc: string;
    usdcAddress: string;
    escrowAddress?: string;
    registryAddress?: string;
}
export interface ChainProvider {
    /**
     * Get native address format
     */
    getAddress(): string;
    /**
     * Get USDC balance for an address
     */
    getBalance(address: string): Promise<bigint>;
    /**
     * Send USDC to another address
     * @returns Transaction hash/signature
     */
    sendUSDC(to: string, amount: number): Promise<string>;
    /**
     * Sign a message
     */
    signMessage(message: string): Promise<string>;
    /**
     * Get native token (ETH/SOL) balance for gas
     */
    getNativeBalance(address: string): Promise<string>;
    /**
     * Wait for transaction confirmation
     */
    waitForConfirmation(txHash: string): Promise<boolean>;
    /**
     * Get chain name
     */
    getChainName(): ChainName;
}
export interface MultiChainConfig {
    chains: {
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
}
export interface TransferResult {
    txHash: string;
    status: 'pending' | 'confirmed' | 'failed';
    chain: ChainName;
}
//# sourceMappingURL=types.d.ts.map