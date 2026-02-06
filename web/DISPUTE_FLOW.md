# Dispute Resolution Flow

## User Journey

### 1. Create Dispute
```
Escrow Detail Page
    ↓
[Raise Dispute] button
    ↓
Dispute Form (/dashboard/disputes/new)
    ├─ Reason (required)
    ├─ Desired Resolution (required)
    └─ Initial Evidence (optional)
    ↓
POST /api/disputes
    ↓
Dispute Created (status: open)
    ↓
Redirect to /dashboard/disputes/{id}
```

### 2. Evidence Phase
```
Dispute Detail Page
    ↓
Evidence Timeline
    ├─ All parties can view
    └─ Parties can add evidence
    ↓
[Submit Evidence] form
    ├─ Text (required)
    └─ Attachments (optional - future)
    ↓
POST /api/disputes/{id}/evidence
    ↓
Evidence Added
Status: open → evidence
```

### 3. Resolution
```
Admin Dashboard (future)
    ↓
Review Dispute
    ├─ Read all evidence
    ├─ Check escrow details
    └─ Make decision
    ↓
POST /api/disputes/{id}/resolve
    ├─ Type: arbitration | mutual | timeout
    ├─ Outcome: favor-creator | favor-recipient | split
    └─ Notes: Explanation
    ↓
Dispute Resolved
Status: evidence → resolved
    ↓
Parties notified (future)
```

## API Flow Diagram

```
Client                      API Routes                    Firestore
  │                             │                             │
  ├─ POST /api/disputes ───────→│                             │
  │                             ├─ DisputeService.create() ──→│
  │                             │                             ├─ Save dispute
  │                             │←────────────────────────────┤
  │←─────── dispute ────────────┤                             │
  │                             │                             │
  ├─ GET /api/disputes?wallet=X →│                            │
  │                             ├─ DisputeService.listByUser()→│
  │                             │                             ├─ Query by parties
  │                             │←────────────────────────────┤
  │←─────── disputes[] ─────────┤                             │
  │                             │                             │
  ├─ POST /api/disputes/{id}/evidence →│                      │
  │                             ├─ Verify party ──────────────→│
  │                             ├─ DisputeService.addEvidence()│
  │                             │                             ├─ Update evidence[]
  │                             │←────────────────────────────┤
  │←─────── evidence ───────────┤                             │
  │                             │                             │
  ├─ POST /api/disputes/{id}/resolve →│                       │
  │                             ├─ Verify admin (TODO)        │
  │                             ├─ DisputeService.resolve() ──→│
  │                             │                             ├─ Set resolution
  │                             │                             ├─ Update status
  │                             │←────────────────────────────┤
  │←─────── success ────────────┤                             │
```

## State Machine

```
┌──────┐
│ open │ Initial state when dispute created
└──┬───┘
   │
   │ [Evidence added by any party]
   ↓
┌──────────┐
│ evidence │ Both parties can submit evidence
└──────┬───┘
       │
       │ [Admin resolves]
       ↓
┌──────────┐
│ resolved │ Final state, no further changes
└──────────┘
```

## Component Hierarchy

```
DisputesPage (/dashboard/disputes)
├─ Stats Cards (total, open, evidence, resolved)
├─ Filter Buttons (all, open, evidence, resolved)
└─ DisputeCard[] (list of disputes)
    ├─ Status Badge
    ├─ Escrow Amount
    ├─ Reason
    ├─ Parties
    ├─ Evidence Count
    └─ [View Details] button

DisputeDetailPage (/dashboard/disputes/[id])
├─ Dispute Header
│  ├─ ID & Status
│  ├─ Created Date
│  └─ Escrow Amount
├─ Dispute Details
│  ├─ Escrow Info
│  ├─ Reason
│  ├─ Desired Resolution
│  └─ Parties
├─ Resolution (if resolved)
│  ├─ Outcome
│  ├─ Type
│  ├─ Notes
│  └─ Resolved Date
├─ Evidence Timeline
│  └─ Evidence Item[]
│     ├─ Submitter
│     ├─ Date
│     └─ Text
└─ Evidence Form (if active & is party)
   ├─ Text Input
   └─ [Submit] button

DisputeForm (/dashboard/disputes/new)
├─ Form Fields
│  ├─ Reason
│  ├─ Desired Resolution
│  └─ Initial Evidence
├─ Warning Box
└─ Actions
   ├─ [Cancel]
   └─ [Submit Dispute]
```

## Database Schema

### disputes Collection
```typescript
{
  id: string,                    // Auto-generated
  escrowId: string,              // Reference to escrow
  
  // Parties
  createdBy: string,             // Wallet who raised dispute
  recipientAddress: string,      // From escrow
  depositorAddress: string,      // From escrow
  
  // Details
  reason: string,
  desiredResolution: string,
  status: 'open' | 'evidence' | 'resolved',
  
  // Evidence
  evidence: [
    {
      id: string,
      submittedBy: string,
      submittedAt: number,
      text: string,
      attachments?: string[]
    }
  ],
  
  // Resolution (optional)
  resolution?: {
    type: 'arbitration' | 'mutual' | 'timeout',
    resolvedBy: string,
    resolvedAt: number,
    outcome: 'favor-creator' | 'favor-recipient' | 'split',
    notes: string,
    refundAmount?: number
  },
  
  // Metadata
  createdAt: number,
  updatedAt: number,
  
  // Denormalized (for display)
  escrowAmount: number,
  escrowDescription: string
}
```

## Access Control Matrix

| Action | Open | Evidence | Resolved | Who Can Do It |
|--------|------|----------|----------|---------------|
| View dispute | ✅ | ✅ | ✅ | Any party |
| Create dispute | ✅ | ❌ | ❌ | Depositor or Recipient |
| Add evidence | ✅ | ✅ | ❌ | Any party |
| Resolve | ❌ | ✅ | ❌ | Admin only |
| Edit dispute | ❌ | ❌ | ❌ | No one |

## Future On-Chain Integration

When integrating with smart contracts:

1. **Create Dispute** → Call `escrow.raiseDispute()`
   - Freezes escrow (can't release/refund)
   - Emits `DisputeRaised` event
   
2. **Add Evidence** → Off-chain only
   - Store in Firestore for arbitrator review
   
3. **Resolve Dispute** → Call `escrow.resolveDispute(outcome)`
   - Unfreezes escrow
   - Executes outcome (refund/release/split)
   - Emits `DisputeResolved` event

## Notification Flow (Future)

```
Dispute Created
    ↓
Email to both parties
    - Dispute ID
    - Reason
    - Next steps

Evidence Added
    ↓
Email to other party
    - New evidence available
    - Link to dispute

Dispute Resolved
    ↓
Email to both parties
    - Resolution outcome
    - Refund details
    - Link to dispute
```
