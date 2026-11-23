# ROUTE & PAGE INVENTORY: LINKEDOUT (PROJECT-SEVERANCE)
**Audit Version:** 1.0.0  
**Date:** November 23, 2026  
**Auditor Roles:** Senior Frontend Architect, Principal UX Architect  
**Inspection Method:** Route-by-route source analysis (`client/src/App.jsx`, `pages/`, `components/`) and live runtime verification against Vite dev server at `http://localhost:5173`.

---

## 1. Master Route Map

The frontend routing is managed via `react-router-dom` in `client/src/App.jsx` using `React.lazy` code splitting and an `<AppLayout>` shell wrapper.

| Path | Element | Auth Required | Mode Dependent? | Layout Type | Current Status |
| :--- | :--- | :---: | :---: | :---: | :--- |
| `/login` | `<Login />` | No | Forces Outie | Full-Screen Centered Card | Functional |
| `/register` | `<Register />` | No | Forces Outie | Full-Screen Centered Card | Functional |
| `/` | `<Home />` | **Yes** | **Yes (Segregated)** | 3-Column Shell (AppShell) | Functional with layout bugs |
| `/floors` | `<Floors />` | **Yes** | **Yes (Segregated)** | 3-Column Shell (AppShell) | Functional |
| `/floors/:slug` | `<FloorPage />` | **Yes** | No | 3-Column Shell + Inner Sidebar | **Severe 4-Column Collision** |
| `/post/:id` | `<PostPage />` | **Yes** | Yes (Commenter) | 3-Column Shell (AppShell) | Functional |
| `/posts/:id` | `<PostPage />` | **Yes** | Yes (Commenter) | 3-Column Shell (AppShell) | Alias of `/post/:id` |
| `/severed-floor` | `<SeveredFloor />` | **Yes** | No | 3-Column Shell (AppShell) | Functional |
| `/comeback` | `<Comeback />` | **Yes** | No | 3-Column Shell (AppShell) | **Disabled (Coming Soon)** |
| `/saved` | `<Saved />` | **Yes** | **Yes (Segregated)** | 3-Column Shell (AppShell) | Functional |
| `/profile` | `<Profile />` | **Yes** | **Yes (Broken in Innie)**| 3-Column Shell (AppShell) | Buggy Innie Display |
| `/profile/edit` | `<Profile />` | **Yes** | No | 3-Column Shell (AppShell) | **Route Bug (Wrong Component)**|
| `/u/:username` | `<Profile />` | **Yes** | **Yes (Broken in Innie)**| 3-Column Shell (AppShell) | Buggy Innie Display |
| `/handbook` | `<Handbook />` | **Yes** | No | 3-Column Shell (AppShell) | Functional |
| `/wellness` | `<Wellness />` | **Yes** | No | 3-Column Shell (AppShell) | Functional |
| `/review` | `<ReviewQueue />` | **Yes (Admin)** | No | 3-Column Shell (AppShell) | Functional, Orphaned |
| `*` | `<NotFound />` | Yes/No | No | 3-Column Shell / Centered | Functional |

---

## 2. Route-by-Route Deep Inspection

### 2.1 `/login` (Sign In)
- **Purpose**: Authenticate existing employees with email and password.
- **Target User**: Returning users entering platform.
- **Main Action**: Primary button "Sign in". Secondary link "Register".
- **Layout**: Centered card over `/severance-poster.jpg` with dark backdrop blur.
- **Shared Components**: `LinkedOutLogo`, `Input`, `Button`.
- **Mode Behavior**: Explicitly forces Outie mode on mount (`useEffect(() => setMode('outie'))`).
- **Desktop (1440px)**: Well centered, high contrast, readable inputs.
- **Mobile (390px)**: Fits comfortably; `max-w-sm` scales down with `px-4`.
- **Identified Issues**:
  - Missing "Forgot password" or password recovery mechanism.
  - No redirect support: if a user was redirected here from a protected link, the original destination is discarded; `navigate('/')` is hardcoded (`Login.jsx#L30`).
  - Background image (`severance-poster.jpg`) is 1.2MB uncompressed, slowing initial load.

