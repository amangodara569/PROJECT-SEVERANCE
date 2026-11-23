# DESIGN SYSTEM & VISUAL IDENTITY AUDIT
**Audit Version:** 1.0.0  
**Date:** November 23, 2026  
**Auditor Roles:** Design Systems Engineer, Senior Product Designer, Senior Frontend Architect  
**Scope:** CSS Architecture (`client/src/index.css`), Tailwind v4 setup, UI component library (`@/components/ui/`), typography scales, color contrast, and design tokens.

---

## 1. Current Design System Architecture

LinkedOut utilizes **Tailwind CSS v4** (`@tailwindcss/vite ^4.3.3`) with design tokens defined via CSS custom properties on `:root` and `:root.innie` in `client/src/index.css`.

### 1.1 The Color System

```css
/* Outie Tokens (Dark Corporate Executive) */
:root {
  --bg: #181E27;          /* Dark navy-charcoal canvas */
  --surface: #1F2630;     /* Elevated panel surface */
  --hover: #262E3A;       /* Interactive hover state */
  --border: #313B49;      /* Subtle hairline borders */
  --text: #DCE2EA;        /* High-contrast off-white body text */
  --muted: #929EAD;       /* Secondary metadata text */
  --accent: #D6B27A;      /* Warm executive amber gold */
  --accent-ink: #1C1A14;  /* Deep charcoal text on amber buttons */
  --accent-soft: #2A2F36; /* Muted pill & badge background */
  --radius: 10px;         /* Soft corporate corner radius */
  --radius-sm: 8px;       /* Control element radius */
}

/* Innie Tokens (Clinical Severed Floor) */
:root.innie, .innie {
  --bg: #E6EEEA;          /* Sterile fluorescent mint canvas */
  --surface: #F1F6F3;     /* Pale clinical card surface */
  --hover: #DCE6E1;       /* Cool mint hover state */
  --border: #CBD8D2;      /* Hairline surgical border */
  --text: #1B2A26;        /* Deep green-black text */
  --muted: #566761;       /* Muted sage secondary text */
  --accent: #2D6F63;      /* Surgical Lumon teal */
  --accent-ink: #F1F6F3;  /* Mint white text on teal buttons */
  --accent-soft: #D3E3DC; /* Light sage pill background */
  --radius: 2px;          /* Sharp brutalist corner radius */
  --radius-sm: 2px;       /* Control element radius */
}
```

### 1.2 Color Evaluation & Contrast Audits
1. **WCAG Compliance (Outie Mode)**:
   - Primary text (`#DCE2EA`) on Canvas (`#181E27`): **11.5:1** (AAA Pass).
   - Secondary text (`#929EAD`) on Canvas (`#181E27`): **5.6:1** (AA Pass).
   - Accent button (`#D6B27A`) with ink text (`#1C1A14`): **11.2:1** (AAA Pass).
2. **WCAG Compliance (Innie Mode)**:
   - Primary text (`#1B2A26`) on Mint Canvas (`#E6EEEA`): **12.2:1** (AAA Pass).
   - Secondary text (`#566761`) on Mint Canvas (`#E6EEEA`): **4.9:1** (AA Pass for large text, borderline for 11px meta).
   - Accent button (`#2D6F63`) with mint text (`#F1F6F3`): **5.2:1** (AA Pass).
3. **Hardcoded Color Bugs in Codebase**:
   - `SeverToggle.jsx#L15`: Hardcodes `bg-zinc-900 border-zinc-700` when `isInnie: true`. On a light mint header, this renders a jarring jet-black pill.
   - `SeverToggle.jsx#L20`: Uses `text-[var(--accent-fg,#000)]`. `--accent-fg` does NOT exist in `index.css`, defaulting to `#000` (black). Black text on teal `#2D6F63` has a contrast ratio of **3.9:1**, **FAILING WCAG AA**.
   - `Login.jsx` & `Register.jsx`: Hardcode `bg-[#0F141C]` and `bg-black/60`.
   - `PostCard.jsx#L247` & `CommentItem.jsx#L202`: Hardcode `text-red-400 hover:text-red-300` and `bg-red-600` instead of using semantic destruction tokens.

