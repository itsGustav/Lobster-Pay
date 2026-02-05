/**
 * Base Chain Provider (Ethereum L2)
 * Wraps existing ethers.js implementation
 */
import { ethers } from 'ethers';
import { ChainProvider, ChainConfig } from './types';
export declare class BaseProvider implements ChainProvider {
    private signer;
    private provider;
    private config;
    constructor(privateKey: string, rpcUrl?: string, config?: Partial<ChainConfig>);
    getAddress(): string;
    getChainName(): 'base';
    getBalance(address: string): Promise<bigint>;
    getNativeBalance(address: string): Promise<string>;
    sendUSDC(to: string, amount: number): Promise<string>;
    waitForConfirmation(txHash: string): Promise<boolean>;
    signMessage(message: string): Promise<string>;
    /**
     * Get provider instance for advanced operations
     */
    getProvider(): ethers.JsonRpcProvider;
    /**
     * Get signer instance for contract interactions
     */
    getSigner(): ethers.Wallet;
    /**
     * Get contract addresses
     */
    getConfig(): ChainConfig;
}
//# sourceMappingURL=base.d.ts.map