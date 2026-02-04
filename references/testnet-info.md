# Testnet Information

## Circle Developer Console

**URL:** https://console.circle.com

### Getting API Credentials

1. Sign up / Log in to Circle Developer Console
2. Go to: Keys → Create a key → API key → Standard Key
3. Copy your API key
4. Register an Entity Secret (required for signing transactions)

### Testnet Faucet

**URL:** https://console.circle.com/faucets

Available tokens:
- USDC (testnet) - on all supported chains
- Native gas tokens (ETH, MATIC, AVAX)

## Supported Testnet Chains

| Chain | Network ID | Chain ID | Explorer |
|-------|------------|----------|----------|
| Ethereum Sepolia | ETH-SEPOLIA | 11155111 | https://sepolia.etherscan.io |
| Polygon Amoy | MATIC-AMOY | 80002 | https://amoy.polygonscan.com |
| Avalanche Fuji | AVAX-FUJI | 43113 | https://testnet.snowtrace.io |
| Arbitrum Sepolia | ARB-SEPOLIA | 421614 | https://sepolia.arbiscan.io |

## USDC Contract Addresses (Testnet)

| Chain | USDC Address |
|-------|--------------|
| Ethereum Sepolia | 0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238 |
| Polygon Amoy | 0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582 |
| Avalanche Fuji | 0x5425890298aed601595a70AB815c96711a31Bc65 |
| Arbitrum Sepolia | 0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d |

## CCTP Contract Addresses (Testnet)

### TokenMessenger (for burning/bridging)
| Chain | Address |
|-------|---------|
| Ethereum Sepolia | 0x9f3B8679c73C2Fef8b59B4f3444d4e156fb70AA5 |
| Avalanche Fuji | 0xeb08f243E5d3FCFF26A9E38Ae5520A669f4019d0 |
| Arbitrum Sepolia | 0x9f3B8679c73C2Fef8b59B4f3444d4e156fb70AA5 |

### MessageTransmitter (for receiving)
| Chain | Address |
|-------|---------|
| Ethereum Sepolia | 0x7865fAfC2db2093669d92c0F33AeEF291086BEFD |
| Avalanche Fuji | 0xa9fB1b3009DCb79E2fe346c16a604B8Fa8aE0a79 |
| Arbitrum Sepolia | 0xaCF1ceeF35caAc005e15888dDb8A3515C41B4872 |

## Domain IDs (CCTP)

| Chain | Domain ID |
|-------|-----------|
| Ethereum | 0 |
| Avalanche | 1 |
| Optimism | 2 |
| Arbitrum | 3 |
| Noble | 4 |
| Solana | 5 |
| Base | 6 |
| Polygon | 7 |

## Rate Limits

Circle API rate limits (Developer tier):
- 100 requests per minute
- 1000 requests per hour
- Transaction limits vary by account tier

## API Endpoints

**Base URL:** `https://api.circle.com/v1/w3s`

Key endpoints:
- `POST /developer/walletSets` - Create wallet set
- `POST /developer/wallets` - Create wallets
- `GET /wallets/{id}/balances` - Get balances
- `POST /developer/transactions/transfer` - Send tokens
- `POST /developer/transactions/contractExecution` - Contract calls

## Resources

- [Circle Developer Docs](https://developers.circle.com)
- [Programmable Wallets Guide](https://developers.circle.com/wallets/dev-controlled)
- [CCTP Documentation](https://developers.circle.com/stablecoins/cctp)
- [API Reference](https://developers.circle.com/api-reference)
- [SDK GitHub](https://github.com/circlefin/circle-web3-nodejs-sdk)
