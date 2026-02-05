# Quick Start: Multi-Chain Pay Lobster

Get up and running with Base + Solana in 5 minutes! 🦞

## Step 1: Install

```bash
npm install pay-lobster@2.0.0
```

## Step 2: Get Your Keys

### Base (Ethereum L2)
```bash
# Generate new wallet (optional)
npx paylobster wallet create

# Or export from MetaMask:
# Settings → Security & Privacy → Show Private Key
```

### Solana
```bash
# Generate new keypair
solana-keygen new --outfile ~/.config/solana/id.json

# Get private key as array
cat ~/.config/solana/id.json
```

## Step 3: Fund Your Wallets

### Base USDC (Testnet)
1. Get ETH on Base Sepolia: https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet
2. Bridge USDC: https://bridge.base.org

### Solana USDC (Devnet)
```bash
# Get SOL airdrop
solana airdrop 2 --url devnet

# Get devnet USDC from faucet
# Visit: https://spl-token-faucet.com
```

## Step 4: Configure Environment

```bash
# .env
BASE_PRIVATE_KEY=0x1234...
SOLANA_PRIVATE_KEY=[1,2,3,...]  # JSON array from solana-keygen
```

## Step 5: Send Your First Multi-Chain Payment

```typescript
import { MultiChainLobsterAgent } from 'pay-lobster';

const agent = new MultiChainLobsterAgent({
  chains: {
    base: {
      privateKey: process.env.BASE_PRIVATE_KEY!,
      rpc: 'https://sepolia.base.org',  // Testnet
    },
    solana: {
      privateKey: process.env.SOLANA_PRIVATE_KEY!,
      rpc: 'https://api.devnet.solana.com',  // Devnet
    },
  },
  defaultChain: 'base',
});

await agent.initialize();

// Send on Base
await agent.send('0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb5', 1, {
  chain: 'base',
});

// Send on Solana
await agent.send('7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU', 1, {
  chain: 'solana',
});

console.log('✅ Multi-chain payments sent!');
```

## Step 6: Check Balances

```typescript
const summary = await agent.getMultiChainSummary();
console.log(summary);

// Output:
// 🦞 Multi-Chain Pay Lobster
// 
// Active Chains: base, solana
// Default Chain: base
// 
// 📊 BASE
//    Address: 0x123...
//    USDC: $100.00
//    Native: 0.01 ETH
// 
// 📊 SOLANA
//    Address: 7xK...
//    USDC: $50.00
//    Native: 1.5 SOL
```

## Step 7: Enable x402 Auto-Payments

```typescript
const agent = new MultiChainLobsterAgent({
  chains: { /* ... */ },
  x402: {
    enabled: true,
    maxAutoPayUSDC: 10,  // Auto-approve up to $10
  },
});

// Fetch from paid API - payment happens automatically
const response = await agent.payX402('https://api.example.com/premium');
const data = await response.json();

// Check what you paid
const receipts = agent.getX402Receipts();
receipts.forEach(r => {
  console.log(`Paid ${r.amount} USDC on ${r.chain} (tx: ${r.txHash})`);
});
```

## Production Checklist

Before going to mainnet:

- [ ] **Base:** Use `https://mainnet.base.org` RPC
- [ ] **Solana:** Use `https://api.mainnet-beta.solana.com` RPC
- [ ] **USDC:** Base mainnet USDC: `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`
- [ ] **USDC:** Solana mainnet USDC: `EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v`
- [ ] **Keys:** Store in secure environment variables (never commit!)
- [ ] **Limits:** Set reasonable `maxAutoPayUSDC` limits
- [ ] **Testing:** Test on testnet/devnet first!

## Common Issues

### "Insufficient balance"
- Check you have USDC, not just native tokens (ETH/SOL)
- Native tokens are only for gas fees

### "Invalid Solana private key"
- Use JSON array format: `[1,2,3,...]`
- Export from `solana-keygen` output

### "Transaction failed"
- Base: Check you have ETH for gas
- Solana: Check you have SOL for fees (~0.000005 SOL)

## Next Steps

- Read [MULTICHAIN.md](./MULTICHAIN.md) for full API reference
- See [examples/multichain-example.ts](./examples/multichain-example.ts) for more examples
- Check out [x402 protocol spec](./X402-SPEC.md) for HTTP payment details

## Support

- GitHub Issues: https://github.com/itsGustav/Pay-Lobster/issues
- Discord: [Coming soon]
- Email: realtorjakub@gmail.com

---

Built with ❤️ for the AI agent economy. Happy hacking! 🦞
