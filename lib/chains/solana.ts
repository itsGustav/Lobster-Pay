/**
 * Solana Chain Provider
 * Handles USDC transfers via SPL Token program
 */

import {
  Connection,
  Keypair,
  PublicKey,
  Transaction,
  sendAndConfirmTransaction,
  SystemProgram,
  LAMPORTS_PER_SOL,
} from '@solana/web3.js';
import {
  getAssociatedTokenAddress,
  createTransferInstruction,
  TOKEN_PROGRAM_ID,
  getAccount,
} from '@solana/spl-token';
import { ChainProvider, ChainConfig } from './types';

// Solana USDC address (mainnet)
const USDC_SOLANA = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';
const DEFAULT_SOLANA_RPC = 'https://api.mainnet-beta.solana.com';
const DEFAULT_DEVNET_RPC = 'https://api.devnet.solana.com';

export class SolanaProvider implements ChainProvider {
  private keypair: Keypair;
  private connection: Connection;
  private config: ChainConfig;
  private usdcMint: PublicKey;

  constructor(
    privateKey: string,
    rpcUrl?: string,
    config?: Partial<ChainConfig>,
    useDevnet = false
  ) {
    this.config = {
      name: 'solana',
      rpc: rpcUrl || (useDevnet ? DEFAULT_DEVNET_RPC : DEFAULT_SOLANA_RPC),
      usdcAddress: config?.usdcAddress || USDC_SOLANA,
      escrowAddress: config?.escrowAddress,
      registryAddress: config?.registryAddress,
    };

    // Parse private key (supports base58 or JSON array format)
    this.keypair = this.parsePrivateKey(privateKey);
    
    this.connection = new Connection(this.config.rpc, 'confirmed');
    this.usdcMint = new PublicKey(this.config.usdcAddress);
  }

  getAddress(): string {
    return this.keypair.publicKey.toBase58();
  }

  getChainName(): 'solana' {
    return 'solana';
  }

  async getBalance(address: string): Promise<bigint> {
    try {
      const publicKey = new PublicKey(address);
      const tokenAccount = await getAssociatedTokenAddress(
        this.usdcMint,
        publicKey
      );

      const accountInfo = await getAccount(this.connection, tokenAccount);
      return accountInfo.amount;
    } catch (error) {
      // Token account might not exist yet
      return 0n;
    }
  }

  async getNativeBalance(address: string): Promise<string> {
    const publicKey = new PublicKey(address);
    const balance = await this.connection.getBalance(publicKey);
    return (balance / LAMPORTS_PER_SOL).toFixed(9);
  }

  async sendUSDC(to: string, amount: number): Promise<string> {
    const toPublicKey = new PublicKey(to);
    
    // USDC has 6 decimals
    const amountBigInt = BigInt(Math.floor(amount * 1_000_000));

    // Check balance
    const balance = await this.getBalance(this.keypair.publicKey.toBase58());
    if (balance < amountBigInt) {
      const balanceFormatted = (Number(balance) / 1_000_000).toFixed(6);
      throw new Error(`Insufficient balance. Have: ${balanceFormatted} USDC, Need: ${amount} USDC`);
    }

    console.log(`🦞 [Solana] Sending ${amount} USDC to ${to}...`);

    // Get associated token addresses
    const fromTokenAccount = await getAssociatedTokenAddress(
      this.usdcMint,
      this.keypair.publicKey
    );

    const toTokenAccount = await getAssociatedTokenAddress(
      this.usdcMint,
      toPublicKey
    );

    // Create transfer instruction
    const transaction = new Transaction().add(
      createTransferInstruction(
        fromTokenAccount,
        toTokenAccount,
        this.keypair.publicKey,
        amountBigInt,
        [],
        TOKEN_PROGRAM_ID
      )
    );

    // Send and confirm transaction
    const signature = await sendAndConfirmTransaction(
      this.connection,
      transaction,
      [this.keypair],
      { commitment: 'confirmed' }
    );

    console.log(`📤 [Solana] Transaction submitted: ${signature}`);

    return signature;
  }

  async waitForConfirmation(signature: string): Promise<boolean> {
    try {
      const confirmation = await this.connection.confirmTransaction(signature, 'confirmed');
      
      if (confirmation.value.err) {
        console.error(`❌ [Solana] Transaction failed: ${confirmation.value.err}`);
        return false;
      }

      console.log(`✅ [Solana] Transaction confirmed`);
      return true;
    } catch (error) {
      console.error(`❌ [Solana] Confirmation error: ${error}`);
      return false;
    }
  }

  async signMessage(message: string): Promise<string> {
    const messageBytes = new TextEncoder().encode(message);
    // Use nacl to sign with the secret key
    const nacl = require('tweetnacl');
    const signature = nacl.sign.detached(messageBytes, this.keypair.secretKey);
    return Buffer.from(signature).toString('base64');
  }

  /**
   * Get connection instance for advanced operations
   */
  getConnection(): Connection {
    return this.connection;
  }

  /**
   * Get keypair instance
   */
  getKeypair(): Keypair {
    return this.keypair;
  }

  /**
   * Get config
   */
  getConfig(): ChainConfig {
    return this.config;
  }

  /**
   * Parse private key from various formats
   */
  private parsePrivateKey(privateKey: string): Keypair {
    try {
      // Try base58 format first (most common)
      const decoded = this.base58Decode(privateKey);
      return Keypair.fromSecretKey(decoded);
    } catch {
      try {
        // Try JSON array format [1,2,3,...]
        const secretKey = JSON.parse(privateKey);
        return Keypair.fromSecretKey(Uint8Array.from(secretKey));
      } catch {
        throw new Error('Invalid Solana private key format. Use base58 or JSON array.');
      }
    }
  }

  /**
   * Simple base58 decoder
   */
  private base58Decode(input: string): Uint8Array {
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
    const bytes: number[] = [];
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
  async requestAirdrop(amount: number = 1): Promise<string> {
    if (!this.config.rpc.includes('devnet')) {
      throw new Error('Airdrop only available on devnet');
    }

    const signature = await this.connection.requestAirdrop(
      this.keypair.publicKey,
      amount * LAMPORTS_PER_SOL
    );

    await this.connection.confirmTransaction(signature);
    console.log(`🎁 [Solana] Airdropped ${amount} SOL`);
    return signature;
  }
}
