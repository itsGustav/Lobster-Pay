# Dispute Resolution System

## Overview
Complete dispute resolution system for Pay Lobster escrows with arbitration support.

## Features Implemented

### ✅ Core Functionality
- [x] Dispute creation flow
- [x] Evidence submission
- [x] Dispute dashboard with filtering
- [x] Status tracking (Open, Evidence, Resolved)
- [x] Dispute detail view with timeline
- [x] Admin resolution (MVP - no on-chain changes)

### ✅ Files Created

#### Type Definitions
- `src/types/dispute.ts` - Complete TypeScript interfaces for disputes, evidence, and resolutions

#### Service Layer
- `src/lib/disputes.ts` - DisputeService class with Firestore operations
  - createDispute()
  - getDispute()
  - listDisputesByUser()
  - listDisputesByEscrow()
  - addEvidence()
  - resolveDispute()
  - hasActiveDispute()

#### API Routes
- `src/app/api/disputes/route.ts`
  - GET: List disputes by wallet or escrowId
  - POST: Create new dispute
  
- `src/app/api/disputes/[id]/route.ts`
  - GET: Get dispute details

- `src/app/api/disputes/[id]/evidence/route.ts`
  - POST: Add evidence to dispute

- `src/app/api/disputes/[id]/resolve/route.ts`
  - POST: Resolve dispute (admin only)

#### UI Components
- `src/components/DisputeCard.tsx` - Dispute list item with status badges
- `src/components/DisputeForm.tsx` - Form for creating disputes

#### Dashboard Pages
- `src/app/dashboard/disputes/page.tsx` - Disputes list with stats and filters
- `src/app/dashboard/disputes/[id]/page.tsx` - Detailed dispute view with evidence timeline

## Data Model

### Dispute Status Flow
```
open → evidence → resolved
```

### Firestore Collections
```
disputes/
  {disputeId}/
    - escrowId: string
    - createdBy: string (wallet address)
    - recipientAddress: string
    - depositorAddress: string
    - reason: string
    - desiredResolution: string
    - status: 'open' | 'evidence' | 'resolved'
    - evidence: Evidence[]
    - resolution?: DisputeResolution
    - createdAt: number
    - updatedAt: number
```

## UI Features

### Dashboard (`/dashboard/disputes`)
- Stats cards showing total, open, evidence, and resolved counts
- Filter buttons for status
- Dispute cards with:
  - Status badges
  - Escrow amount
  - Parties involved
  - Evidence count
  - Quick actions

### Dispute Detail (`/dashboard/disputes/[id]`)
- Full dispute information
- Evidence timeline (chronological)
- Evidence submission form (for parties only)
- Resolution display (when resolved)
- Party addresses and escrow details

### Dispute Form
- Reason input
- Desired resolution textarea
- Optional initial evidence
- Important warnings about dispute implications

## Security & Auth

### Current Implementation (MVP)
- Wallet address passed via `x-wallet-address` header
- TODO: Implement proper JWT/session auth
- TODO: Admin role checking for resolution endpoint

### Access Control
- Only dispute parties can submit evidence
- Anyone can view their own disputes
- Resolution endpoint needs admin restriction (TODO)

## Integration Guide

### Creating a Dispute
```typescript
const response = await fetch('/api/disputes', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-wallet-address': userAddress,
  },
  body: JSON.stringify({
    escrowId: 'escrow_123',
    reason: 'Work not completed as agreed',
    desiredResolution: 'Full refund',
    initialEvidence: 'Screenshots showing incomplete work',
  }),
});
```

### Adding Evidence
```typescript
const response = await fetch(`/api/disputes/${disputeId}/evidence`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-wallet-address': userAddress,
  },
  body: JSON.stringify({
    text: 'Additional evidence...',
  }),
});
```

### Resolving a Dispute (Admin)
```typescript
const response = await fetch(`/api/disputes/${disputeId}/resolve`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-wallet-address': adminAddress,
  },
  body: JSON.stringify({
    type: 'arbitration',
    outcome: 'favor-creator',
    notes: 'Evidence strongly supports creator claims',
  }),
});
```

## Next Steps

### MVP Complete ✅
- [x] Dispute creation
- [x] Evidence submission  
- [x] Dashboard with filtering
- [x] Status tracking
- [x] Detail view with timeline

### Future Enhancements
- [ ] On-chain integration (freeze escrow on dispute)
- [ ] Admin dashboard for arbitration
- [ ] File upload for evidence
- [ ] Email notifications
- [ ] Dispute appeal system
- [ ] Automated resolution for simple cases
- [ ] Integration with trust score system

## Testing

### Manual Testing Checklist
1. Connect wallet
2. Navigate to `/dashboard/disputes`
3. Create a test dispute
4. Add evidence to dispute
5. Filter by status
6. View dispute details
7. Test resolution (admin)

### Test Data Setup
```typescript
// Create test dispute via API
POST /api/disputes
{
  "escrowId": "test_escrow_1",
  "reason": "Test dispute",
  "desiredResolution": "Test resolution",
  "initialEvidence": "Test evidence"
}
```

## Design System

### Colors
- Open: Warning (orange/yellow)
- Evidence: Default (gray/blue)
- Resolved: Success (green)

### Components Used
- `Card` - Container component
- `Button` - Primary, Secondary, Outline variants
- `Badge` - Status indicators
- `Input` - Form fields
- `EmptyState` - No disputes UI

## Notes

- All disputes stored in Firestore (off-chain for MVP)
- No blockchain integration yet - disputes don't actually freeze escrows
- Manual arbitration only - no automated resolution
- Admin auth needs to be implemented for production
- Evidence attachments supported in data model but not UI yet

## Files Summary

Total files created: 12
- 1 type definition
- 1 service layer
- 4 API routes  
- 2 UI components
- 2 dashboard pages
- 1 README (this file)

All code follows existing Pay Lobster design patterns and uses established UI components.
