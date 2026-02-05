"use strict";
/**
 * Solana Chain Provider
 * Handles USDC transfers via SPL Token program
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SolanaProvider = void 0;
const web3_js_1 = require("@solana/web3.js");
const spl_token_1 = require("@solana/spl-token");
// Solana USDC address (mainnet)
const USDC_SOLANA = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';
const DEFAULT_SOLANA_RPC = 'https://api.mainnet-beta.solana.com';
const DEFAULT_DEVNET_RPC = 'https://api.devnet.solana.com';
class SolanaProvider {
    constructor(privateKey, rpcUrl, config, useDevnet = false) {
        this.config = {
            name: 'solana',
            rpc: rpcUrl || (useDevnet ? DEFAULT_DEVNET_RPC : DEFAULT_SOLANA_RPC),
            usdcAddress: config?.usdcAddress || USDC_SOLANA,
            escrowAddress: config?.escrowAddress,
            registryAddress: config?.registryAddress,
        };
        // Parse private key (supports base58 or JSON array format)
        this.keypair = this.parsePrivateKey(privateKey);
        this.connection = new web3_js_1.Connection(this.config.rpc, 'confirmed');
        this.usdcMint = new web3_js_1.PublicKey(this.config.usdcAddress);
    }
    getAddress() {
        return this.keypair.publicKey.toBase58();
    }
    getChainName() {
        return 'solana';
    }
    async getBalance(address) {
        try {
            const publicKey = new web3_js_1.PublicKey(address);
            const tokenAccount = await (0, spl_token_1.getAssociatedTokenAddress)(this.usdcMint, publicKey);
            const accountInfo = await (0, spl_token_1.getAccount)(this.connection, tokenAccount);
            return accountInfo.amount;
        }
        catch (error) {
            // Token account might not exist yet
            return 0n;
        }
    }
    async getNativeBalance(address) {
        const publicKey = new web3_js_1.PublicKey(address);
        const balance = await this.connection.getBalance(publicKey);
        return (balance / web3_js_1.LAMPORTS_PER_SOL).toFixed(9);
    }
    async sendUSDC(to, amount) {
        const toPublicKey = new web3_js_1.PublicKey(to);
        // USDC has 6 decimals
        const amountBigInt = BigInt(Math.floor(amount * 1000000));
        // Check balance
        const balance = await this.getBalance(this.keypair.publicKey.toBase58());
        if (balance < amountBigInt) {
            const balanceFormatted = (Number(balance) / 1000000).toFixed(6);
            throw new Error(`Insufficient balance. Have: ${balanceFormatted} USDC, Need: ${amount} USDC`);
        }
        console.log(`🦞 [Solana] Sending ${amount} USDC to ${to}...`);
        // Get associated token addresses
        const fromTokenAccount = await (0, spl_token_1.getAssociatedTokenAddress)(this.usdcMint, this.keypair.publicKey);
        const toTokenAccount = await (0, spl_token_1.getAssociatedTokenAddress)(this.usdcMint, toPublicKey);
        // Create transfer instruction
        const transaction = new web3_js_1.Transaction().add((0, spl_token_1.createTransferInstruction)(fromTokenAccount, toTokenAccount, this.keypair.publicKey, amountBigInt, [], spl_token_1.TOKEN_PROGRAM_ID));
        // Send and confirm transaction
        const signature = await (0, web3_js_1.sendAndConfirmTransaction)(this.connection, transaction, [this.keypair], { commitment: 'confirmed' });
        console.log(`📤 [Solana] Transaction submitted: ${signature}`);
        return signature;
    }
    async waitForConfirmation(signature) {
        try {
            const confirmation = await this.connection.confirmTransaction(signature, 'confirmed');
            if (confirmation.value.err) {
                console.error(`❌ [Solana] Transaction failed: ${confirmation.value.err}`);
                return false;
            }
            console.log(`✅ [Solana] Transaction confirmed`);
            return true;
        }
        catch (error) {
            console.error(`❌ [Solana] Confirmation error: ${error}`);
            return false;
        }
    }
    async signMessage(message) {
        const messageBytes = new TextEncoder().encode(message);
        // Use nacl to sign with the secret key
        const nacl = require('tweetnacl');
        const signature = nacl.sign.detached(messageBytes, this.keypair.secretKey);
        return Buffer.from(signature).toString('base64');
    }
    /**
     * Get connection instance for advanced operations
     */
    getConnection() {
        return this.connection;
    }
    /**
     * Get keypair instance
     */
    getKeypair() {
        return this.keypair;
    }
    /**
     * Get config
     */
    getConfig() {
        return this.config;
    }
    /**
     * Parse private key from various formats
     */
    parsePrivateKey(privateKey) {
        try {
            // Try base58 format first (most common)
            const decoded = this.base58Decode(privateKey);
            return web3_js_1.Keypair.fromSecretKey(decoded);
        }
        catch {
            try {
                // Try JSON array format [1,2,3,...]
                const secretKey = JSON.parse(privateKey);
                return web3_js_1.Keypair.fromSecretKey(Uint8Array.from(secretKey));
            }
            catch {
                throw new Error('Invalid Solana private key format. Use base58 or JSON array.');
            }
        }
    }
    /**
     * Simple base58 decoder
     */
    base58Decode(input) {
        const ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
        const base = BigInt(58);
        let result = 0n;
        for (let i = 0; i < input.length; i++) {
            const char = input[i];
            const digit = ALPHABET.indexOf(char);
            if (digit < 0) {
                throw new Error(`Invalid base58 character: ${char}`);
            }
            result = result * base + BigInt(digit);
        }
        // Convert to bytes
        const bytes = [];
        while (result > 0n) {
            bytes.unshift(Number(result % 256n));
            result = result / 256n;
        }
        // Add leading zeros
        for (let i = 0; i < input.length && input[i] === '1'; i++) {
            bytes.unshift(0);
        }
        return new Uint8Array(bytes);
    }
    /**
     * Request airdrop (devnet only)
     */
    async requestAirdrop(amount = 1) {
        if (!this.config.rpc.includes('devnet')) {
            throw new Error('Airdrop only available on devnet');
        }
        const signature = await this.connection.requestAirdrop(this.keypair.publicKey, amount * web3_js_1.LAMPORTS_PER_SOL);
        await this.connection.confirmTransaction(signature);
        console.log(`🎁 [Solana] Airdropped ${amount} SOL`);
        return signature;
    }
}
exports.SolanaProvider = SolanaProvider;
//# sourceMappingURL=solana.js.map