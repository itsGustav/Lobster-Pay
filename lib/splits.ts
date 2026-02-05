/**
 * Pay Lobster Splits Module
 * Multi-recipient payments 🦞
 */

import { ethers } from 'ethers';
import { CONTRACTS, ERC20_ABI } from './contracts';
import { resolveUsername } from './usernames';
import { stats } from './stats';

const BASE_RPC = 'https://mainnet.base.org';

export interface SplitRecipient {
  address: string;
  name?: string;           // @username or .base.eth
  share: number;           // Percentage (0-100) or amount
  amount?: string;         // Calculated USDC amount
}

export interface SplitResult {
  totalAmount: string;
  recipients: Array<{
    address: string;
    name?: string;
    amount: string;
    txHash: string;
    status: 'success' | 'failed';
    error?: string;
  }>;
  successCount: number;
  failCount: number;
  totalSent: string;
}

/**
 * Parse split recipients from various formats
 * 
 * Examples:
 * - ["@alice", "@bob", "@charlie"] → equal split
 * - ["@alice:50", "@bob:30", "@charlie:20"] → percentage split
 * - [{address: "0x...", share: 50}] → direct format
 */
export async function parseSplitRecipients(
  recipients: string[] | SplitRecipient[],
  totalAmount: string,
  provider?: ethers.JsonRpcProvider
): Promise<SplitRecipient[]> {
  const total = parseFloat(totalAmount);
  const prov = provider || new ethers.JsonRpcProvider(BASE_RPC);
  
  // Handle array of strings
  if (typeof recipients[0] === 'string') {
    const parsed: SplitRecipient[] = [];
    let hasPercentages = false;
    
    for (const r of recipients as string[]) {
      const match = r.match(/^(.+?):(\d+(?:\.\d+)?)$/);
      if (match) {
        hasPercentages = true;
        const [, name, shareStr] = match;
        const share = parseFloat(shareStr);
        
        // Resolve username
        let address = name;
        let resolvedName: string | undefined;
        if (!ethers.isAddress(name)) {
          const resolved = await resolveUsername(name, prov);
          if (!resolved) throw new Error(`Could not resolve: ${name}`);
          address = resolved.address;
          resolvedName = resolved.name || name;
        }
        
        parsed.push({ address, name: resolvedName, share });
      } else {
        // No percentage, will be equal split
        let address = r;
        let resolvedName: string | undefined;
        if (!ethers.isAddress(r)) {
          const resolved = await resolveUsername(r, prov);
          if (!resolved) throw new Error(`Could not resolve: ${r}`);
          address = resolved.address;
          resolvedName = resolved.name || r;
        }
        
        parsed.push({ address, name: resolvedName, share: 0 });
      }
    }
    
    // Calculate amounts
    if (hasPercentages) {
      // Validate percentages sum to 100
      const totalShare = parsed.reduce((sum, r) => sum + r.share, 0);
      if (Math.abs(totalShare - 100) > 0.01) {
        throw new Error(`Percentages must sum to 100 (got ${totalShare})`);
      }
      
      // Calculate amounts from percentages
      for (const r of parsed) {
        r.amount = ((total * r.share) / 100).toFixed(2);
      }
    } else {
      // Equal split
      const equalShare = 100 / parsed.length;
      const equalAmount = (total / parsed.length).toFixed(2);
      for (const r of parsed) {
        r.share = equalShare;
        r.amount = equalAmount;
      }
    }
    
    return parsed;
  }
  
  // Handle array of objects
  const parsed = recipients as SplitRecipient[];
  const totalShare = parsed.reduce((sum, r) => sum + r.share, 0);
  
  if (Math.abs(totalShare - 100) > 0.01) {
    throw new Error(`Percentages must sum to 100 (got ${totalShare})`);
  }
  
  for (const r of parsed) {
    r.amount = ((total * r.share) / 100).toFixed(2);
    
    // Resolve addresses if needed
    if (!ethers.isAddress(r.address)) {
      const resolved = await resolveUsername(r.address, prov);
      if (!resolved) throw new Error(`Could not resolve: ${r.address}`);
      r.name = r.name || resolved.name;
      r.address = resolved.address;
    }
  }
  
  return parsed;
}