---

### 2.2 `/register` (Employee Onboarding)
- **Purpose**: Create a new account and auto-generate unique Innie handle (`Innie-XXXX`).
- **Target User**: New employees joining the network.
- **Main Action**: "Register" CTA.
- **Layout**: Centered card identical to `/login`.
- **Shared Components**: `LinkedOutLogo`, `Input`, `Button`.
- **Mode Behavior**: Forces Outie mode on mount.
- **Identified Issues**:
  - No client-side password strength validation; user can submit short or weak passwords.
  - Headline field is labeled "optional" but has no helper text explaining how it appears on posts.

---

### 2.3 `/` (Home Feed)
- **Purpose**: Main activity feed: transmissions stream, tabs, sorting, and onboarding.
- **Target User**: All authenticated employees.
- **Main Action**: Read posts, vote, click into discussions, or launch PostComposer.
- **Layout**: AppShell 3-column grid (`[260px_minmax(0,1fr)_260px]`).
- **Shared Components**: `TopBar`, `LeftNav`, `RightRail`, `PostCard`, `OnboardingCard`, `ErrorState`, `Button`.
- **Mode Behavior**:
  - **Outie**: Returns Outie posts (`author` visible, `innieHandle` null).
  - **Innie**: Returns Innie posts (`author` stripped, `innieHandle` shown).
- **Desktop (1440px)**:
  - Center column has plenty of space, but `Home.jsx#L77` constrains content to `max-w-3xl` (768px), creating awkward empty gutters between feed cards and the column divider.
- **Laptop (1280px)**: Proportions fit tightly, but RightRail feels crowded.
- **Mobile (390px)**: LeftNav and RightRail hidden. Bottom `MobileTabBar` visible. Search input in TopBar disappears completely!
- **Identified Issues**:
  - **Root `text-xs` problem**: `Home.jsx#L77` sets base text to `text-xs` (12px). Post titles and author lines appear microscopic on high-DPI desktop screens.
  - **Full page reload on post submit**: In `AppShell.jsx#L81`, post creation calls `window.location.reload()`, destroying SPA state and causing white-flash transitions.
  - **FloorsRow omitted**: `FloorsRow.jsx` (Instagram-style stories bar) was created in Step 12c but never imported or rendered in `Home.jsx`.

---

### 2.4 `/floors` (Company & Department Directory)
- **Purpose**: Browse, search, join, or create company communities.
- **Target User**: Employees seeking company-specific discussion floors.
- **Main Action**: "Join" floor, or "+ Create floor".
- **Layout**: AppShell 3-column grid; directory cards in center feed.
- **Shared Components**: `Input`, `Button`, `Search`, `Plus`.
- **Mode Behavior**:
  - **Outie**: Returns 12 real corporate floors (`technova`, `megacorp`, `byteforge`, etc.).
  - **Innie**: Returns 5 fictional Lumon department floors (`macrodata-refinement`, etc.).
- **Desktop (1440px)**: Single-column stack of cards inside `max-w-3xl`. Wastes horizontal space; would look much better as a 2-column card grid.
- **Mobile (390px)**: Cards stack neatly; Join buttons are accessible.
- **Identified Issues**:
  - `Floors.jsx#L101`: Back button hardcodes `window.history.length > 1 ? navigate(-1) : navigate('/')`.
  - Category filters are implemented in the backend (`/api/floors?category=Tech`) but `Floors.jsx` **has no category filter UI chips**! The filter is completely unreachable from the UI.
  - Modal form for creating a floor lacks field validation and character counters.

---

