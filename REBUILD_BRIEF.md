# PayLobster.com Rebuild Brief

## Vision
PayLobster.com becomes **the** single platform for the agent payment economy. One door, everything behind it. Trust, elegance, simplicity.

## Brand Direction
- **Theme:** Blue = trust. We're handling money. Purple is gone.
- **Primary colors:** Deep navy `#0A1628`, electric blue `#2563EB`, cyan accent `#06B6D4`
- **Background:** Near-black navy `#030B1A`, not pure black
- **Logo:** Blue lobster (1-in-2-million mutation — rare, valuable, memorable)
- **Feel:** Stripe meets Coinbase. Premium fintech, not a dApp.

## Architecture: Consolidate Under `/web`
The `/web` Next.js app becomes the ONLY deploy. Everything else merges in:
- `index.html` (landing) → Convert to Next.js pages inside `/web`
- `base-app/` features → Merge into `/web` dashboard (Smart Wallet, PWA)
- `hub/` → Merge into `/web` dashboard
- `frame/` → Keep as route inside `/web` or standalone (Farcaster needs its own endpoint)

## Current `/web` Stack (KEEP, don't replace)
- Next.js 15 (App Router)
- Firebase Auth + Firestore
- NextAuth v5 with Firebase adapter
- RainbowKit + wagmi (wallet connection)
- Tailwind CSS + framer-motion
- viem for contract reads

## Phase 1: Blue Rebrand of Landing Page

### Task
Convert `index.html` (4,033 lines) into a Next.js landing page within `/web`:
1. Create `/web/src/app/(marketing)/page.tsx` — the new landing page
2. Port ALL content from index.html (don't lose any sections)
3. Apply the blue theme:
   - `--primary: #2563EB` (electric blue)
   - `--primary-light: #3B82F6`
   - `--primary-dark: #1D4ED8`
   - `--secondary: #06B6D4` (cyan)
   - `--accent: #10B981` (emerald for success states)
   - `--dark: #0A1628` (navy)
   - `--darker: #030B1A`
4. Replace all lobster emoji/icons with blue lobster SVG
5. Update favicon to blue lobster
6. Use shadcn/ui components where appropriate
7. Ensure mobile responsive
8. Add subtle animations (framer-motion)

### Content Sections to Port (from index.html)
- Hero: "The Payment Layer for Autonomous Agents"
- Use cases (6 cards: AI Developers, Agent Builders, Businesses, Freelancers, API Providers, Everyone)
- How It Works (Discover → Verify → Pay → Rate)
- Trust Scores section with tier table
- Agent-to-Agent future vision
- x402 Payment Protocol
- Escrow Templates
- Analytics & Reporting
- CTA / Get Started

### Design Standards
- Typography: Inter for body, JetBrains Mono for code
- Spacing: 8px grid system
- Border radius: 8px for cards, 12px for large containers
- Shadows: subtle, layered (not flat, not heavy)
- Glassmorphism: subtle backdrop-blur on nav and cards
- Animations: smooth, purposeful, not distracting
- Trust signals: verification badges, lock icons, "secured by Base" indicators

## Phase 2: Auth & Dashboard (after Phase 1)
- Fix auth flow (clean Firebase Auth)
- Dashboard home with balance + LOBSTER score + activity
- Agent registration from dashboard
- Wallet connection

## Phase 3: Feature Integration (after Phase 2)
- Merge base-app PWA features
- Merge hub command center
- Farcaster integration
- Real-time updates

## Contract Addresses (for any on-chain reads)
- Identity: `0xA174ee274F870631B3c330a85EBCad74120BE662`
- Reputation: `0x02bb4132a86134684976E2a52E43D59D89E64b29`
- Credit: `0xD9241Ce8a721Ef5fcCAc5A11983addC526eC80E1`
- Escrow: `0x49EdEe04c78B7FeD5248A20706c7a6c540748806`
- USDC (Base): `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`

## Quality Bar
- No placeholder content. Every section is real.
- No broken links. Every route works.
- Mobile-first. If it looks bad on phone, it's not done.
- Lighthouse score: 90+ across all categories.
- Accessibility: WCAG 2.1 AA minimum.
- Page load: under 3 seconds on 3G.
- Zero TypeScript errors. Zero console warnings.

## Domain
- paylobster.com (CNAME currently wrong — points to lobsterpay.com, needs fixing)
- Deploy to Vercel from the /web directory
