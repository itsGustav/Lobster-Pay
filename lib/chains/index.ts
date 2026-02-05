/**
 * Chain Factory - Returns appropriate provider based on chain name
 */

import { ChainProvider, ChainName, MultiChainConfig } from './types';
import { BaseProvider } from './base';
import { SolanaProvider } from './solana';

/**
 * Create a chain provider instance
 */
export function createChainProvider(
  chain: ChainName,
  config: MultiChainConfig
): ChainProvider {
  const chainConfig = config.chains[chain];
  
  if (!chainConfig) {
    throw new Error(`Chain ${chain} not configured`);
  }

  switch (chain) {
    case 'base':
      return new BaseProvider(
        chainConfig.privateKey,
        chainConfig.rpc,
        {
          escrowAddress: chainConfig.escrowAddress,
          registryAddress: chainConfig.registryAddress,
        }
      );
    
    case 'solana':
      return new SolanaProvider(
        chainConfig.privateKey,
        chainConfig.rpc,
        {
          escrowAddress: chainConfig.escrowAddress,
          registryAddress: chainConfig.registryAddress,
        }
      );
    
    default:
      throw new Error(`Unsupported chain: ${chain}`);
  }
}

/**
 * Multi-chain manager
 */
export class MultiChainManager {
  private providers: Map<ChainName, ChainProvider> = new Map();
  private defaultChain: ChainName;

  constructor(config: MultiChainConfig) {
    this.defaultChain = config.defaultChain || 'base';

    // Initialize all configured chains
    for (const [chainName, chainConfig] of Object.entries(config.chains)) {
      if (chainConfig) {
        const provider = createChainProvider(chainName as ChainName, config);
        this.providers.set(chainName as ChainName, provider);
      }
    }

    if (this.providers.size === 0) {
      throw new Error('No chains configured');
    }

    // Ensure default chain is available
    if (!this.providers.has(this.defaultChain)) {
      this.defaultChain = Array.from(this.providers.keys())[0];
    }
  }

  /**
   * Get provider for specific chain
   */
  getProvider(chain?: ChainName): ChainProvider {
    const targetChain = chain || this.defaultChain;
    const provider = this.providers.get(targetChain);
    
    if (!provider) {
      throw new Error(`Chain ${targetChain} not initialized`);
    }
    
    return provider;
  }

  /**
   * Get all active chains
   */
  getActiveChains(): ChainName[] {
    return Array.from(this.providers.keys());
  }

  /**
   * Get default chain
   */
  getDefaultChain(): ChainName {
    return this.defaultChain;
  }

  /**
   * Check if chain is supported
   */
  hasChain(chain: ChainName): boolean {
    return this.providers.has(chain);
  }

  /**
   * Get balances across all chains
   */
  async getAllBalances(): Promise<Record<ChainName, { usdc: string; native: string; address: string }>> {
    const balances: any = {};

    for (const [chain, provider] of this.providers) {
      const address = provider.getAddress();
      const usdcBalance = await provider.getBalance(address);
      const nativeBalance = await provider.getNativeBalance(address);

      balances[chain] = {
        address,
        usdc: (Number(usdcBalance) / 1_000_000).toFixed(6),
        native: nativeBalance,
      };
    }

    return balances;
  }
}

// Export types and classes
export * from './types';
export { BaseProvider } from './base';
export { SolanaProvider } from './solana';
