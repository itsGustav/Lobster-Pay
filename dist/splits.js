"use strict";
/**
 * Pay Lobster Splits Module
 * Multi-recipient payments 🦞
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.splits = void 0;
exports.parseSplitRecipients = parseSplitRecipients;
exports.executeSplit = executeSplit;
exports.formatSplitResult = formatSplitResult;
exports.previewSplit = previewSplit;
const ethers_1 = require("ethers");
const contracts_1 = require("./contracts");
const usernames_1 = require("./usernames");
const stats_1 = require("./stats");
const BASE_RPC = 'https://mainnet.base.org';
/**
 * Parse split recipients from various formats
 *
 * Examples:
 * - ["@alice", "@bob", "@charlie"] → equal split
 * - ["@alice:50", "@bob:30", "@charlie:20"] → percentage split
 * - [{address: "0x...", share: 50}] → direct format
 */
async function parseSplitRecipients(recipients, totalAmount, provider) {
    const total = parseFloat(totalAmount);
    const prov = provider || new ethers_1.ethers.JsonRpcProvider(BASE_RPC);
    // Handle array of strings
    if (typeof recipients[0] === 'string') {
        const parsed = [];
        let hasPercentages = false;
        for (const r of recipients) {
            const match = r.match(/^(.+?):(\d+(?:\.\d+)?)$/);
            if (match) {
                hasPercentages = true;
                const [, name, shareStr] = match;
                const share = parseFloat(shareStr);
                // Resolve username
                let address = name;
                let resolvedName;
                if (!ethers_1.ethers.isAddress(name)) {
                    const resolved = await (0, usernames_1.resolveUsername)(name, prov);
                    if (!resolved)
                        throw new Error(`Could not resolve: ${name}`);
                    address = resolved.address;
                    resolvedName = resolved.name || name;
                }
                parsed.push({ address, name: resolvedName, share });
            }
            else {
                // No percentage, will be equal split
                let address = r;
                let resolvedName;
                if (!ethers_1.ethers.isAddress(r)) {
                    const resolved = await (0, usernames_1.resolveUsername)(r, prov);
                    if (!resolved)
                        throw new Error(`Could not resolve: ${r}`);
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
        }
        else {
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
    const parsed = recipients;
    const totalShare = parsed.reduce((sum, r) => sum + r.share, 0);
    if (Math.abs(totalShare - 100) > 0.01) {
        throw new Error(`Percentages must sum to 100 (got ${totalShare})`);
    }
    for (const r of parsed) {
        r.amount = ((total * r.share) / 100).toFixed(2);
        // Resolve addresses if needed
        if (!ethers_1.ethers.isAddress(r.address)) {
            const resolved = await (0, usernames_1.resolveUsername)(r.address, prov);
            if (!resolved)
                throw new Error(`Could not resolve: ${r.address}`);
            r.name = r.name || resolved.name;
            r.address = resolved.address;
        }
    }
    return parsed;
}
/**
 * Execute a split payment
 */
async function executeSplit(signer, totalAmount, recipients, memo) {
    const usdc = new ethers_1.ethers.Contract(contracts_1.CONTRACTS.usdc, contracts_1.ERC20_ABI, signer);
    // Check total balance
    const totalNeeded = ethers_1.ethers.parseUnits(totalAmount, 6);
    const balance = await usdc.balanceOf(signer.address);
    if (balance < totalNeeded) {
        const balanceFormatted = ethers_1.ethers.formatUnits(balance, 6);
        throw new Error(`Insufficient balance. Have: ${balanceFormatted} USDC, Need: ${totalAmount} USDC`);
    }
    const results = {
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
            const amount = ethers_1.ethers.parseUnits(recipient.amount, 6);
            console.log(`  📤 Sending $${recipient.amount} to ${displayName}...`);
            const tx = await usdc.transfer(recipient.address, amount);
            const receipt = await tx.wait();
            if (receipt.status === 1) {
                console.log(`  ✅ Confirmed: ${tx.hash.slice(0, 10)}...`);
                // Record in stats
                stats_1.stats.recordTransfer(signer.address, recipient.address, recipient.amount, tx.hash);
                results.recipients.push({
                    address: recipient.address,
                    name: recipient.name,
                    amount: recipient.amount,
                    txHash: tx.hash,
                    status: 'success',
                });
                results.successCount++;
                results.totalSent = (parseFloat(results.totalSent) + parseFloat(recipient.amount)).toFixed(2);
            }
            else {
                throw new Error('Transaction reverted');
            }
        }
        catch (error) {
            console.log(`  ❌ Failed: ${error.message}`);
            results.recipients.push({
                address: recipient.address,
                name: recipient.name,
                amount: recipient.amount,
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
function formatSplitResult(result) {
    let output = `🦞 Split Payment Complete\n\n`;
    output += `💰 Total: $${result.totalAmount} USDC\n`;
    output += `📊 Sent: $${result.totalSent} (${result.successCount}/${result.recipients.length})\n\n`;
    for (const r of result.recipients) {
        const emoji = r.status === 'success' ? '✅' : '❌';
        const name = r.name || `${r.address.slice(0, 6)}...${r.address.slice(-4)}`;
        output += `${emoji} $${r.amount} → ${name}`;
        if (r.status === 'success') {
            output += ` (${r.txHash.slice(0, 10)}...)`;
        }
        else {
            output += ` — ${r.error}`;
        }
        output += `\n`;
    }
    return output;
}
/**
 * Preview a split (without executing)
 */
async function previewSplit(totalAmount, recipients, provider) {
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
exports.splits = {
    parse: parseSplitRecipients,
    execute: executeSplit,
    preview: previewSplit,
    format: formatSplitResult,
};
//# sourceMappingURL=splits.js.map