---

## 2. Typography Audit: The "Missing Class" Disaster

### 2.1 Font Declarations
The project imports IBM Plex fonts via `@fontsource/ibm-plex-sans` and `@fontsource/ibm-plex-mono` in `main.jsx`.
In `index.css`:
- Outie: Body, Head, and Meta are mapped to `IBM Plex Sans`.
- Innie: Head and Meta are mapped to `IBM Plex Mono`.

### 2.2 The Missing Utility Class Defect
In `index.css`, the developer declared CSS variables:
`--font-body`, `--font-head`, `--font-meta`, `--font-mono`.
And added a rule:
`h1, h2, h3, h4, h5, h6 { font-family: var(--font-head); }`

**THE CRITICAL DEFECT**:
Neither `.font-head` nor `.font-meta` was ever defined as a CSS class or added to Tailwind v4's `@theme` block!
Across dozens of components:
- `TopBar.jsx`: `<span className="... font-head">New post</span>`
- `Floors.jsx`: `<span className="... font-head">Create a floor</span>`
- `Profile.jsx`: `<span className="... font-meta">@username</span>`
- `PostCard.jsx`: `<div className="... font-meta">2h ago</div>`
- `SeveredFloor.jsx`: `<div className="... font-head">1,412</div>`

Because `.font-head` and `.font-meta` do not exist in any stylesheet, **the browser ignores them completely!** All headings in `span`, `div`, and `p` elements fall back to system default sans-serif, destroying the intended retro-futuristic monospace visual identity.

### 2.3 The Root `text-xs` Degradation
Almost every page in `client/src/pages/` sets `text-xs` (12px) on its top-level container:
- `Home.jsx#L77`: `className="... text-xs space-y-4"`
- `Floors.jsx#L96`: `className="... text-xs space-y-4"`
- `PostPage.jsx#L173`: `className="... text-xs space-y-4"`
- `SeveredFloor.jsx#L88`: `className="... text-xs"`
- `Profile.jsx#L114`: `className="... text-xs space-y-6"`

This creates an eye-straining, cramped UI where 12px is treated as standard body text, forcing timestamps and meta labels down to microscopic 10px and 11px sizes (`text-[10px]`, `text-[11px]`).

---

## 3. Layout & Component Geometry

### 3.1 Container Width Anarchy
There is zero layout consistency between pages inside `AppShell`'s center column:
- `Home.jsx`: `max-w-3xl` (768px)
- `Floors.jsx`: `max-w-3xl` (768px)
- `FloorPage.jsx`: `max-w-4xl` (896px)
- `PostPage.jsx`: `max-w-3xl` (768px)
- `SeveredFloor.jsx`: `max-w-3xl` (768px)
- `Comeback.jsx`: `max-w-2xl` (672px)
- `Profile.jsx`: `max-w-2xl` (672px)
- `Saved.jsx`: `max-w-2xl` (672px)
- `EditProfile.jsx`: `max-w-xl` (576px)
- `Handbook.jsx`: `max-w-[70ch]` (approx 560px)
- `Wellness.jsx`: `max-w-[70ch]` (approx 560px)

As a user navigates between Home, Profile, and Handbook, the center column unpredictably expands and contracts like an accordion.

### 3.2 Component Overuse & Duplication
1. **Cards**: Every element is a bordered box. The eye has nowhere to rest because feed cards, sidebar modules, form inputs, and checklists all use the exact same 1px border with no elevation layering.
2. **Buttons**:
   - `Button.jsx` implements `default`, `secondary`, `outline`, `ghost`, and `destructive`.
   - The design rule says: *"ONE filled accent button per screen. Others are outline or muted text."*
   - Yet on `Floors.jsx`, every single floor card renders a filled `variant="default"` button, creating 12 competing gold/teal CTA buttons on a single screen!
