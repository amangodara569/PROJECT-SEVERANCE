# OUTIE / INNIE SYSTEM STRATEGY
**Audit Version:** 1.0.0  
**Date:** November 23, 2026  
**Auditor Roles:** Senior Product Designer, Principal UX Architect, Product Manager  
**Status:** Core Architectural Strategy Document

---

## 1. Assessment of Existing Implementation

The Outie/Innie concept is LinkedOut's most innovative feature, yet its current execution is tangled and conceptually contradictory.

### How It Currently Works in Code
1. **Mode Switching**: Managed globally in `client/src/context/ModeContext.jsx`. The mode (`'outie'` or `'innie'`) is stored in `localStorage.getItem('mode')` and toggles `.innie` and `.dark` classes on `document.documentElement`.
2. **Theme Transformation**:
   - Outie: Dark corporate navy (`#181E27`), charcoal panels (`#1F2630`), amber-gold accents (`#D6B27A`), rounded `10px` corners, gold door logo.
   - Innie: Sterile fluorescent mint-green (`#E6EEEA`), pale sage panels (`#F1F6F3`), surgical teal accents (`#2D6F63`), sharp `2px` corners, green door logo.
3. **Data Segregation**:
   - An Axios request interceptor (`api.js#L14`) attaches `X-Severance-Mode: outie | innie` to all outgoing HTTP requests.
   - The backend strictly filters feeds: `GET /api/posts` returns only `!p.isInnie` in Outie mode, and only `p.isInnie` in Innie mode.
   - The backend strictly filters floors: `GET /api/floors` returns 12 real corporate floors in Outie mode, and 5 fictional Lumon department floors in Innie mode.
   - Bookmarks (`/api/me/saved`) and search (`/api/search`) are filtered by the active mode header.
4. **Author Protection**:
   - When submitting a post in Innie mode, `author: req.user.id` is stored in the database for moderation and deletion rights, but is strictly stripped from all public API responses.
   - The public JSON payload returns `isInnie: true`, `innieHandle: "Innie-XXXX"`, and `author: null`.

---

## 2. The Core Problems with Current Implementation

### Problem 1: The Fictional ARG vs. Real-World Utility Dilemma
- In Outie mode, users are in the real world: TechNova, MegaCorp, layoffs, job searches, resumes.
- When they toggle to Innie mode, the product abruptly shifts into a fictional television show roleplay game: the company directory disappears and is replaced by *Macrodata Refinement, Optics and Design, Disposal and Reclamation*.
- **The Failure**: A severed Google or Amazon employee who wants to anonymously post about a toxic VP or illegal severance clawback cannot use Innie mode to talk to fellow Google/Amazon employees, because those company floors do not exist in Innie mode! The fictional homage has suffocated the real utility.

### Problem 2: Identity Leaks & Cross-Mode Confusion
- A user browsing in Outie mode can navigate to an Innie post (via direct URL or search) and leave a comment.
- If they do, `handleCreateComment` sends `isInnie: false`, posting their **real legal name and username (`@username`) on an anonymous thread** with zero warning!
- Conversely, an Innie user commenting on an Outie post posts anonymously with zero visual explanation that their persona differs from the thread's context.

### Problem 3: The "Innie Profile" Logical Impossibility
- In `Profile.jsx#L109-L111`, the profile page attempts to display `profile.innieHandle`.
- But `GET /api/users/:username` deliberately omits `innieHandle` to prevent de-anonymization!
- As a result, viewing any user's profile while in Innie mode results in an empty `<h1>` header and broken layout.
- Moreover, **why does a profile even exist in Innie mode?** An anonymous workplace persona should never have a public profile dossier, employment badges, or a resume.

### Problem 4: Fragmented Mental Model
- Currently, toggling the Sever switch feels like being dropped into a completely different website with different posts, different floors, and different rules, rather than switching personal context within the same workplace ecosystem.

---

## 3. Three Alternative Differentiation Strategies

