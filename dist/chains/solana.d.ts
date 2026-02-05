/**
 * Solana Chain Provider
 * Handles USDC transfers via SPL Token program
 */
import { Connection, Keypair } from '@solana/web3.js';
import { ChainProvider, ChainConfig } from './types';
export declare class SolanaProvider implements ChainProvider {
    private keypair;
    private connection;
    private config;
    private usdcMint;
    constructor(privateKey: string, rpcUrl?: string, config?: Partial<ChainConfig>, useDevnet?: boolean);
    getAddress(): string;
    getChainName(): 'solana';
    getBalance(address: string): Promise<bigint>;
    getNativeBalance(address: string): Promise<string>;
    sendUSDC(to: string, amount: number): Promise<string>;
    waitForConfirmation(signature: string): Promise<boolean>;
    signMessage(message: string): Promise<string>;
    /**
     * Get connection instance for advanced operations
     */
    getConnection(): Connection;
    /**
     * Get keypair instance
     */
    getKeypair(): Keypair;
    /**
     * Get config
     */
    getConfig(): ChainConfig;
    /**
     * Parse private key from various formats
     */
    private parsePrivateKey;
    /**
     * Simple base58 decoder
     */
    private base58Decode;
    /**
     * Request airdrop (devnet only)
     */
    requestAirdrop(amount?: number): Promise<string>;
}
//# sourceMappingURL=solana.d.ts.map