# Dispute Resolution System Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         Pay Lobster Platform                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌────────────────┐         ┌────────────────┐                 │
│  │  Escrow System │◄────────┤ Dispute System │                 │
│  │                │  raises │                │                 │
│  │  - Create      │  dispute│  - Create      │                 │
│  │  - Release     │         │  - Evidence    │                 │
│  │  - Refund      │         │  - Resolve     │                 │
│  └────────────────┘         └────────────────┘                 │
│         │                            │                          │
│         │                            │                          │
│         ▼                            ▼                          │
│  ┌────────────────────────────────────────────┐                │
│  │         Firestore Database                  │                │
│  │                                             │                │
│  │  escrows/           disputes/               │                │
│  │  ├─ escrowId        ├─ disputeId           │                │
│  │  ├─ amount          ├─ escrowId (ref)      │                │
│  │  ├─ status          ├─ status              │                │
│  │  └─ parties         ├─ parties             │                │
│  │                     ├─ evidence[]          │                │
│  │                     └─ resolution?         │                │
│  └────────────────────────────────────────────┘                │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## File Structure

```
Pay-Lobster-Website/web/
├── src/
│   ├── types/
│   │   └── dispute.ts              ← Type definitions
│   │
│   ├── lib/
│   │   └── disputes.ts             ← Service layer (Firestore ops)
│   │
│   ├── app/
│   │   ├── api/
│   │   │   └── disputes/
│   │   │       ├── route.ts                    ← GET list, POST create
│   │   │       └── [id]/
│   │   │           ├── route.ts                ← GET details
│   │   │           ├── evidence/
│   │   │           │   └── route.ts            ← POST add evidence
│   │   │           └── resolve/
│   │   │               └── route.ts            ← POST resolve
│   │   │
│   │   └── dashboard/
│   │       └── disputes/
│   │           ├── page.tsx                    ← List view
│   │           └── [id]/
│   │               └── page.tsx                ← Detail view
│   │
│   └── components/
│       ├── DisputeCard.tsx         ← List item component
│       └── DisputeForm.tsx         ← Creation form
│
└── Documentation/
    ├── DISPUTE_SYSTEM_README.md    ← Complete guide
    ├── DISPUTE_FLOW.md             ← User flows
    ├── DISPUTE_DELIVERABLES.md     ← Task checklist
    └── DISPUTE_ARCHITECTURE.md     ← This file
```

## Layer Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Presentation Layer                    │
│                                                          │
│  DisputeCard   DisputeForm   Dashboard   Detail Page    │
│      │             │              │            │         │
└──────┼─────────────┼──────────────┼────────────┼─────────┘
       │             │              │            │
       │             └──────────────┴────────────┘
       │                           │
┌──────┼───────────────────────────┼──────────────────────┐
│      │        API Layer          │                       │
│      │                           │                       │
│      │  POST /api/disputes       │  GET /api/disputes    │
│      │  GET  /api/disputes/[id]  │  (wallet or escrowId) │
│      │  POST /api/disputes/[id]/evidence                 │
│      │  POST /api/disputes/[id]/resolve                  │
│      │                           │                       │
└──────┼───────────────────────────┼──────────────────────┘
       │                           │
       └───────────┬───────────────┘
                   │
┌──────────────────┼──────────────────────────────────────┐
│       Service Layer (DisputeService)                     │
│                  │                                       │
│  createDispute() │ listDisputesByUser()                 │
│  getDispute()    │ listDisputesByEscrow()               │
│  addEvidence()   │ resolveDispute()                     │
│                  │                                       │
└──────────────────┼──────────────────────────────────────┘
                   │
