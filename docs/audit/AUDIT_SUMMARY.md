# LINKEDOUT — AUDIT EXECUTIVE SUMMARY
**For**: Founders & Product Leadership Team  
**From**: Principal UX Architect & Engineering Audit Lead  
**Date**: November 23, 2026  
**Status**: Phase 1 Audit Complete | Zero Application Code Modified

---

## 1. Honest Assessment of Current Product State

LinkedOut currently has a **robust, high-performance backend**, but a **fragmented, visually broken, and conceptually confused frontend**.

Under the hood, the engineering foundation is surprisingly solid:
- The custom in-memory store + MongoDB Atlas sync + dual-layer LRU/Redis caching is extremely fast.
- The atomic voting engine (`store.castVote()`) completely prevents race conditions.
- The anti-doxxing Break Room filter (`checkContent()`) reliably catches phone numbers and emails.
- All 7 automated end-to-end privacy checks pass (`privacyCheck.js`), proving that the backend strictly prevents Innie author de-anonymization.

**However, the user experience is suffering badly**:
- A catastrophic layout collision renders **four columns and duplicate sidebars** on community floor pages.
- The base font across almost all pages was set to microscopic **12px (`text-xs`)**, causing severe eye strain.
- Crucial CSS utility classes (`.font-head`, `.font-meta`) do not exist in the stylesheets, breaking the retro-futuristic monospace identity.
- The **Comeback** feature (jobs and recovery) was disabled and replaced with a dead "Coming soon" placeholder.
- **Unauthenticated visitors are 100% locked out**, meaning a layoff tracker link shared on Twitter, Reddit, or LinkedIn bounces to a blank login box, killing viral growth.
- Most critically, the product is trapped in an identity crisis: half the app is a serious tool for laid-off tech workers, while the other half is an ARG roleplay game about TV show characters sorting numbers into "Woe, Frolic, Dread, and Malice."

We must stop applying random UI patches. We need a disciplined, phased recovery.

---

## 2. The Five Biggest Problems

1. **The Floor Detail 4-Column Layout Collision (`FloorPage.jsx`)**:
   - `FloorPage` nests an inner 280px sidebar inside an `AppShell` that already renders a 260px `RightRail`. On desktop, users see four columns and two competing "About this floor" boxes side-by-side.
2. **Total Public Lockout (`App.jsx#L50-L78`)**:
   - The entire platform is gated behind login. Visitors cannot view the Severed Floor layoff ledger, preview company discussions, or read the handbook without registering first.
3. **The Blank Identity Bug on Innie Profiles (`Profile.jsx#L109`)**:
   - `Profile.jsx` attempts to display `profile.innieHandle`, but the backend deliberately strips it from public payloads for privacy. In Innie mode, viewing another user's profile renders an empty `<h1>` title.
4. **Desktop-First Mobile Breakage & Missing Search (`TopBar.jsx#L108`)**:
   - Search is flagged `hidden sm:block` and completely vanishes on mobile devices ($<640px$) with no fallback button or drawer.
5. **Base Font Degradation & Broken Typography Tokens (`index.css`)**:
   - Setting `text-xs` on page roots makes the whole app look cramped and illegible. Furthermore, `.font-head` and `.font-meta` were never declared in CSS or Tailwind `@theme`, so all headings fallback to generic system fonts.

---

## 3. The Five Highest-Impact Decisions

1. **Unify the World: Adopt "Unified Community, Dual Identity" (Approach 2)**:
   - Eliminate fictional TV roleplay floors (*Macrodata Refinement*). Keep real company floors (`#technova`, `#megacorp`, `#google`) visible in both modes.
   - Outie mode is for public career identity, mentorship, and job posting. Innie mode is for unvarnished workplace whistleblowing, severance sharing, and raw critique within those exact same companies.
2. **Unlock Public Read-Only Access**:
   - Allow unauthenticated guests to read the Severed Floor layoff ledger, explore public floors, and view transmissions with a persistent "Sign in to contribute" callout. This creates an immediate viral sharing loop.
3. **Enforce Base 15px Body Typography & Fix Tailwind v4 `@theme`**:
   - Standardize base body text to 15px (`text-sm`), reserve `text-xs` strictly for timestamps and metadata, and properly declare `--font-head` and `--font-meta` in `@theme`.
4. **Rebuild `AppShell.jsx` to a Strict 3-Column Standard**:
   - Enforce fixed widths: Left Navigation (240px) + Center Stream (680px) + Right Intelligence Rail (320px). Remove all inner sidebars in `FloorPage.jsx`.
5. **Re-Enable the Comeback Engine (`Comeback.jsx`)**:
   - Delete the "Coming soon" placeholder. Reactivate the JobCard directory, filter chips, and the celebrated "Waffle Party" reintegration flow so the platform offers hope alongside critique.

---

## 4. What We Should STOP Doing

- **STOP adding new features** (e.g. Socket.io group chat rooms, Instagram-style stories, gamified number-binning mini-games).
- **STOP hardcoding colors** in components (`bg-zinc-900`, `text-red-400`, `bg-[#0F141C]`); use design system semantic tokens exclusively.
- **STOP applying `text-xs` to page root containers**.
- **STOP calling `window.location.reload()`** on post creation in a React single-page app.
- **STOP accumulating dead code files**; purge the 30KB+ of legacy components immediately.
- **STOP treating Innie mode as an ARG game** instead of a serious anonymous whistleblowing tool.

---

## 5. What We Should START Doing

- **START using Page Templates**: Every central page must fit into the exact same 680px content container without accordion width jumps.
- **START using Component Primitives**: Force all views to import `@/components/ui/button`, `@/components/ui/input`, and `<VoteButtons />` instead of copy-pasting raw markup.
- **START enforcing Cross-Mode Identity Warnings**: Warn Outie users before they accidentally publish their real name and username on an anonymous Innie thread.
- **START designing Mobile-First**: Provide mobile search triggers, prevent comment tree crushing, and test on 390px viewports before shipping.

---

## 6. Recommended Direction: "The Executive Dossier"

We recommend **Direction 2 ("The Executive Dossier")** detailed in `docs/audit/DESIGN_SYSTEM_AUDIT.md`:
- **Character**: Authoritative, calm, prestigious, protective, and deeply trustworthy (Bloomberg terminal meets Linear).
- **Outie Mode**: Deep obsidian charcoal surfaces, warm executive brass/gold accents, 10px soft radii, professional dossier cards.
- **Innie Mode**: Pale mist mint surfaces, surgical spruce teal accents, sharp 2px brutalist corners, teletype monospace data stamps.
- **Tone**: Unvarnished corporate truth without becoming a cartoonish TV meme.

---

## 7. Exact Next Step After the Audit

**DO NOT START CODING YET.**

The exact next step is:
1. **Convene a Founder / Product Alignment Meeting** to review the 8 audit deliverables inside `docs/audit/`.
2. **Formally approve the 5 High-Impact Decisions** (specifically adopting Approach 2 for Outie/Innie and replacing fictional floors with real corporate channels).
3. **Approve Phase A (Product Clarity) and Phase B (Design System Tokens)** in `docs/audit/RECOVERY_ROADMAP.md` as the immediate implementation targets.

*All 8 comprehensive audit deliverables have been compiled inside `docs/audit/`.*
