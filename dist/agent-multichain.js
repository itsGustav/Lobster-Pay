"use strict";
/**
 * Multi-Chain LobsterAgent
 * Extends LobsterAgent with Solana + x402 support
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.LobsterAgent = exports.MultiChainLobsterAgent = void 0;
const agent_1 = require("./agent");
const chains_1 = require("./chains");
const x402_1 = require("./x402");
const analytics_1 = require("./analytics");
const stats_1 = require("./stats");
const gamification_1 = require("./gamification");
class MultiChainLobsterAgent extends agent_1.LobsterAgent {
    constructor(config = {}) {
        super(config);
        this.multiChainConfig = config;
    }
    /**
     * Initialize with multi-chain support
     */
    async initialize() {
        // Initialize multi-chain if configured
        if (this.multiChainConfig?.chains) {
            const chainConfig = {
                chains: this.multiChainConfig.chains,
                defaultChain: this.multiChainConfig.defaultChain || 'base',
            };
            this.chainManager = new chains_1.MultiChainManager(chainConfig);
            // Initialize x402 if enabled
            if (this.multiChainConfig.x402?.enabled) {
                const providers = new Map();
                for (const chain of this.chainManager.getActiveChains()) {
                    providers.set(chain, this.chainManager.getProvider(chain));
                }
                this.x402Client = new x402_1.X402Client({
                    providers,
                    maxAutoPayUSDC: this.multiChainConfig.x402.maxAutoPayUSDC,
                    preferredChain: this.multiChainConfig.defaultChain,
                    onPayment: (proof) => {
                        console.log(`✅ [x402] Paid ${proof.amount} USDC on ${proof.chain}`);
                        analytics_1.analytics.track('x402_payment', {
                            chain: proof.chain,
                            amount: proof.amount,
                            txHash: proof.txHash,
                        });
                    },
                    onChallenge: (challenge) => {
                        console.log(`💳 [x402] Payment required: ${challenge.description}`);
                    },
                });
            }
            console.log(`🦞 Multi-chain initialized: ${this.chainManager.getActiveChains().join(', ')}`);
        }
        // Call parent initialization (Base/legacy support)
        await super.initialize();
    }
    /**
     * Send USDC with chain selection
     */
    async send(to, amount, opts) {
        const chain = opts?.chain || this.chainManager?.getDefaultChain() || 'base';
        // Use chain manager if available
        if (this.chainManager?.hasChain(chain)) {
            return this.sendMultiChain(to, amount, chain, opts?.memo);
        }
        // Fall back to legacy Base-only implementation
        return super.send(to, amount);
    }
    /**
     * Multi-chain send implementation
     */
    async sendMultiChain(to, amount, chain, memo) {
        if (!this.chainManager) {
            throw new Error('Multi-chain not initialized');
        }
        const provider = this.chainManager.getProvider(chain);
        const amountNum = typeof amount === 'string' ? parseFloat(amount) : amount;
        console.log(`🦞 [${chain}] Sending ${amountNum} USDC to ${to}...`);
        // Execute transfer on selected chain
        const txHash = await provider.sendUSDC(to, amountNum);
        // Wait for confirmation
        const confirmed = await provider.waitForConfirmation(txHash);
        // Track transaction
        analytics_1.analytics.trackTransaction('send', amountNum.toString(), to, txHash);
        stats_1.stats.recordTransfer(provider.getAddress(), to, amountNum.toString(), txHash);
        gamification_1.gamification.recordActivity(provider.getAddress(), 'transfer', amountNum.toString(), {});
        return {
            id: txHash,
            hash: txHash,
            status: confirmed ? 'confirmed' : 'pending',
            amount: amountNum.toString(),
            to,
            from: provider.getAddress(),
            memo,
            createdAt: new Date().toISOString(),
        };
    }
    /**
     * Transfer with explicit chain selection
     */
    async transfer(options) {
        return this.send(options.to, options.amount, {
            chain: options.chain,
            memo: options.memo,
        });
    }
    /**
     * Get balance on specific chain
     */
    async getBalance(chain) {
        if (chain && this.chainManager?.hasChain(chain)) {
            const provider = this.chainManager.getProvider(chain);
            const balance = await provider.getBalance(provider.getAddress());
            return (Number(balance) / 1000000).toFixed(6);
        }
        // Fall back to Base balance
        return super.getBalance();
    }
    /**
     * Get balances across all chains
     */
    async getAllBalances() {
        if (!this.chainManager) {
            throw new Error('Multi-chain not initialized');
        }
        return this.chainManager.getAllBalances();
    }
    /**
     * Get active chains
     */
    getActiveChains() {
        return this.chainManager?.getActiveChains() || ['base'];
    }
    /**
     * Get default chain
     */
    getDefaultChain() {
        return this.chainManager?.getDefaultChain() || 'base';
    }
    /**
     * x402 enabled fetch
     */
    async payX402(url, options) {
        if (!this.x402Client) {
            throw new Error('x402 not enabled. Set x402.enabled: true in config');
        }
        return this.x402Client.fetch(url, options);
    }
    /**
     * Get x402 payment history
     */
    getX402Receipts() {
        if (!this.x402Client) {
            return [];
        }
        return this.x402Client.getCachedReceipts();
    }
    /**
     * Create escrow on specific chain (Base only for now)
     */
    async createEscrow(options) {
        const chain = options.chain || 'base';
        if (chain !== 'base') {
            throw new Error('Escrow only supported on Base chain (Solana contracts coming soon)');
        }
        return super.createEscrow(options);
    }
    /**
     * Get summary of all wallets and balances
     */
    async getMultiChainSummary() {
        if (!this.chainManager) {
            return 'Multi-chain not initialized';
        }
        const balances = await this.getAllBalances();
        const chains = this.getActiveChains();
        let summary = `🦞 Multi-Chain Pay Lobster\n\n`;
        summary += `Active Chains: ${chains.join(', ')}\n`;
        summary += `Default Chain: ${this.getDefaultChain()}\n\n`;
        for (const chain of chains) {
            const balance = balances[chain];
            summary += `📊 ${chain.toUpperCase()}\n`;
            summary += `   Address: ${balance.address}\n`;
            summary += `   USDC: $${balance.usdc}\n`;
            summary += `   Native: ${balance.native} ${chain === 'base' ? 'ETH' : 'SOL'}\n\n`;
        }
        return summary;
    }
}
exports.MultiChainLobsterAgent = MultiChainLobsterAgent;
// Export backwards-compatible version
var agent_2 = require("./agent");
Object.defineProperty(exports, "LobsterAgent", { enumerable: true, get: function () { return agent_2.LobsterAgent; } });
//# sourceMappingURL=agent-multichain.js.map