# x402 Protocol Specification

**Status:** Draft v1  
**Author:** Pay Lobster Team  
**Updated:** February 2026

## Overview

The x402 protocol extends HTTP with automatic cryptocurrency payments. When a server returns `402 Payment Required`, clients can automatically pay and retry the request.

## Why x402?

Traditional HTTP 402 has no standard payment mechanism. x402 fills this gap:

- ✅ **Automatic payments** - No manual checkout flow
- ✅ **Multi-chain** - Supports Base, Solana, Ethereum, etc.
- ✅ **Agent-friendly** - AI agents can pay for APIs autonomously
- ✅ **Privacy-preserving** - No accounts or credit cards

## Flow

```
1. Client → GET /api/premium → Server
2. Server → 402 Payment Required + Challenge → Client
3. Client → [Pay USDC on-chain]
4. Client → GET /api/premium + Payment Proof → Server
5. Server → 200 OK + Data → Client
```

## Payment Challenge (Server Response)

When access requires payment, server returns:

```http
HTTP/1.1 402 Payment Required
Content-Type: application/json

{
  "x-payment-required": {
    "version": "1",
    "chains": [
      {
        "chain": "base",
        "network": "base-mainnet",
        "receiver": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb5",
        "asset": "USDC",
        "amount": "1.00"
      },
      {
        "chain": "solana",
        "network": "solana-mainnet",
        "receiver": "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
        "asset": "USDC",
        "amount": "0.95"
      }
    ],
    "description": "Premium API access",
    "expires": 1738704000,
    "nonce": "550e8400-e29b-41d4-a716-446655440000"
  }
}
```

### Fields

- **version** (string): Protocol version (currently "1")
- **chains** (array): Supported payment methods
  - **chain** (string): Blockchain name ("base", "solana", "ethereum")
  - **network** (string): Network identifier
  - **receiver** (string): Payment recipient address
  - **asset** (string): Asset to pay ("USDC", "ETH", "SOL")
  - **amount** (string): Amount in asset units
- **description** (string): Human-readable description
- **expires** (number): Unix timestamp when challenge expires
- **nonce** (string): Unique challenge identifier (UUID)

## Payment Proof (Client Request)

After paying on-chain, client retries with proof:

```http
GET /api/premium HTTP/1.1
X-Payment-Chain: base
X-Payment-TxHash: 0x1234567890abcdef...
X-Payment-Amount: 1.00
X-Payment-Nonce: 550e8400-e29b-41d4-a716-446655440000
X-Payment-Timestamp: 1738703950
```

### Headers

- **X-Payment-Chain**: Chain where payment was made
- **X-Payment-TxHash**: Transaction hash/signature
- **X-Payment-Amount**: Amount paid
- **X-Payment-Nonce**: Challenge nonce from original 402
- **X-Payment-Timestamp**: Unix timestamp of payment

## Server Verification

Server MUST:

1. Verify `X-Payment-Nonce` matches a recent challenge
2. Query blockchain for transaction `X-Payment-TxHash`
3. Verify transaction:
   - Receiver matches challenge
   - Amount >= requested amount
   - Asset matches (e.g., USDC)
   - Transaction is confirmed
4. Mark nonce as used (prevent replay attacks)

Example verification (Base):

```typescript
import { ethers } from 'ethers';

async function verifyPayment(proof: PaymentProof): Promise<boolean> {
  const provider = new ethers.JsonRpcProvider('https://mainnet.base.org');
  
  // Get transaction receipt
  const receipt = await provider.getTransactionReceipt(proof.txHash);
  
  if (!receipt) return false;
  
  // Verify transaction is confirmed
  if (!receipt.status) return false;
  
  // Parse USDC Transfer event
  const usdc = new ethers.Contract(USDC_ADDRESS, ERC20_ABI, provider);
  const transferEvent = receipt.logs
    .map(log => {
      try {
        return usdc.interface.parseLog(log);
      } catch {
        return null;
      }
    })
    .find(event => event?.name === 'Transfer');
  
  if (!transferEvent) return false;
  
  // Verify recipient and amount
  const { to, value } = transferEvent.args;
  const amountUSDC = ethers.formatUnits(value, 6);
  
  return (
    to.toLowerCase() === expectedReceiver.toLowerCase() &&
    parseFloat(amountUSDC) >= parseFloat(expectedAmount)
  );
}
```

