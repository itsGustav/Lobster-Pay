/**
 * Pay Lobster Splits Module
 * Multi-recipient payments 🦞
 */
import { ethers } from 'ethers';
export interface SplitRecipient {
    address: string;
    name?: string;
    share: number;
    amount?: string;
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
export declare function parseSplitRecipients(recipients: string[] | SplitRecipient[], totalAmount: string, provider?: ethers.JsonRpcProvider): Promise<SplitRecipient[]>;
/**
 * Execute a split payment
 */
export declare function executeSplit(signer: ethers.Wallet, totalAmount: string, recipients: SplitRecipient[], memo?: string): Promise<SplitResult>;
/**
 * Format split result for display
 */
export declare function formatSplitResult(result: SplitResult): string;
/**
 * Preview a split (without executing)
 */
export declare function previewSplit(totalAmount: string, recipients: string[] | SplitRecipient[], provider?: ethers.JsonRpcProvider): Promise<string>;
export declare const splits: {
    parse: typeof parseSplitRecipients;
    execute: typeof executeSplit;
    preview: typeof previewSplit;
    format: typeof formatSplitResult;
};
//# sourceMappingURL=splits.d.ts.map