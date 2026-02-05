/**
 * Multi-Chain Pay Lobster Example
 * Demonstrates Base + Solana support with x402 protocol
 */

import { MultiChainLobsterAgent } from '../lib/agent-multichain';

async function main() {
  // Initialize multi-chain agent
  const agent = new MultiChainLobsterAgent({
    chains: {
      base: {
        privateKey: process.env.BASE_PRIVATE_KEY!,
        rpc: 'https://mainnet.base.org',
      },
      solana: {
        privateKey: process.env.SOLANA_PRIVATE_KEY!,
        rpc: 'https://api.devnet.solana.com',  // Use devnet for testing
      },
    },
    defaultChain: 'base',
    x402: {
      enabled: true,
      maxAutoPayUSDC: 10,  // Auto-pay up to $10
    },
  });

  await agent.initialize();

  // Get summary of all chains
  console.log(await agent.getMultiChainSummary());

  // Example 1: Send USDC on Base
  console.log('\n--- Example 1: Send on Base ---');
  const baseTx = await agent.send('0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb5', 1, {
    chain: 'base',
    memo: 'Payment for AI service',
  });
  console.log(`✅ Base TX: ${baseTx.hash}`);

  // Example 2: Send USDC on Solana
  console.log('\n--- Example 2: Send on Solana ---');
  const solanaTx = await agent.send(
    '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
    0.5,
    { chain: 'solana', memo: 'Cross-chain payment' }
  );
  console.log(`✅ Solana TX: ${solanaTx.hash}`);

  // Example 3: Get balances across all chains
  console.log('\n--- Example 3: Multi-Chain Balances ---');
  const balances = await agent.getAllBalances();
  
  for (const [chain, balance] of Object.entries(balances)) {
    console.log(`\n${chain.toUpperCase()}:`);
    console.log(`  Address: ${balance.address}`);
    console.log(`  USDC: $${balance.usdc}`);
    console.log(`  Native: ${balance.native} ${chain === 'base' ? 'ETH' : 'SOL'}`);
  }

  // Example 4: x402 Payment-Required HTTP
  console.log('\n--- Example 4: x402 Auto-Payment ---');
  try {
    const response = await agent.payX402('https://api.example.com/paid-endpoint');
    const data = await response.json();
    console.log('✅ Paid and received:', data);
  } catch (error) {
    console.log('x402 example skipped (no live endpoint)');
  }

  // Example 5: Check x402 payment history
  const receipts = agent.getX402Receipts();
  console.log(`\n--- x402 Payment History (${receipts.length} payments) ---`);
  receipts.forEach((receipt) => {
    console.log(`💳 ${receipt.amount} USDC on ${receipt.chain}`);
    console.log(`   TX: ${receipt.txHash}`);
    console.log(`   To: ${receipt.receiver}`);
  });
}

main().catch(console.error);
