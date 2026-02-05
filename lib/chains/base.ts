/**
 * Base Chain Provider (Ethereum L2)
 * Wraps existing ethers.js implementation
 */

import { ethers } from 'ethers';
import { ChainProvider, ChainConfig } from './types';
import { CONTRACTS, ERC20_ABI } from '../contracts';

const DEFAULT_BASE_RPC = 'https://mainnet.base.org';
const USDC_BASE = CONTRACTS.usdc;

export class BaseProvider implements ChainProvider {
  private signer: ethers.Wallet;
  private provider: ethers.JsonRpcProvider;
  private config: ChainConfig;

  constructor(privateKey: string, rpcUrl?: string, config?: Partial<ChainConfig>) {
    this.config = {
      name: 'base',
      rpc: rpcUrl || DEFAULT_BASE_RPC,
      usdcAddress: config?.usdcAddress || USDC_BASE,
      escrowAddress: config?.escrowAddress || CONTRACTS.escrow,
      registryAddress: config?.registryAddress || CONTRACTS.registry,
    };

    this.provider = new ethers.JsonRpcProvider(this.config.rpc);
    this.signer = new ethers.Wallet(privateKey, this.provider);
  }

  getAddress(): string {
    return this.signer.address;
  }

  getChainName(): 'base' {
    return 'base';
  }

  async getBalance(address: string): Promise<bigint> {
    const usdc = new ethers.Contract(this.config.usdcAddress, ERC20_ABI, this.provider);
    const balance = await usdc.balanceOf(address);
    return balance;
  }

  async getNativeBalance(address: string): Promise<string> {
    const balance = await this.provider.getBalance(address);
    return ethers.formatEther(balance);
  }

  async sendUSDC(to: string, amount: number): Promise<string> {
    const usdc = new ethers.Contract(this.config.usdcAddress, ERC20_ABI, this.signer);
    
    // Parse amount (USDC has 6 decimals)
    const amountBigInt = ethers.parseUnits(amount.toString(), 6);
    
    // Check balance
    const balance = await this.getBalance(this.signer.address);
    if (balance < amountBigInt) {
      const balanceFormatted = ethers.formatUnits(balance, 6);
      throw new Error(`Insufficient balance. Have: ${balanceFormatted} USDC, Need: ${amount} USDC`);
    }

    console.log(`🦞 [Base] Sending ${amount} USDC to ${to}...`);
    
    // Execute transfer
    const tx = await usdc.transfer(to, amountBigInt);
    console.log(`📤 [Base] Transaction submitted: ${tx.hash}`);
    
    return tx.hash;
  }

  async waitForConfirmation(txHash: string): Promise<boolean> {
    try {
      const receipt = await this.provider.waitForTransaction(txHash);
      console.log(`✅ [Base] Confirmed in block ${receipt?.blockNumber}`);
      return receipt?.status === 1;
    } catch (error) {
      console.error(`❌ [Base] Transaction failed: ${error}`);
      return false;
    }
  }

  async signMessage(message: string): Promise<string> {
    return this.signer.signMessage(message);
  }

  /**
   * Get provider instance for advanced operations
   */
  getProvider(): ethers.JsonRpcProvider {
    return this.provider;
  }

  /**
   * Get signer instance for contract interactions
   */
  getSigner(): ethers.Wallet {
    return this.signer;
  }

  /**
   * Get contract addresses
   */
  getConfig(): ChainConfig {
    return this.config;
  }
}