To resolve this identity crisis, we evaluated three distinct architectural approaches:

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                    OUTIE / INNIE DIFFERENTIATION MODELS                         │
├───────────────────────┬─────────────────────────┬───────────────────────────────┤
│ APPROACH 1:           │ APPROACH 2:             │ APPROACH 3:                   │
│ TWO WALLED WORLDS     │ UNIFIED TOPIC,          │ CONTEXTUAL MASK               │
│ (Current Evolution)   │ DUAL IDENTITY (Rec.)    │ (Per-Post Anonymous Flag)     │
├───────────────────────┼─────────────────────────┼───────────────────────────────┤
│ Completely isolated   │ Shared workplace spaces │ Single uniform feed.          │
│ feeds, floors, and    │ & floors; mode changes  │ Every post has a checkbox:    │
│ tools. Outie is       │ user voice, creation,   │ "[ ] Post anonymously".       │
│ career network;       │ and persona perspective.│ Mode toggle is just a filter  │
│ Innie is severed floor│                         │ or visual theme switcher.     │
└───────────────────────┴─────────────────────────┴───────────────────────────────┘
```

### Approach 1: Two Walled Worlds (Strict Segregation)
- **Concept**: Outie and Innie are two distinct, non-overlapping platforms inside one shell.
  - Outie = Public professional network (jobs, verified layoffs, named career advice, networking).
  - Innie = The Underworld (unfiltered salary transparency, whistleblower leaks, severance negotiations, internal politics).
- **Strengths**: Maximum privacy boundary; zero risk of accidental identity leakage.
- **Weaknesses**: Fragments community liquidity; requires doubling all features; causes user disorientation when content disappears upon toggle.

### Approach 2: Unified Community, Dual Identity (RECOMMENDED)
- **Concept**: The platform has **one shared corporate reality**, but the user navigates it through **two distinct emotional and identity lenses**:
  - **Shared Reality**: Company floors (e.g. `#google`, `#meta`, `#technova`), layoff data, and job boards exist universally. An employee can browse the `#technova` floor in both modes.
  - **The Outie Lens (The Public Professional)**:
    - Voice: Mentorship, career updates, job postings, constructive industry critique.
    - Persona: Legal name, `@username`, job title, employment status, public post dossier.
    - UI: Charcoal/Navy, warm amber gold accents, 10px rounded corners, structured dossier cards.
  - **The Innie Lens (The Severed Insider)**:
    - Voice: Raw unvarnished truth, severance terms, toxic manager warnings, whistleblower advice, collective bargaining, unfiltered anger.
    - Persona: Pseudonymous cryptographic identifier (`Innie-4821`), 5x5 pixel glyph avatar, NO public profile, NO resume, NO tenure badges.
    - UI: Sterile fluorescent mint-white, sharp 2px brutalist corners, surgical teal accents, teletype monospace metadata.
- **Strengths**: Keeps community discussions in one place while giving users the exact psychological safety needed to speak honestly. Eliminates the fictional roleplay barrier.
- **Weaknesses**: Requires clear inline visual markers to show which identity authored each transmission.

### Approach 3: Contextual Mask (Per-Post Anonymity Flag)
- **Concept**: LinkedOut operates as a single feed (like Reddit or Blind). Users simply check a box "[ ] Post as Innie" when composing. The SeverToggle merely filters between "Show All", "Outie Only", or "Innie Only".
- **Strengths**: Simplest backend and UI; familiar pattern from traditional forums.
- **Weaknesses**: Destroys the unique *Severance* psychological duality; reduces a groundbreaking concept to a boring "anonymous checkbox".

---

## 4. Deep Dive: The Recommended Architecture (Approach 2)

### 4.1 What Outie Fundamentally Represents
- **The External Career Identity**: The person who has to interview, maintain professional relationships, and protect their public reputation.
- **Tone**: Measured, constructive, supportive, forward-looking.
- **Core Activities**: Networking, congratulating newly reintegrated peers, posting verified job openings, mentoring laid-off colleagues, building professional credibility.

### 4.2 What Innie Fundamentally Represents
- **The Internal Workplace Subconscious**: The worker who endured restructuring, watched colleagues get locked out of Slack with 5 minutes notice, and knows what actually happens behind closed executive doors.
- **Tone**: Unvarnished, direct, skeptical, darkly humorous, legally cautious.
- **Core Activities**: Sharing exact severance package formulas, warning candidates away from toxic teams, organizing peer support, exposing restructuring lies, unburdening emotional trauma.

---

## 5. Experience Matrix: Shared vs. Mode-Specific