3. **Voting Arrows**:
   - `VoteButtons.jsx` was built in Step 5 as a unified component.
   - However, `PostCard.jsx#L163`, `PostPage.jsx#L217`, and `CommentItem.jsx#L150` all ignore `VoteButtons.jsx` and copy-paste 30 lines of raw SVG arrow code with inline state handling!

---

## 4. Visual Identity Assessment

Does LinkedOut have a recognizable visual identity?
- **Current State**: It feels like an unfinished developer prototype imitating Severance through color alone. It resembles neither a production corporate network nor an authentic retro terminal.
- **Why It Fails**:
  1. The door logo in the header lacks the brand wordmark "LINKED OUT".
  2. The typography is broken by the missing `.font-head` CSS definition.
  3. The base font size is too small (12px).
  4. The 3-column desktop shell has empty gutters and layout collisions.
  5. The Innie mode feels like an unstyled light-mode inversion rather than a deliberate, sterile architectural space.

---

## 5. Three Distinct Design Directions

We propose three comprehensive, production-grade design directions for LinkedOut.

---

### DIRECTION 1: "The Fluorescent Panopticon" (Clinical Retro-Futurism)
*A relentless, high-discipline tribute to the cold aesthetics of Lumon Industries and 1980s data terminals.*

- **Concept**: The app feels like a proprietary enterprise operating system (Lumon OS) running on high-end CRTs. Monospaced tabular data, sharp corners, sterile lighting, and hairline dividing rules.
- **Emotional Character**: Cold, bureaucratic, hypnotic, quietly menacing, ruthlessly organized.
- **Color Palette**:
  - Outie (Executive Floor): Slate Navy (`#111620`), Panel Surface (`#171F2C`), Accent Amber (`#E5B869`), Hairline Border (`#263346`).
  - Innie (Severed Floor): Fluorescent Sage (`#E2EBE6`), Sterile White Surface (`#EDF4F0`), Surgical Teal (`#1F6B5E`), Sharp Border (`#B8CCC3`).
- **Typography**: `IBM Plex Mono` for all headings, labels, metrics, and timestamps. `IBM Plex Sans` for long body text.
- **Layout Philosophy**: Tight tabular density. Hairline table grids instead of floating cards. Zero shadows, zero blurs.
- **Outie/Innie Expression**:
  - Outie: Soft corporate radii (6px), executive warm glow, traditional profile dossiers.
  - Innie: Sharp brutalist corners (0px), monospace teletype, identity stripped to cryptographic badge stamps.
- **Strengths**: Uniquely memorable; 100% faithful to the cultural inspiration; zero resemblance to LinkedIn or generic SaaS.
- **Risks**: High density and monospaced typography can feel intimidating or unapproachable to non-technical users.

---

### DIRECTION 2: "The Executive Dossier" (Warm Corporate / Editorial Minimalist) — RECOMMENDED
*A mature, prestigious, Bloomberg-meets-Linear interface designed for professionals who demand clarity, dignity, and unvarnished truth.*

- **Concept**: Treats workplace discussions and layoff data as serious financial and career intelligence. Dossier-style layout, deliberate typography, and high-legibility cards.
- **Emotional Character**: Authoritative, trustworthy, calm, protective, sophisticated.
- **Color Palette**:
  - Outie (Upper Floors): Deep Obsidian Charcoal (`#12151A`), Surface Panel (`#1A1E26`), Border Tone (`#2B323F`), Primary Text (`#E6EBF2`), Muted Gray (`#8E9BAE`), Warm Executive Brass/Gold (`#C8A265`).
  - Innie (Severed Floor): Pale Mist Mint (`#EBF1EE`), Clean Clinical Surface (`#F4F8F6`), Border Tone (`#CCD9D2`), Primary Text (`#14211D`), Muted Forest (`#5A6F67`), Deep Surgical Spruce (`#235C50`).
