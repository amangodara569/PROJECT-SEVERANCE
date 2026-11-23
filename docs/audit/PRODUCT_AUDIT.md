# PRODUCT AUDIT: LINKEDOUT (PROJECT-SEVERANCE)
**Audit Version:** 1.0.0  
**Date:** November 23, 2026  
**Auditor Roles:** Senior Product Designer, Principal UX Architect, Product Manager, Senior Frontend Architect  
**Scope:** Repository codebase, live Express/Vite servers, data store, REST API contracts, UI components, and product architecture.

---

## 1. Product Summary & Current State

### What LinkedOut Currently Is
LinkedOut is a full-stack web application (React 19 + Tailwind v4 + Express 5 + JSON/Atlas store) that bills itself as an "unvarnished corporate social network inspired by *Severance*." The product attempts to blend:
1. A **professional identity network** (Outie mode: user profile, career headline, employment status, non-anonymous posting).
2. An **anonymous workplace forum** (Innie mode: pseudonymized handles, stripped author IDs, hidden profiles, severed department discussions).
3. A **workforce reduction tracking portal** (Severed Floor: community-verified layoff counts, 30-day sparklines, headcount reports).
4. A **career recovery board** (Comeback: job cards and "I got hired" reintegration announcements).

### The Core Problem It Is Supposed to Solve
Modern corporate platforms (principally LinkedIn) enforce toxic positivity, performative corporate cheerleading, and aggressive reputation management. When restructuring, mass layoffs, or workplace exploitation occur, employees cannot speak truthfully under their real identities without jeopardizing future employment, nor can they find solidarity without fear of corporate retaliation.
LinkedOut was conceived to solve this by providing a dual-identity safe haven: real reputation and alumni connection when desired (Outie), and complete, cryptographically segregated anonymity for raw workplace critique, severance package sharing, and layoff survival (Innie).

### Primary Target Users
1. **The Severed Employee**: Recently laid off, dealing with severance agreements, searching for peer advice, wanting to document corporate misconduct or warn others without legal or reputational blowback.
2. **The Anxious Current Employee**: Survived restructuring rounds, witnessing internal collapse, needing an anonymous outlet to sanity-check executive statements and team morale.
3. **The Reintegrating Alumni**: Successfully transitioned to a new employer, sharing hiring opportunities, mentoring former colleagues, and celebrating job offers.
4. **The Tech/Corporate Job Seeker**: Looking for authentic intelligence on hiring teams, layoff trends, and unvarnished workplace culture.

### Core Value Proposition
> *"Speak truth about corporate restructuring without destroying your career; celebrate recovery without corporate vanity."*

---

## 2. Product Strengths (What Works Well)

1. **Rock-Solid Backend Privacy Pipeline**:
   - As proven by `server/scripts/privacyCheck.js`, the server strictly sanitizes Innie transmissions. When `isInnie: true`, `author` is completely stripped from public JSON delivery (`sanitizePostPublic` in `server/routes/posts.js#L33-L74`).
   - Private user handles (`Innie-XXXX`) are generated once at registration and never tied back to the real username in any public endpoint.
   - Author IDs are never leaked through search (`server/routes/search.js`), comments (`server/routes/comments.js`), or profile stats (`server/routes/users.js#L18-L25`).
2. **Anti-Doxxing Break Room Moderation Gate**:
   - `server/utils/checkPost.js` implements synchronous regex detection for email addresses and phone numbers. If detected, submissions are blocked and returned with `isBreakRoom: true`, redirecting the client to the `BreakRoom` modal without discarding user input.
3. **Atomic Voting and Version-Bump Cache Invalidation**:
   - `server/db/store.js` implements atomic vote toggling (`store.castVote()`) with delta score updates, completely eliminating race conditions.
   - Cache keys use floor versions (`cache.bumpFloorVersion()`), avoiding expensive Redis key flushes.