### 2.5 `/floors/:slug` (Floor Detail & Feed)
- **Purpose**: View transmissions, about information, and layoffs specific to a company floor.
- **Target User**: Members and alumni of that company.
- **Main Action**: Post within floor, join/leave floor, browse floor transmissions.
- **Layout**: **CRITICAL ARCHITECTURAL BUG: 4-COLUMN COLLISION.**
  - `AppShell.jsx` renders: LeftNav (260px) + Center Column + RightRail (260px).
  - Inside Center Column, `FloorPage.jsx#L93` renders: `<div className="grid grid-cols-1 md:grid-cols-[1fr_280px] gap-6">` with an inner 280px `<aside>`!
  - Result: On desktop, the screen renders **four columns**: LeftNav + Floor Feed + Floor Aside + AppShell RightRail!
  - Both asides render competing "About" cards right next to each other!
- **Identified Issues**:
  - Catastrophic desktop layout collision.
  - `RightRail` does not know what floor is active because `AppShell.jsx#L52` renders `<RightRail />` with no props.

---

### 2.6 `/post/:id` and `/posts/:id` (Transmission Discussion)
- **Purpose**: Read full post body, view upvote counts, and participate in threaded comments.
- **Target User**: Any employee reading or replying to a post.
- **Main Action**: Upvote, comment, reply to comment, bookmark, share link.
- **Layout**: AppShell 3-column grid; discussion tree in center column.
- **Shared Components**: `Avatar`, `CommentItem`, `Button`, `Textarea`.
- **Mode Behavior**:
  - Anyone can view the post, but if an Innie user comments, their comment is posted as Innie.
- **Identified Issues**:
  - **No warning when crossing modes**: If an Outie user views an anonymous Innie post and leaves a comment, their comment reveals their real `@username` without any warning or confirmation prompt!
  - Edit post and delete post modals use unstyled native `<input>` and `<textarea>` instead of standard UI primitives (`PostPage.jsx#L320-L331`).

---

### 2.7 `/severed-floor` (Workforce Reduction Ledger)
- **Purpose**: Comprehensive tracker of corporate layoffs, headcount reductions, and verification votes.
- **Target User**: Job seekers, affected personnel, industry analysts.
- **Main Action**: Add reduction report, confirm an existing report.
- **Layout**: AppShell 3-column grid; header with 42px stat and UTF-8 sparkline.
- **Shared Components**: `LayoffRow`, `Input`, `Button`, `Search`, `Plus`.
- **Mode Behavior**: Identical across Outie and Innie.
- **Desktop (1440px)**: 42px counter is bold and legible. Unicode sparkline (` ▂▃▄▅▆▇█`) renders cleanly without external chart library weight.
- **Mobile (390px)**: Layoff rows stack gracefully. Add Report modal works well.
- **Identified Issues**:
  - No date filtering chips (`7d | 30d | All`) as required by `docs/layout.md#L91`.
  - No sorting options (e.g. "Sort by headcount", "Sort by confirmed").
  - Layoff rows show company name, but do not link to the company's floor if one exists.

---

### 2.8 `/comeback` (Career Reintegration & Job Board)
- **Purpose**: Counteract the doom-and-gloom of layoffs by showcasing open jobs and celebrated job offers.
- **Target User**: Reintegrating workers, hiring managers, severed engineers seeking roles.
- **Main Action**: Apply to jobs, post a job, announce hiring ("I got hired").
- **Current State**: **DEFECTIVE / DISABLED**.
  - `Comeback.jsx#L19-L34` displays a mocked "Coming soon" placeholder card.
  - The actual feature was built in Step 9 (`Job.js`, `jobs.js`, `JobCard.jsx`, `WaffleParty.jsx`), but the page was gutted and abandoned.
- **Identified Issues**:
  - Completely nonfunctional placeholder in an otherwise active application.
  - Deprives the product of its positive emotional loop.

---