## Client Implementation

Pay Lobster SDK handles x402 automatically:

```typescript
import { MultiChainLobsterAgent } from 'pay-lobster';

const agent = new MultiChainLobsterAgent({
  chains: {
    base: { privateKey: '...' },
    solana: { privateKey: '...' },
  },
  x402: {
    enabled: true,
    maxAutoPayUSDC: 10,  // Auto-approve up to $10
  },
});

// Automatically handles 402 and retries
const response = await agent.payX402('https://api.example.com/premium');
const data = await response.json();
```

Manual implementation:

```typescript
async function fetchWithX402(url: string): Promise<Response> {
  const response = await fetch(url);
  
  if (response.status !== 402) {
    return response;
  }
  
  // Parse challenge
  const body = await response.json();
  const challenge = body['x-payment-required'];
  
  // Select payment method (prefer cheapest)
  const paymentOption = challenge.chains.sort(
    (a, b) => parseFloat(a.amount) - parseFloat(b.amount)
  )[0];
  
  // Execute payment on-chain
  const txHash = await sendUSDC(
    paymentOption.receiver,
    paymentOption.amount,
    paymentOption.chain
  );
  
  // Retry with proof
  return fetch(url, {
    headers: {
      'X-Payment-Chain': paymentOption.chain,
      'X-Payment-TxHash': txHash,
      'X-Payment-Amount': paymentOption.amount,
      'X-Payment-Nonce': challenge.nonce,
      'X-Payment-Timestamp': Math.floor(Date.now() / 1000).toString(),
    },
  });
}
```

## Security Considerations

### Replay Attacks
- Server MUST track used nonces
- Nonces should expire (e.g., 1 hour)
- Payment proof is bound to specific nonce

### Double Spending
- Server MUST verify transaction on-chain
- Don't rely solely on client-provided headers
- Check transaction is confirmed

### Amount Verification
- Verify `amount >= requested_amount`
- Account for blockchain decimals (USDC = 6)
- Check correct asset (not ETH when USDC expected)

### Expiration
- Challenges expire after `expires` timestamp
- Don't accept proofs for expired challenges
- Client should check expiration before paying

## Multi-Chain Support

Supported blockchains:

| Chain | Network ID | USDC Address |
|-------|-----------|-------------|
| Base Mainnet | `base-mainnet` | `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913` |
| Base Sepolia | `base-sepolia` | [Testnet address] |
| Solana Mainnet | `solana-mainnet` | `EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v` |
| Solana Devnet | `solana-devnet` | `Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr` |
| Ethereum | `ethereum-mainnet` | `0xA0b86a33d6d3D7d2bEe9F3F7a0BaA3Bd6a0Cf2D5` |

## Use Cases

### 1. Pay-Per-Request APIs
```http
GET /api/generate-image?prompt=sunset
→ 402 Payment Required (0.10 USDC)
→ [Pay on-chain]
→ 200 OK + image data
```

### 2. Subscription Gating
```http
GET /api/premium-data
→ 402 Payment Required (monthly: 10 USDC)
→ [Pay on-chain, get session token]
→ Use session token for subsequent requests
```

### 3. AI Agent Marketplaces
```http
GET /agents/gpt4/invoke
→ 402 Payment Required (per token: 0.0001 USDC)
→ [Agent pays automatically]
→ 200 OK + AI response
```

## Examples

See:
- [examples/x402-server.ts](./examples/x402-server.ts) - Server implementation
- [examples/x402-client.ts](./examples/x402-client.ts) - Client implementation
- [lib/x402.ts](./lib/x402.ts) - Pay Lobster SDK

## Future Extensions

- **v2**: Streaming payments (pay per byte)
- **v3**: Payment channels (off-chain micropayments)
- **v4**: Cross-chain atomic swaps
- **v5**: Subscription tokens (ERC-721 access passes)

## Contributing

This is an early draft. Feedback welcome!

- GitHub: https://github.com/itsGustav/Pay-Lobster
- Email: realtorjakub@gmail.com

---

**License:** MIT  
**Version:** Draft v1  
**Status:** Experimental