| Feature / Screen | Outie Mode Experience | Innie Mode Experience | Shared / Segregation Rules |
| :--- | :--- | :--- | :--- |
| **Home Feed** | Posts tagged with Outie voice (career insights, advice, hired posts, official news). | Posts tagged with Innie voice (severance leaks, culture exposés, vents, raw warnings). | Feeds can be toggled via tab: `[All Transmissions]` or `[Severed Floor Only]`. |
| **Company Floors** | Real company floors (`#technova`, `#megacorp`). View official announcements and alumni. | **Same real company floors!** But shows severed backchannel threads and salary disclosures. | **Floors are shared**, but content can be filtered by voice. Fictional Lumon floors eliminated. |
| **Severed Floor (Layoffs)**| View ledger, read news sources, confirm reports as verified professional. | View ledger, add anonymous insider confirmations ("Can confirm, HR notified us at 9am"). | 100% Shared Data. Different commenting voices. |
| **Comeback (Jobs)** | Browse jobs, post jobs for your company, celebrate "I got hired" with Waffle Party. | Read-only job browsing. Innies do not post jobs or claim reintegration. | Jobs are Outie-owned; Innies can view. |
| **Personnel Profile** | Full employee dossier: Name, @username, photo, headline, bio, status, public posts. | **DISABLED / PRIVATE DASHBOARD**: Replaced by private "Severance Status" panel (own Innie posts, private bookmark count). | **Innies do not have public profiles.** Other users cannot view an Innie's dossier. |
| **Post Creation** | Header: `Posting as @username (Public Identity)`. Button: Amber gold. | Header: `Posting as Innie-4821 (Severed Persona)`. Button: Surgical teal. | Header explicitly confirms persona before submission. |
| **Comments** | Real identity attached. Ideal for offering help or job referrals. | Anonymized handle attached. Ideal for corroborating insider claims. | **Cross-Mode Warning**: If commenting on Innie post while Outie, UI prompts confirmation! |

---

## 6. Mode Switching UX & Visual Transitions

1. **The Sever Switch (`SeverToggle`)**:
   - Must be prominently situated in the fixed `TopBar`.
   - On click, trigger a subtle, high-performance 250ms CSS transition across CSS variables.
   - Accompany the switch with a subtle, non-intrusive notification banner:
     - Outie $\rightarrow$ Innie: *"Elevator descending to Severed Floor. You are now speaking as Innie-XXXX. Real identity stripped."*
     - Innie $\rightarrow$ Outie: *"Elevator ascending to Upper Floors. You are now speaking as @username."*
2. **Visual Consistency Anchor**:
   - The structural geometry (TopBar, LeftNav, 3-column grid, card borders) must **remain identical** so the user feels they are in the same building.
   - The emotional tone transforms through:
     - Surface luminance (dark charcoal $\leftrightarrow$ clinical fluorescent mint).
     - Corner radius (soft corporate `10px` $\leftrightarrow$ surgical brutalist `2px`).
     - Brand mark (gold isometric door $\leftrightarrow$ green isometric door).
     - Typography accents (clean sans $\leftrightarrow$ raw teletype mono headers).

---

## 7. Concrete Identity & Privacy Rules

1. **Rule of One-Way Cryptographic Derivation**:
   - An `innieHandle` is generated once at user creation using CSPRNG (`server/utils/innie.js`).
   - The database stores `post.author = userId` exclusively for row-level permissions (allowing the user to edit or delete their own transmission).
   - The public JSON serialization pipeline (`sanitizePostPublic`) **must never, under any circumstance, serialize `author` when `isInnie: true`**.
2. **Elimination of the Innie Profile**:
   - Navigating to `/u/Innie-XXXX` must return a 404 or a standardized screen: *"This personnel file is sealed under Severance Protocol."*
   - Clicking an `Innie-XXXX` handle in the feed never opens a profile; it filters the feed to show that anonymous handle's contributions within that floor.
3. **The Cross-Mode Warning Modal**:
   - If an Outie user types a comment on an Innie thread, clicking "Comment" triggers a modal:
     > *"Identity Boundary Warning: You are currently in OUTIE mode. Submitting this comment will display your real identity (@username). Switch to Innie mode to remain anonymous."*
     > `[ Switch to Innie & Post ]` `[ Post as Outie ]` `[ Cancel ]`
4. **Anti-Doxxing Guard**:
   - The `checkContent` scanner in `server/utils/checkPost.js` must remain active on all submissions regardless of mode. Swearing is permitted; personal contact data and individual names are blocked.

---

## 8. Open Product Decisions for Founder Alignment

1. **Floor Unification**: Do the founders agree to replace fictional Lumon department floors (`macrodata-refinement`) with anonymous channels within real companies (`#google-severed`, `#technova-severed`)?
2. **Public Unauthenticated Access**: Do the founders approve unlocking read-only access for `/severed-floor` and public posts to maximize organic traffic and viral growth?
3. **Innie Feed Scope**: Should Innie mode show a blended feed of all anonymous posts across all companies, or should it restrict the default feed to companies the user has joined?