/**
 * Execute a split payment
 */
export async function executeSplit(
  signer: ethers.Wallet,
  totalAmount: string,
  recipients: SplitRecipient[],
  memo?: string
): Promise<SplitResult> {
  const usdc = new ethers.Contract(CONTRACTS.usdc, ERC20_ABI, signer);
  
  // Check total balance
  const totalNeeded = ethers.parseUnits(totalAmount, 6);
  const balance = await usdc.balanceOf(signer.address);
  
  if (balance < totalNeeded) {
    const balanceFormatted = ethers.formatUnits(balance, 6);
    throw new Error(`Insufficient balance. Have: ${balanceFormatted} USDC, Need: ${totalAmount} USDC`);
  }
  
  const results: SplitResult = {
    totalAmount,
    recipients: [],
    successCount: 0,
    failCount: 0,
    totalSent: '0',
  };
  
  console.log(`🦞 Splitting $${totalAmount} USDC to ${recipients.length} recipients...`);
  
  for (const recipient of recipients) {
    const displayName = recipient.name || `${recipient.address.slice(0, 6)}...${recipient.address.slice(-4)}`;
    
    try {
      const amount = ethers.parseUnits(recipient.amount!, 6);
      console.log(`  📤 Sending $${recipient.amount} to ${displayName}...`);
      
      const tx = await usdc.transfer(recipient.address, amount);
      const receipt = await tx.wait();
      
      if (receipt.status === 1) {
        console.log(`  ✅ Confirmed: ${tx.hash.slice(0, 10)}...`);
        
        // Record in stats
        stats.recordTransfer(signer.address, recipient.address, recipient.amount!, tx.hash);
        
        results.recipients.push({
          address: recipient.address,
          name: recipient.name,
          amount: recipient.amount!,
          txHash: tx.hash,
          status: 'success',
        });
        results.successCount++;
        results.totalSent = (parseFloat(results.totalSent) + parseFloat(recipient.amount!)).toFixed(2);
      } else {
        throw new Error('Transaction reverted');
      }
    } catch (error: any) {
      console.log(`  ❌ Failed: ${error.message}`);
      results.recipients.push({
        address: recipient.address,
        name: recipient.name,
        amount: recipient.amount!,
        txHash: '',
        status: 'failed',
        error: error.message,
      });
      results.failCount++;
    }
  }
  
  console.log(`\n✅ Split complete: ${results.successCount}/${recipients.length} sent ($${results.totalSent})`);
  
  return results;
}

/**
 * Format split result for display
 */
export function formatSplitResult(result: SplitResult): string {
  let output = `🦞 Split Payment Complete\n\n`;
  output += `💰 Total: $${result.totalAmount} USDC\n`;
  output += `📊 Sent: $${result.totalSent} (${result.successCount}/${result.recipients.length})\n\n`;
  
  for (const r of result.recipients) {
    const emoji = r.status === 'success' ? '✅' : '❌';
    const name = r.name || `${r.address.slice(0, 6)}...${r.address.slice(-4)}`;
    output += `${emoji} $${r.amount} → ${name}`;
    if (r.status === 'success') {
      output += ` (${r.txHash.slice(0, 10)}...)`;
    } else {
      output += ` — ${r.error}`;
    }
    output += `\n`;
  }
  
  return output;
}

/**
 * Preview a split (without executing)
 */
export async function previewSplit(
  totalAmount: string,
  recipients: string[] | SplitRecipient[],
  provider?: ethers.JsonRpcProvider
): Promise<string> {
  const parsed = await parseSplitRecipients(recipients, totalAmount, provider);
  
  let output = `🦞 Split Preview\n\n`;
  output += `💰 Total: $${totalAmount} USDC\n`;
  output += `👥 Recipients: ${parsed.length}\n\n`;
  
  for (const r of parsed) {
    const name = r.name || `${r.address.slice(0, 6)}...${r.address.slice(-4)}`;
    output += `• $${r.amount} (${r.share.toFixed(1)}%) → ${name}\n`;
  }
  
  return output;
}

export const splits = {
  parse: parseSplitRecipients,
  execute: executeSplit,
  preview: previewSplit,
  format: formatSplitResult,
};