┌──────────────────┼──────────────────────────────────────┐
│         Data Layer (Firestore)                           │
│                  │                                       │
│    disputes/     │    Collections & Indexes             │
│     └─ {id}      │    - Query by wallet                 │
│                  │    - Query by escrowId               │
│                  │    - Filter by status                │
│                  │                                       │
└──────────────────────────────────────────────────────────┘
```

## Request Flow Example

### Creating a Dispute

```
User                 UI                   API                Service              Firestore
 │                   │                    │                    │                     │
 │ Fill form         │                    │                    │                     │
 ├──────────────────→│                    │                    │                     │
 │                   │ Submit             │                    │                     │
 │                   ├───────────────────→│                    │                     │
 │                   │ POST /api/disputes │                    │                     │
 │                   │                    │ createDispute()    │                     │
 │                   │                    ├───────────────────→│                     │
 │                   │                    │                    │ disputes.doc().set()│
 │                   │                    │                    ├────────────────────→│
 │                   │                    │                    │                     │ ✓
 │                   │                    │                    │←────────────────────┤
 │                   │                    │ ←──────────────────┤                     │
 │                   │ ←──────────────────┤  return dispute    │                     │
 │ ←─────────────────┤                    │                    │                     │
 │ Show success      │                    │                    │                     │
 │ Navigate to detail│                    │                    │                     │
```

## Data Flow Diagram

```
┌──────────────────────────────────────────────────────────────┐
│                        User Actions                           │
└─────┬────────────────────────────────────┬──────────────────┘
      │                                     │
      ▼                                     ▼
┌──────────────┐                    ┌──────────────┐
│ Create       │                    │ View         │
│ Dispute      │                    │ Disputes     │
└──────┬───────┘                    └──────┬───────┘
       │                                    │
       ▼                                    ▼
┌──────────────┐                    ┌──────────────┐
│ DisputeForm  │                    │ Dashboard    │
│              │                    │              │
│ - reason     │                    │ - filters    │
│ - resolution │                    │ - stats      │
│ - evidence   │                    │ - cards      │
└──────┬───────┘                    └──────┬───────┘
       │                                    │
       ├────────────────┬───────────────────┤
       │                │                   │
       ▼                ▼                   ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ POST         │  │ GET          │  │ GET          │
│ /disputes    │  │ /disputes    │  │ /disputes/id │
└──────┬───────┘  └──────┬───────┘  └──────┬───────┘
       │                 │                  │
       └─────────────────┼──────────────────┘
                         │
                         ▼
                ┌────────────────┐
                │ DisputeService │
                │                │
                │ - CRUD ops     │
                │ - Validation   │
                │ - Auth checks  │
                └────────┬───────┘
                         │
                         ▼
                ┌────────────────┐
                │   Firestore    │
                │                │
                │ disputes/      │
                │  └─ {id}       │
                └────────────────┘
```

## Component Props Flow

```
DisputesPage (List)
├─ disputes: Dispute[]
├─ statusFilter: DisputeStatus | 'all'
└─ → DisputeCard
   ├─ dispute: Dispute
   └─ Renders:
      ├─ Status badge
      ├─ Amount
      ├─ Parties
      └─ Actions

DisputeDetailPage
├─ disputeId: string (from params)
├─ dispute: Dispute | null
├─ evidenceText: string (local state)
└─ Renders:
   ├─ Dispute header
   ├─ Details section
   ├─ Evidence timeline
   │  └─ Evidence items (sorted)
   └─ Evidence form (if party & active)

DisputeForm
├─ escrowId: string
├─ onSubmit: (data) => Promise<void>
├─ onCancel?: () => void
└─ Manages:
   ├─ reason
   ├─ desiredResolution
   └─ initialEvidence