- **Typography**:
  - Headings & Dossier Titles: High-clarity semi-bold sans (`IBM Plex Sans` or `Inter`, weights 600/700).
  - Data, Metrics, Severed Ledger, & Handles: Monospace (`IBM Plex Mono`).
  - Body Text: 15px with 1.6 line height for effortless long-form reading.
- **Layout Philosophy**: Structured 3-column editorial grid. Clear hierarchy: primary navigation rail (240px) $\rightarrow$ central reading stream (680px) $\rightarrow$ contextual intelligence rail (320px). Elimination of double asides.
- **Outie/Innie Expression**:
  - Outie: Distinguished professional profile dossier, verified company floor headers, warm amber indicators.
  - Innie: Anonymous transmission badges, pixel-glyph identity stamps, cool mist surfaces, no public profile, strict anonymity shield.
- **Strengths**: Perfectly balances corporate credibility with the Severance homage. Highly usable, production-grade, and trustworthy.
- **Risks**: Requires strict design token discipline to prevent drifting into generic dark SaaS.

---

### DIRECTION 3: "Ink & Paper Confidential" (Documentarian / Unvarnished Press)
*An unconventional, high-contrast, editorial investigative press aesthetic avoiding dark SaaS tropes entirely.*

- **Concept**: Looks like a leaked internal company memo, whistleblower investigative file, or unvarnished corporate press dispatch.
- **Emotional Character**: Urgent, journalistic, candid, unsparing, tangible.
- **Color Palette (Light-First Dual Mode)**:
  - Canvas: Newsprint Parchment (`#F7F5F0`).
  - Panels: Bright White Document Surface (`#FFFFFF`).
  - Ink Text: Heavy Carbon Black (`#111111`).
  - Muted Text: Typewriter Gray (`#555555`).
  - Accent: Investigative Redactor Red (`#C93B2B`) or Archival Copper (`#B35E34`).
  - Innie Inversion: Deep Blueprint Navy (`#16202C`) with Carbon White ink.
- **Typography**: Editorial Serif for headlines (`Newsreader` or `Merriweather`), coupled with raw typewriter monospace (`IBM Plex Mono`) for metadata and redactions.
- **Layout Philosophy**: Wide editorial broadsheet columns, classified file stamps, visible document borders, minimal padding.
- **Outie/Innie Expression**:
  - Outie: Official corporate letterhead and verified bylines.
  - Innie: Heavy redacted black bars, classified badge stamps, anonymous whistleblower handles.
- **Strengths**: Radically distinct; completely breaks free from the clichéd dark SaaS / neon aesthetic; gives transmissions serious investigative weight.
- **Risks**: Highly opinionated; some users may find the non-dark aesthetic jarring for extended night-time browsing.

---

## 6. Recommendation & Preliminary Design Principles

### Recommendation: Direction 2 ("The Executive Dossier")
We strongly recommend **Direction 2 ("The Executive Dossier")** as the primary foundation for LinkedOut, with selective typographic touches borrowed from Direction 1 (monospace ledger numbers and section tags).

### Core Design Principles for LinkedOut Recovery
1. **Dignity Over Playfulness**: Layoffs and workplace exploitation are traumatic life events. The interface must never feel like a toy, a meme app, or a video game.
2. **One Canvas, Two Lenses**: Outie and Innie must share the same physical geometry, navigation, and company structures. The switch alters identity, voice, and surface temperature—never the underlying world.
3. **Typography Drives Hierarchy**: Abolish root `text-xs`. Standardize on 15px body text. Reserve `IBM Plex Mono` for numbers, dates, handles, and system tags.
4. **Surface Restraint**: Stop wrapping every line in an identical bordered card. Use whitespace, subtle divider rules, and background contrast to group content.
5. **Radical Privacy Clarity**: The user must never doubt which identity they are projecting. Post composers and comment bars must state the active persona in unambiguous plain language.