### 2.9 `/saved` (Bookmarked Transmissions)
- **Purpose**: Private repository of posts bookmarked by the user.
- **Target User**: Individual user reviewing saved content.
- **Main Action**: Review saved posts, remove bookmark.
- **Layout**: AppShell 3-column grid.
- **Mode Behavior**: Strictly filtered by active mode (`server/routes/me.js#L21-L22`).
- **Identified Issues**:
  - Filter by mode is confusing: If you save a post in Outie mode and toggle to Innie mode, your saved post disappears from `/saved` without explanation! A user believes their bookmark was lost.

---

### 2.10 `/profile` and `/u/:username` (Personnel Dossier)
- **Purpose**: Public profile showcasing identity, status, bio, and post history.
- **Target User**: Colleagues reviewing an employee's professional standing.
- **Main Action**: Edit profile (if owner), view non-anonymous post history.
- **Layout**: AppShell 3-column grid; profile card header with 4-stat bar.
- **Mode Behavior**:
  - **Outie**: Shows name, username, headline, status, bio, and Outie posts.
  - **Innie**: **CRITICAL BUG.** `Profile.jsx#L109-L111` attempts to render `profile.innieHandle`. But the backend `GET /api/users/:username` **never returns innieHandle** for privacy reasons!
  - Result: In Innie mode, the profile heading displays as blank/empty for other users!
- **Identified Issues**:
  - Innie mode concept makes no sense on a profile: Innies do not have public resumes, biographies, or career status badges.
  - Duplicate inline editing code exists in `Profile.jsx` while a separate `EditProfile.jsx` file sits unused.

---

### 2.11 `/profile/edit` (Profile Management)
- **Purpose**: Edit display name, username, avatar photo, headline, bio, and status.
- **Target User**: Current logged-in user.
- **Current State**: **ROUTING DEFECT**.
  - In `client/src/App.jsx#L62`:
    `<Route path="/profile/edit" element={<Profile />} />`
  - It renders `<Profile />`, NOT the dedicated `<EditProfile />` component!
  - `EditProfile.jsx` (239 lines) was imported on line 17 of `App.jsx`, but never linked in the router!

---

### 2.12 `/handbook` (Community Rules)
- **Purpose**: Document platform guidelines ("Free words, not free targets").
- **Layout**: Single column inside `max-w-[70ch]`.
- **Status**: Clean, legible, effective.
- **Identified Issues**: Lacks interactive table of contents specified in `docs/layout.md#L95`.

---

### 2.13 `/wellness` (Wellness Chamber)
- **Purpose**: Crisis support hotline directory and mental health reassurance.
- **Layout**: Single column inside `max-w-[70ch]` with animated ASCII candle.
- **Status**: Clean and functional.

---

### 2.14 `/review` (Admin Moderation Queue)
- **Purpose**: Review community-flagged posts and comments (auto-hidden at 5 reports).
- **Target User**: Admin users (`user.isAdmin === true`).
- **Main Action**: "Keep" (dismiss reports) or "Hide" (permanently remove).
- **Status**: Functional backend and UI, but **orphaned**: no link exists in TopBar or LeftNav.

---

## 3. Page Redundancy, Merge & Removal Matrix

| Page / Route | Diagnosis | Recommendation |
| :--- | :--- | :--- |
| `/comeback` | Gutted with "Coming soon" placeholder | **RESTORE**: Reinstate JobCard grid, filter chips, and hired post composer. |
| `/profile/edit` | Route points to `<Profile />` instead of `<EditProfile />` | **MERGE / FIX**: Either activate `<EditProfile />` or formalize inline modal inside `<Profile />`. |
| `/floors/:slug` | 4-column layout collision with duplicate Asides | **RESTRUCTURE**: Remove inner `<aside>` in `FloorPage.jsx`; pass floor context to `RightRail` instead. |
| `/review` | Hidden from all navigation | **INTEGRATE**: Add conditional "Review queue" link in TopBar user menu for admins. |
| Fictional Innie Floors | TV ARG roleplay clashes with real corporate forum | **REPLACE**: Swap fictional Lumon floors with anonymous corporate/industry channels. |
