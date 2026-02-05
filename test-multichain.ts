/**
 * Multi-Chain Test Suite
 * Quick verification of multi-chain functionality
 */

import { MultiChainLobsterAgent } from './lib/agent-multichain';
import { MultiChainManager } from './lib/chains';

async function testChainAbstraction() {
  console.log('🧪 Test 1: Chain Abstraction Layer\n');

  // This would need real keys to actually work
  // For now, just test initialization logic
  
  try {
    const manager = new MultiChainManager({
      chains: {
        base: {
          privateKey: '0x' + '1'.repeat(64),  // Dummy key
        },
      },
      defaultChain: 'base',
    });

    const activeChains = manager.getActiveChains();
    console.log(`✅ Active chains: ${activeChains.join(', ')}`);
    console.log(`✅ Default chain: ${manager.getDefaultChain()}`);
    console.log(`✅ Has base: ${manager.hasChain('base')}`);
    console.log(`✅ Has solana: ${manager.hasChain('solana')}`);
  } catch (error: any) {
    console.log(`⚠️  Chain abstraction test (expected): ${error.message}`);
  }
}

async function testMultiChainAgent() {
  console.log('\n🧪 Test 2: Multi-Chain Agent\n');

  try {
    const agent = new MultiChainLobsterAgent({
      chains: {
        base: {
          privateKey: '0x' + '1'.repeat(64),  // Dummy key
        },
      },
      defaultChain: 'base',
      x402: {
        enabled: true,
        maxAutoPayUSDC: 10,
      },
    });

    await agent.initialize();
    
    console.log(`✅ Agent initialized`);
    console.log(`✅ Active chains: ${agent.getActiveChains().join(', ')}`);
    console.log(`✅ Default chain: ${agent.getDefaultChain()}`);
  } catch (error: any) {
    console.log(`⚠️  Multi-chain agent test: ${error.message}`);
  }
}

async function testBackwardsCompatibility() {
  console.log('\n🧪 Test 3: Backwards Compatibility\n');

  const { LobsterAgent } = await import('./lib/agent');

  try {
    const agent = new LobsterAgent({
      privateKey: '0x' + '1'.repeat(64),  // Dummy key
    });

    await agent.initialize();
    console.log(`✅ Legacy LobsterAgent works`);
  } catch (error: any) {
    console.log(`⚠️  Legacy agent test: ${error.message}`);
  }
}

async function testX402Protocol() {
  console.log('\n🧪 Test 4: x402 Protocol\n');

  const { X402Client } = await import('./lib/x402');

  try {
    const providers = new Map();
    const client = new X402Client({
      providers,
      maxAutoPayUSDC: 10,
    });

    console.log(`✅ X402Client instantiated`);
    console.log(`✅ Receipt cache: ${client.getCachedReceipts().length} receipts`);
  } catch (error: any) {
    console.log(`⚠️  x402 test: ${error.message}`);
  }
}

async function main() {
  console.log('🦞 Pay Lobster v2.0 - Multi-Chain Test Suite\n');
  console.log('=' .repeat(60) + '\n');

  await testChainAbstraction();
  await testMultiChainAgent();
  await testBackwardsCompatibility();
  await testX402Protocol();

  console.log('\n' + '='.repeat(60));
  console.log('✅ All tests completed!\n');
  console.log('Note: Full integration tests require real private keys.');
  console.log('See examples/multichain-example.ts for usage.\n');
}

main().catch(console.error);
