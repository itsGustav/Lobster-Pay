"use strict";
/**
 * Base Chain Provider (Ethereum L2)
 * Wraps existing ethers.js implementation
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseProvider = void 0;
const ethers_1 = require("ethers");
const contracts_1 = require("../contracts");
const DEFAULT_BASE_RPC = 'https://mainnet.base.org';
const USDC_BASE = contracts_1.CONTRACTS.usdc;
class BaseProvider {
    constructor(privateKey, rpcUrl, config) {
        this.config = {
            name: 'base',
            rpc: rpcUrl || DEFAULT_BASE_RPC,
            usdcAddress: config?.usdcAddress || USDC_BASE,
            escrowAddress: config?.escrowAddress || contracts_1.CONTRACTS.escrow,
            registryAddress: config?.registryAddress || contracts_1.CONTRACTS.registry,
        };
        this.provider = new ethers_1.ethers.JsonRpcProvider(this.config.rpc);
        this.signer = new ethers_1.ethers.Wallet(privateKey, this.provider);
    }
    getAddress() {
        return this.signer.address;
    }
    getChainName() {
        return 'base';
    }
    async getBalance(address) {
        const usdc = new ethers_1.ethers.Contract(this.config.usdcAddress, contracts_1.ERC20_ABI, this.provider);
        const balance = await usdc.balanceOf(address);
        return balance;
    }
    async getNativeBalance(address) {
        const balance = await this.provider.getBalance(address);
        return ethers_1.ethers.formatEther(balance);
    }
    async sendUSDC(to, amount) {
        const usdc = new ethers_1.ethers.Contract(this.config.usdcAddress, contracts_1.ERC20_ABI, this.signer);
        // Parse amount (USDC has 6 decimals)
        const amountBigInt = ethers_1.ethers.parseUnits(amount.toString(), 6);
        // Check balance
        const balance = await this.getBalance(this.signer.address);
        if (balance < amountBigInt) {
            const balanceFormatted = ethers_1.ethers.formatUnits(balance, 6);
            throw new Error(`Insufficient balance. Have: ${balanceFormatted} USDC, Need: ${amount} USDC`);
        }
        console.log(`🦞 [Base] Sending ${amount} USDC to ${to}...`);
        // Execute transfer
        const tx = await usdc.transfer(to, amountBigInt);
        console.log(`📤 [Base] Transaction submitted: ${tx.hash}`);
        return tx.hash;
    }
    async waitForConfirmation(txHash) {
        try {
            const receipt = await this.provider.waitForTransaction(txHash);
            console.log(`✅ [Base] Confirmed in block ${receipt?.blockNumber}`);
            return receipt?.status === 1;
        }
        catch (error) {
            console.error(`❌ [Base] Transaction failed: ${error}`);
            return false;
        }
    }
    async signMessage(message) {
        return this.signer.signMessage(message);
    }
    /**
     * Get provider instance for advanced operations
     */
    getProvider() {
        return this.provider;
    }
    /**
     * Get signer instance for contract interactions
     */
    getSigner() {
        return this.signer;
    }
    /**
     * Get contract addresses
     */
    getConfig() {
        return this.config;
    }
}
exports.BaseProvider = BaseProvider;
//# sourceMappingURL=base.js.map