```

## State Management

```
┌────────────────────────────────────────────────────────┐
│              Client State (React hooks)                 │
├────────────────────────────────────────────────────────┤
│                                                         │
│  DisputesPage:                                         │
│  ├─ disputes: Dispute[]           ← from API           │
│  ├─ filteredDisputes: Dispute[]   ← computed           │
│  ├─ statusFilter: string          ← local state        │
│  ├─ isLoading: boolean            ← local state        │
│  └─ error: string | null          ← local state        │
│                                                         │
│  DisputeDetailPage:                                    │
│  ├─ dispute: Dispute | null       ← from API           │
│  ├─ evidenceText: string          ← local state        │
│  ├─ isSubmitting: boolean         ← local state        │
│  ├─ isLoading: boolean            ← local state        │
│  └─ error: string | null          ← local state        │
│                                                         │
│  DisputeForm:                                          │
│  ├─ formData: {...}               ← local state        │
│  ├─ isSubmitting: boolean         ← local state        │
│  └─ error: string | null          ← local state        │
│                                                         │
└────────────────────────────────────────────────────────┘
```

## Security Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   Security Layers                        │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  1. Authentication (TODO)                               │
│     ├─ JWT/Session validation                           │
│     ├─ Wallet signature verification                    │
│     └─ Currently: x-wallet-address header (MVP)         │
│                                                          │
│  2. Authorization                                        │
│     ├─ Party verification (for evidence)                │
│     ├─ Admin role check (for resolution) - TODO         │
│     └─ Ownership validation                             │
│                                                          │
│  3. Data Validation                                      │
│     ├─ Required fields check                            │
│     ├─ Type validation (TypeScript)                     │
│     └─ Business logic validation                        │
│                                                          │
│  4. Firestore Rules (TODO)                              │
│     ├─ Read: only parties involved                      │
│     ├─ Write: only through API                          │
│     └─ No direct client access                          │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

## Performance Considerations

```
┌─────────────────────────────────────────────────────────┐
│                    Optimization                          │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  1. Firestore Indexes                                   │
│     ├─ createdBy + status                               │
│     ├─ recipientAddress + status                        │
│     ├─ depositorAddress + status                        │
│     └─ escrowId + status                                │
│                                                          │
│  2. Data Denormalization                                 │
│     ├─ escrowAmount (copied from escrow)                │
│     └─ escrowDescription (copied from escrow)           │
│                                                          │
│  3. Query Optimization                                   │
│     ├─ Limited fields in list view                      │
│     ├─ Pagination ready (limit param)                   │
│     └─ Status filter at DB level                        │
│                                                          │
│  4. Client-Side                                          │
│     ├─ React.memo for cards                             │
│     ├─ Debounced evidence submission                    │
│     └─ Optimistic UI updates                            │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

## Integration Points

```
Current System              Dispute System              Future
─────────────────────────────────────────────────────────────

Escrow Smart Contract  →    Dispute Tracker      →     On-chain
   │                            │                         Freeze
   │                            │                         Function
   │                            ▼                            │
   └──────────────→      Check for disputes               ←─┘
                               │
                               ▼
                         Firestore
                          disputes/
                               │
                               ├──→ Dashboard UI
                               ├──→ Evidence UI
                               └──→ Resolution UI
                                         │
                                         ▼
                                    Admin Panel
                                    (Future)
```

## Monitoring & Logging

```
┌─────────────────────────────────────────────────────────┐
│                  Observability                           │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Server-Side Logging                                    │
│  ├─ API requests (method, path, status)                │
│  ├─ Error logs (with stack traces)                     │
│  ├─ Dispute creation events                            │
│  ├─ Evidence submission events                         │
│  └─ Resolution events                                   │
│                                                          │
│  Client-Side Tracking (Future)                          │
│  ├─ Page views                                          │
│  ├─ User actions                                        │
│  ├─ Error boundaries                                    │
│  └─ Performance metrics                                 │
│                                                          │
│  Database Metrics                                       │
│  ├─ Query performance                                   │
│  ├─ Document counts                                     │
│  └─ Read/write operations                              │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

## Deployment Architecture

```
┌─────────────────────────────────────────────────────────┐
│                      Production                          │
├─────────────────────────────────────────────────────────┤
│                                                          │
│   Vercel (Next.js App)                                  │
│   ├─ Static pages (pre-rendered)                        │
│   ├─ API routes (serverless functions)                  │
│   └─ Edge caching                                       │
│          │                                               │
│          ▼                                               │
│   Firebase (Firestore)                                  │
│   ├─ disputes collection                                │
│   ├─ Indexes                                            │
│   ├─ Security rules                                     │
│   └─ Automatic backups                                  │
│                                                          │
└─────────────────────────────────────────────────────────┘
```
