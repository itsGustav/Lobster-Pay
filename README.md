# 🦞 USDC Agent Skill

> Enable Clawdbot to interact with USDC on blockchain networks via Circle's Programmable Wallets API.

**Built for the Circle USDC Hackathon 2026** 🏆

## Features

- 💰 **Check USDC balances** across multiple chains
- 📤 **Send USDC** to any address
- 📥 **Receive USDC** with generated addresses  
- 🌉 **Cross-chain transfers** via Circle's CCTP
- 🤖 **Agent-to-agent payments** for autonomous commerce

## Quick Start

### 1. Get Circle Credentials

Sign up at [console.circle.com](https://console.circle.com) and create:
- API Key (Keys → Create a key → API key → Standard Key)
- Entity Secret

### 2. Set Environment Variables

```bash
export CIRCLE_API_KEY="your-api-key"
export CIRCLE_ENTITY_SECRET="your-entity-secret"
```

### 3. Install & Setup

```bash
cd skills/usdc-agent
npm install
npm run setup
```

### 4. Use It

```bash
# Check balance
npm run balance

# Send USDC
npx ts-node scripts/usdc-cli.ts send 10 to 0x1234...

# Get receive address
npm run receive

# Bridge across chains
npx ts-node scripts/usdc-cli.ts bridge 25 from eth to matic
```

## With Clawdbot

Once configured, just talk to your Clawdbot:

```
You: Check my USDC balance
Bot: Your USDC balance across all wallets:
     - Ethereum Sepolia: 100.00 USDC
     - Polygon Amoy: 50.00 USDC
     Total: 150.00 USDC

You: Send 10 USDC to 0x1234...abcd
Bot: ✅ Transaction submitted!
     Amount: 10.00 USDC
     To: 0x1234...abcd
     TX Hash: 0xabc123...
```

## Supported Networks (Testnet)

| Chain | Network ID | Faucet |
|-------|------------|--------|
| Ethereum | ETH-SEPOLIA | [console.circle.com/faucets](https://console.circle.com/faucets) |
| Polygon | MATIC-AMOY | [console.circle.com/faucets](https://console.circle.com/faucets) |
| Avalanche | AVAX-FUJI | [console.circle.com/faucets](https://console.circle.com/faucets) |
| Arbitrum | ARB-SEPOLIA | [console.circle.com/faucets](https://console.circle.com/faucets) |

## Architecture

```
┌─────────────────────────────────────────┐
│           Clawdbot Agent                │
│  (Claude/GPT interpreting user intent)  │
└─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────┐
│          USDC Agent Skill               │
│   - Balance queries                     │
│   - Transaction creation                │
│   - Wallet management                   │
│   - CCTP bridge calls                   │
└─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────┐
│     Circle Programmable Wallets API     │
│   - Developer-controlled wallets        │
│   - Transaction signing                 │
│   - Multi-chain support                 │
└─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────┐
│           Blockchain Networks           │
│   ETH | MATIC | AVAX | ARB (testnet)    │
└─────────────────────────────────────────┘
```

## Security

⚠️ **TESTNET ONLY** — This skill is configured for testnet by default.

- Never use mainnet credentials in automated agents
- API keys should have minimal required permissions
- Entity secrets must be kept secure

## Hackathon Submission

**Track:** Best OpenClaw Skill  
**Prize:** $10,000 USDC

### Why This Skill?

1. ✅ **Novel** — First USDC integration for Clawdbot ecosystem
2. ✅ **Useful** — Real utility for any Clawdbot operator
3. ✅ **Safe** — Testnet-only by design
4. ✅ **Extensible** — Clean API for future features

## Resources

- [Circle Developer Docs](https://developers.circle.com)
- [Programmable Wallets API](https://developers.circle.com/wallets)
- [CCTP Documentation](https://developers.circle.com/stablecoins/cctp)
- [Clawdbot Documentation](https://docs.clawd.bot)

## License

MIT — Built with 🦞 by the OpenClaw community
