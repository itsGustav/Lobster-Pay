"use strict";
/**
 * Chain Factory - Returns appropriate provider based on chain name
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SolanaProvider = exports.BaseProvider = exports.MultiChainManager = void 0;
exports.createChainProvider = createChainProvider;
const base_1 = require("./base");
const solana_1 = require("./solana");
/**
 * Create a chain provider instance
 */
function createChainProvider(chain, config) {
    const chainConfig = config.chains[chain];
    if (!chainConfig) {
        throw new Error(`Chain ${chain} not configured`);
    }
    switch (chain) {
        case 'base':
            return new base_1.BaseProvider(chainConfig.privateKey, chainConfig.rpc, {
                escrowAddress: chainConfig.escrowAddress,
                registryAddress: chainConfig.registryAddress,
            });
        case 'solana':
            return new solana_1.SolanaProvider(chainConfig.privateKey, chainConfig.rpc, {
                escrowAddress: chainConfig.escrowAddress,
                registryAddress: chainConfig.registryAddress,
            });
        default:
            throw new Error(`Unsupported chain: ${chain}`);
    }
}
/**
 * Multi-chain manager
 */
class MultiChainManager {
    constructor(config) {
        this.providers = new Map();
        this.defaultChain = config.defaultChain || 'base';
        // Initialize all configured chains
        for (const [chainName, chainConfig] of Object.entries(config.chains)) {
            if (chainConfig) {
                const provider = createChainProvider(chainName, config);
                this.providers.set(chainName, provider);
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
    getProvider(chain) {
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
    getActiveChains() {
        return Array.from(this.providers.keys());
    }
    /**
     * Get default chain
     */
    getDefaultChain() {
        return this.defaultChain;
    }
    /**
     * Check if chain is supported
     */
    hasChain(chain) {
        return this.providers.has(chain);
    }
    /**
     * Get balances across all chains
     */
    async getAllBalances() {
        const balances = {};
        for (const [chain, provider] of this.providers) {
            const address = provider.getAddress();
            const usdcBalance = await provider.getBalance(address);
            const nativeBalance = await provider.getNativeBalance(address);
            balances[chain] = {
                address,
                usdc: (Number(usdcBalance) / 1000000).toFixed(6),
                native: nativeBalance,
            };
        }
        return balances;
    }
}
exports.MultiChainManager = MultiChainManager;
// Export types and classes
__exportStar(require("./types"), exports);
var base_2 = require("./base");
Object.defineProperty(exports, "BaseProvider", { enumerable: true, get: function () { return base_2.BaseProvider; } });
var solana_2 = require("./solana");
Object.defineProperty(exports, "SolanaProvider", { enumerable: true, get: function () { return solana_2.SolanaProvider; } });
//# sourceMappingURL=index.js.map