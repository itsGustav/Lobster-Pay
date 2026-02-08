# PayLobster Security Audit Report
**Date:** 2025-01-31  
**Scope:** HIGH and CRITICAL issues only  
**Auditor:** Security Sub-Agent

---

## Finding: Hardcoded Firebase API Key in Client Code

**Severity:** High

**Location:** `web/src/lib/firebase-client.ts` (line 12)

**Description:**
The Firebase API key is hardcoded as a fallback value in client-side code:
```typescript
apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyAhk3CbqNzPRT0H2Scvy1b1XD99ICkMRjE",
```

This key is visible to anyone inspecting the client bundle. While Firebase API keys are meant to be public (they're client-side), having a hardcoded fallback in the source code means:
1. The key is discoverable even if environment variables fail
2. It makes key rotation difficult
3. It's exposed in the git repository

**Recommendation:**
- Remove the hardcoded fallback value
- Fail fast if `NEXT_PUBLIC_FIREBASE_API_KEY` is not set
- If already committed, rotate the Firebase API key
- Add Firebase App Check for additional security layer
```typescript
apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
```

---

## Finding: Widget Charge API Accepts Unverified Transaction Data

**Severity:** Critical

**Location:** `web/src/app/api/v1/widget/charge/route.ts`

**Description:**
The `/api/v1/widget/charge` endpoint accepts transaction hashes from the client without on-chain verification:
```typescript
const { merchantKey, amount, from, to, transactionHash, label } = body;
```

The endpoint trusts the client to provide a valid transaction hash and then records it as a completed charge. An attacker could:
1. Submit fake transaction hashes
2. Reuse the same transaction hash multiple times
3. Submit transactions with incorrect amounts
4. Credit themselves without actual payment

**Recommendation:**
- **Verify all transactions on-chain** before recording charges
- Use ethers.js to fetch the transaction by hash and verify:
  - Transaction exists and is confirmed
  - Transaction recipient matches the merchant wallet
  - Transaction amount matches the claimed amount
  - Transaction sender matches the claimed sender
  - Transaction has not been previously recorded
- Store transaction hashes in a set to prevent replay attacks
```typescript
// Example verification
const provider = new ethers.JsonRpcProvider(BASE_RPC_URL);
const tx = await provider.getTransaction(transactionHash);
if (!tx || tx.to?.toLowerCase() !== to.toLowerCase()) {
  return NextResponse.json({ error: 'Invalid transaction' }, { status: 400 });
}
```

---

## Finding: Subscription Approval Endpoint Trusts Client Without On-Chain Verification

**Severity:** Critical

**Location:** `web/src/app/api/v1/subscriptions/[id]/approve/route.ts` (line 37-38)

**Description:**
The subscription approval endpoint includes a TODO comment acknowledging it trusts the frontend:
```typescript
// TODO: Verify the transaction on-chain to ensure approval was successful
// For now, we trust the frontend
```

An attacker could:
1. Call the approve endpoint without actually approving USDC spending on-chain
2. Get their subscription activated without granting token approval
3. The backend would then attempt to charge the subscription and fail (or worse, expose a vulnerability)

**Recommendation:**
- **Implement on-chain verification immediately**
- Before activating subscription, verify the ERC-20 approval:
```typescript
const USDC = new ethers.Contract(USDC_ADDRESS, ERC20_ABI, provider);
const allowance = await USDC.allowance(wallet_address, SUBSCRIPTION_CONTRACT);
if (allowance < approvedAmount) {
  return NextResponse.json({ error: 'Insufficient USDC approval' }, { status: 400 });
}
```
- Consider implementing event listening instead of trusting client submissions

---

## Finding: Weak API Key Validation Allows Bypass

**Severity:** High

**Location:** `web/src/app/api/v1/subscriptions/route.ts` (lines 25-29)

**Description:**
The subscription creation endpoint extracts the merchant ID directly from the API key without database validation:
```typescript
// TODO: Validate API key against database and get merchantId
// For now, extract merchantId from key (demo purposes)
const merchantId = apiKey.replace('sk_live_', '').replace('sk_test_', '');
```

An attacker could:
1. Craft arbitrary API keys with any merchant ID
2. Create subscriptions for any merchant
3. Access any merchant's data by guessing or enumerating merchant IDs

**Recommendation:**
- **Implement proper API key validation immediately**
- Store API keys hashed in the database with associated merchant IDs
- Validate every incoming API key against the database:
```typescript
const merchant = await db.collection('api_keys')
  .where('keyHash', '==', hashApiKey(apiKey))
  .where('active', '==', true)
  .limit(1)
  .get();
if (merchant.empty) {
  return NextResponse.json({ error: 'Invalid API key' }, { status: 401 });
}
```

---

## Finding: Disputes Can Be Resolved by Anyone (Missing Admin Check)

**Severity:** Critical

**Location:** `web/src/app/api/disputes/[id]/resolve/route.ts` (lines 28-29)

**Description:**
The dispute resolution endpoint has a TODO comment but allows anyone to resolve disputes:
```typescript
// TODO: Check if user is admin
// For MVP, allowing anyone to resolve (should be restricted)
```

An attacker could:
1. Resolve disputes in their own favor
2. Change escrow outcomes
3. Manipulate refund amounts

**Recommendation:**
- **Implement admin role checking immediately**
- Create an admin role in Firebase Auth or use a dedicated admin table
- Verify the caller has admin privileges:
```typescript
const adminDoc = await db.collection('admins').doc(walletAddress).get();
if (!adminDoc.exists) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
}
```
- Consider multi-signature resolution for high-value disputes

---

## Finding: Dispute Creation Uses Header-Based Authentication

**Severity:** High

**Location:** `web/src/app/api/disputes/route.ts` (lines 58-63)

**Description:**
The dispute creation endpoint uses an `x-wallet-address` header for authentication:
```typescript
const walletAddress = request.headers.get('x-wallet-address');
if (!walletAddress) {
  return NextResponse.json({ error: 'Wallet address required' }, { status: 401 });
}
```

This allows anyone to impersonate any wallet address by setting the header. An attacker could:
1. Create disputes on behalf of other users
2. Pollute the dispute database
3. Trigger DoS by mass-creating disputes

**Recommendation:**
- **Implement signature-based authentication**
- Require users to sign a message with their wallet
- Verify the signature on the backend:
```typescript
const { signature, message } = await request.json();
const recoveredAddress = ethers.verifyMessage(message, signature);
if (recoveredAddress.toLowerCase() !== walletAddress.toLowerCase()) {
  return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
}
```
- Or use Firebase Auth with wallet-based sign-in

---

## Finding: XSS Risk from Unsanitized HTML Rendering

**Severity:** High

**Location:** 
- `web/src/components/docs/CodeBlock.tsx` (lines 96, 113)
- `web/src/components/BadgePreview.tsx` (line 73)

**Description:**
Multiple components use `dangerouslySetInnerHTML` without proper sanitization:

1. **CodeBlock.tsx** - Syntax highlighting with regex replacement:
```typescript
return <span dangerouslySetInnerHTML={{ 
  __html: line.replace(/"([^"]+)":/g, '<span class="text-blue-400">"$1"</span>:')
}} />;
```

2. **BadgePreview.tsx** - Renders HTML from API:
```typescript
<div dangerouslySetInnerHTML={{ __html: widgetHTML }} />
```

If an attacker can control the input (e.g., through widget customization or code snippets), they could inject malicious scripts.

**Recommendation:**
- **CodeBlock.tsx**: Use a proper syntax highlighting library like `prism.js` or `highlight.js` instead of regex-based HTML injection
- **BadgePreview.tsx**: Sanitize the HTML with DOMPurify before rendering:
```typescript
import DOMPurify from 'isomorphic-dompurify';
<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(widgetHTML) }} />
```
- Or better yet, use iframe sandboxing for untrusted content:
```typescript
<iframe srcDoc={widgetHTML} sandbox="allow-scripts" />
```

---

## Finding: Missing Rate Limiting on Public APIs

**Severity:** High

**Location:** 
- `web/src/app/api/v1/widget/charge/route.ts`
- `web/src/app/api/v1/widget/merchant/route.ts`
- `web/src/app/api/disputes/route.ts`

**Description:**
Public-facing API endpoints have no rate limiting implemented. With CORS headers allowing public access, these endpoints are vulnerable to:
1. Spam/DoS attacks (mass charge recording)
2. Database pollution
3. Enumeration attacks (merchant discovery)
4. Resource exhaustion

**Recommendation:**
- Implement rate limiting at the Next.js middleware level or use a service like Upstash
- Apply different limits based on endpoint sensitivity:
```typescript
import rateLimit from '@/lib/rate-limit';

const limiter = rateLimit({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 500,
});

export async function POST(req: NextRequest) {
  try {
    await limiter.check(req, 10, 'CHARGE_API'); // 10 requests per minute
  } catch {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
  }
  // ... rest of handler
}
```
- For authenticated endpoints, use API key as identifier
- For public endpoints, use IP address with Cloudflare protection

---

## Summary

**Critical Issues:** 4
- Widget charge accepts unverified transactions
- Subscription approval trusts frontend without verification
- Anyone can resolve disputes (no admin check)
- Weak API key validation allows merchant impersonation

**High Issues:** 4
- Hardcoded Firebase API key in source code
- Header-based authentication allows impersonation
- XSS risk from unsanitized HTML rendering
- Missing rate limiting on public APIs

**Total Issues Found:** 8

---

## Priority Recommendations

**Immediate Action Required (Critical):**
1. Disable the widget charge endpoint until on-chain verification is implemented
2. Disable dispute resolution endpoint until admin checks are added
3. Implement proper API key database validation
4. Add on-chain verification for subscription approvals

**High Priority (Complete within 1 week):**
1. Remove hardcoded Firebase API key and rotate the key
2. Implement signature-based authentication for wallet operations
3. Sanitize all HTML rendering with DOMPurify or remove dangerouslySetInnerHTML
4. Add rate limiting to all public API endpoints

**Note:** No exposed secrets were found in `.env*` files (they don't exist in the repo, which is correct). No unlimited USDC approvals were found in the contract interaction code - all approvals are scoped to specific amounts.