4. **Strong Cultural Homage**:
   - Severance terminology (*Outie, Innie, Sever, Severed Floor, Reintegrated, Waffle Party, Break Room*) provides an unforgettable emotional hook that resonates deeply with disillusioned white-collar workers.

---

## 3. Product Weaknesses & The Existential "Identity Crisis"

Despite its strengths, LinkedOut suffers from severe product drift and schizophrenia.

### Weakness 1: The Roleplay Game vs. Utility Tool Conflict
The application cannot decide whether it is a **serious utility for severed workers** or a **Lumon Industries alternate-reality roleplay game (ARG)**:
- In Outie mode, users see real companies: TechNova, MegaCorp, ByteForge, Apex Capital, and real layoffs.
- In Innie mode, the entire floors directory is swapped to fictional Lumon departments: *Macrodata Refinement, Optics and Design, Disposal and Reclamation, Testing Floor, Wellness Center* (`server/scripts/seed.js#L65-L70`).
- Fictional descriptions state: *"Binning numbers into the four tempers: Woe, Frolic, Dread, and Malice."*
- **Impact**: Real workers looking for advice on a Google or Meta layoff cannot use Innie mode to talk about real companies because the app forces them into a fictional TV show department! Real utility is sacrificed for cosmetic roleplay.

### Weakness 2: Complete Lockout of Unauthenticated Users
- In `client/src/App.jsx#L50-L78`, any unauthenticated visitor is unconditionally redirected to `/login`.
- A link shared on Twitter, Reddit, or Slack (e.g. `https://linkedout.com/severed-floor` or `https://linkedout.com/post/xyz`) bounces directly to a login form with no preview, no explanation, and no redirect memory.
- **Impact**: Zero viral loop, zero organic search indexing, and total friction for users who just want to see the layoff numbers.

### Weakness 3: Dead / Abandoned Product Sections
- The **Comeback** feature (`client/src/pages/Comeback.jsx`) was disabled and replaced with a static "Coming soon" screen: *"This department is currently undergoing refinement. Please enjoy all other floors equally."*
- Even though the backend endpoints (`/api/jobs`), models (`Job.js`), and frontend components (`JobCard.jsx`, `WaffleParty.jsx`) are already built!
- **Impact**: The app becomes 100% negative and depressing. There is no "recovery" loop visible to users.

### Weakness 4: Invisible Admin Tools
- The Admin Review Queue (`client/src/pages/ReviewQueue.jsx`) is implemented and secured by `user.isAdmin` in `App.jsx#L66`, but there is **no link, button, or menu item** to access `/review` anywhere in `TopBar.jsx`, `LeftNav.jsx`, or the user dropdown! An admin must guess the URL and manually type it into the browser.

---

## 4. Comprehensive Feature Inventory & Classification

Every feature in the repository is evaluated and classified according to the audit rubric:

| Feature / Area | Implementation State | Evidence in Code | Classification | Strategic Rationale |
| :--- | :--- | :--- | :--- | :--- |
| **Home Feed (Center Feed)** | Implemented | `client/src/pages/Home.jsx`, `server/routes/posts.js` | **KEEP & IMPROVE** | Core retention loop. Needs better layout width, tab structure, and elimination of root `text-xs`. |
| **Post Creation (Vent / Question / Hired)** | Implemented | `client/src/components/PostComposer.jsx`, `server/routes/posts.js` | **KEEP & IMPROVE** | Core creation flow. Expanding composer has awkward click states and forces full page reload on modal submit (`AppShell.jsx#L81`). |
| **Innie Mode Anonymous Posting** | Implemented | `server/routes/posts.js#L255-L300`, `ModeContext.jsx` | **KEEP & IMPROVE** | Primary product differentiator. Must be preserved, but separated from fictional TV roleplay. |
| **Comments & 1-Level Threading** | Implemented | `client/src/components/CommentItem.jsx`, `server/routes/comments.js` | **KEEP & IMPROVE** | Discussion foundation. 1-level reply constraint is effective; needs better composer inline styling. |
| **Atomic Post & Comment Voting** | Implemented | `server/db/store.js#castVote`, `PostCard.jsx#L163-L193` | **KEEP & SIMPLIFY** | Robust backend logic, but frontend duplicates SVG arrow markup in 3 different files instead of using `VoteButtons.jsx`. |
| **Floors (Company Communities)** | Implemented | `client/src/pages/Floors.jsx`, `server/routes/floors.js` | **KEEP & IMPROVE** | Critical community anchor. Needs category tabs, floor stats, and real company focus instead of fictional Lumon floors in Innie mode. |
| **Floor Detail Page** | Partially Broken | `client/src/pages/FloorPage.jsx` | **IMPROVE & FIX** | Contains severe 4-column layout collision (renders an inner 280px sidebar right next to AppShell's 260px RightRail). |
| **Severed Floor (Layoff Tracker)** | Implemented | `client/src/pages/SeveredFloor.jsx`, `LayoffRow.jsx`, `server/routes/layoffs.js` | **KEEP & IMPROVE** | Highest organic traffic driver. Sparkline is clean. Needs export, company floor cross-linking, and date filtering. |
| **Layoff Report Confirmation** | Implemented | `LayoffRow.jsx#L43-L51`, `server/routes/layoffs.js#confirm` | **KEEP & IMPROVE** | Crowd-sourced verification mechanism builds trust. Needs minimum threshold indicator (e.g. "Verified at 5 confirms"). |
| **Comeback (Jobs & Recovery)** | Disabled / Mocked | `client/src/pages/Comeback.jsx#L19-L35`, `JobCard.jsx` | **IMPROVE & RE-ENABLE**| Currently hidden behind "Coming soon" screen. Must be restored to provide hope and balance the platform's emotional tone. |
| **Waffle Party Reintegration** | Implemented | `client/src/components/WaffleParty.jsx` | **KEEP & SIMPLIFY** | Delightful homage when someone gets hired. Keep as a 2-second celebration modal. |
| **Break Room Moderation Modal** | Implemented | `client/src/components/BreakRoom.jsx`, `server/utils/checkPost.js` | **KEEP & IMPROVE** | Effective privacy guardian. Keep and expand to catch employer NDA identifiers. |
| **Personnel Profile Card** | Implemented | `client/src/pages/Profile.jsx`, `server/routes/users.js` | **KEEP & IMPROVE** | Outie dossier is strong. Innie mode profile is completely broken (displays empty name due to stripped `innieHandle`). |
| **Dedicated Edit Profile Page** | Dead Code | `client/src/pages/EditProfile.jsx` | **MERGE / ACTIVATE** | A 239-line dedicated edit page exists but `App.jsx#L62` routes `/profile/edit` to `<Profile />` instead. |
| **Saved Transmissions (Bookmarks)** | Implemented | `client/src/pages/Saved.jsx`, `server/routes/me.js` | **KEEP** | Standard utility; clean and functional. |
| **TopBar Search & Autocomplete** | Implemented | `client/src/components/TopBar.jsx#L108-L161` | **IMPROVE** | Keyboard navigable, debounced. Flaw: completely hidden on mobile (`hidden sm:block`) with no fallback. |
| **Community Handbook** | Implemented | `client/src/pages/Handbook.jsx` | **KEEP & SIMPLIFY** | Good rules ("free words, not free targets"). Needs prominent placement. |
| **Wellness Session** | Implemented | `client/src/pages/Wellness.jsx` | **KEEP & SIMPLIFY** | Candle animation and external hotlines (988 Lifeline). Good emotional touch. |
| **Admin Review Queue** | Implemented | `client/src/pages/ReviewQueue.jsx`, `server/routes/admin.js` | **KEEP & IMPROVE** | Works well, but currently orphaned with zero navigation entry points. |
| **System Guide Modal** | Dead Code | `client/src/components/SystemGuideModal.jsx` (19 KB) | **REMOVE** | 19KB file never imported anywhere in the codebase. Pure bloat. |
| **Legacy Navbars / Sidebars** | Dead Code | `client/src/components/Navbar.jsx`, `Sidebar.jsx`, `RightSidebar.jsx` | **REMOVE** | Abandoned remnants from Step 3, superseded by `TopBar`, `LeftNav`, and `RightRail`. |
| **FloorsRow Strip** | Dead Code | `client/src/components/FloorsRow.jsx` | **REMOVE or ACTIVATE** | Instagram-style stories row built in Step 12c, but never imported in `Home.jsx`. |
| **Edge Texture** | Dead Code | `client/src/components/EdgeTexture.jsx` | **REMOVE** | Macrodata grid overlay never imported in `AppShell.jsx`. |
| **Refinement Game (Macrodata)** | Spec Only | `docs/design.md#L138`, `docs/progress.md#L32` | **FUTURE / DEFER** | Gamified crowd-checking is an overcomplication before core product stability. |
| **Rooms (Live Group Chat)** | Spec Only | `docs/progress.md#L31` | **FUTURE / DEFER** | Socket.io real-time chat adds massive operational surface area. Defer. |
| **Stories (Instagram Slides)** | Spec Only | `docs/progress.md#L33` | **REMOVE / DO NOT BUILD**| Fleeting 24-hour social stories contradict corporate accountability and permanent layoff ledgers. |

---

## 5. Product Gaps & Feature Bloat

### Concrete Gaps
1. **Public Read-Only Access**: Potential users and researchers cannot view the Severed Floor layoff ledger or read public posts without registering. This kills referral growth.
2. **Floor Navigation from Layoff Entries**: `LayoffRow.jsx` has a company name, but doesn't deep-link to the corresponding company floor if it exists.
3. **No Cross-Mode Privacy Guardrails**: A user can toggle to Innie mode and reply to an Outie post without a single confirmation modal or warning prompt explaining that their reply will be pseudonymous.
4. **Mobile Search**: Users on viewports $<640px$ have no search bar or search modal anywhere.

### Feature Bloat to Eliminate
1. **Fictional Lumon Roleplay Floors**: The 5 Innie department floors (`macrodata-refinement`, `optics-and-design`, etc.) confuse real users. Replace with real-world anonymous industry floors.
2. **Orphaned Dead Components**: 6 unused component files totaling over 35KB of dead code (`Navbar.jsx`, `Sidebar.jsx`, `RightSidebar.jsx`, `VoteButtons.jsx`, `EdgeTexture.jsx`, `SystemGuideModal.jsx`).
3. **Redundant Profile Editing**: Both `Profile.jsx` (inline form) and `EditProfile.jsx` (dedicated page) implement identical profile editing logic.

---

## 6. Recommended Product Boundaries

To recover LinkedOut as a production-grade platform, its scope must be strictly bounded:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        LINKEDOUT CORE PRODUCT BOUNDARY                 │
├──────────────────────────────────┬─────────────────────────────────────┤
│       IN SCOPE (PHASE 1-2)       │       OUT OF SCOPE (DEFERRED)       │
├──────────────────────────────────┼─────────────────────────────────────┤
│ • Public Read-Only Feed & Ledger │ • Real-Time Socket.io Chat (Rooms) │
│ • Dual-Mode Outie/Innie Feed     │ • Gamified Refinement Mini-Games    │
│ • Real Company Communities       │ • Ephemeral 24h Stories             │
│ • Verified Layoff Tracker        │ • Direct Messaging / Private Inboxes│
│ • Comeback / Verified Job Board  │ • Video / Audio Media Hosting       │
│ • Anti-Doxxing Break Room Intercept│ • Native Mobile Apps (React Native│
│ • Dossier Profile (Outie Only)   │ • Crypto / Web3 Token Features      │
└──────────────────────────────────┴─────────────────────────────────────┘
```
