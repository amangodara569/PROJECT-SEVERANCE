# layout.md — Layout v2: fill the screen (Step 12c)

This file replaces `interface.md` section 2 (Layout) and the page layouts in section 4 wherever they conflict. Theme, fonts, colors and component basics in `interface.md` stay.

## 1. Problem

Pages look empty: content is capped at 1100px and centered, the side columns hold only a few links, pages have few modules, cards are sparse, and empty states are blank.
Goal: every screen width feels full and alive, like Reddit, Instagram, X and LinkedIn: a left navigation with your communities, a rich center feed, a right rail of live modules, and wide pages built from cards and grids.

## 2. What we take from each app

| App | What we take |
|---|---|
| Reddit | Left "your communities" list, sort bar with time filter, vote rail on cards, pinned post, compact/comfortable density, "About" card, popular communities, wide search in the top bar |
| Instagram | Story-style row (our Floors row), slim icon rail on tablets, suggested accounts as suggested floors, profile header with stats |
| X | Composer at the top of the feed, "Trending today" rail |
| LinkedIn | Mini profile card, onboarding checklist, "Hiring now" news box, job cards grid |
| Severance | Mono caps section labels with `//` prefix, thin corner ticks on cards, numbers-grid edge texture |

## 3. Shell and breakpoints

Top bar (fixed, 56px) above a centered grid. Columns are sticky and the rails scroll on their own with thin hidden scrollbars.

| Width | Layout |
|---|---|
| under 768 | One column. Top bar, bottom tab bar, Floors row at the top of Home |
| 768 to 1279 | Slim icon rail (72px) + feed. Right rail modules move below the feed as cards |
| 1280 to 1679 | Left nav 260 + feed up to 700 + right rail 360 |
| 1680 and up | Left nav 300 + feed up to 760 + right rail 420. Shell max width 1560, centered. Edge texture fills the outer margins (section 9) |

Use CSS grid, for example `grid-template-columns: minmax(72px, 300px) minmax(0, 760px) minmax(0, 420px)` with `justify-content: center`. Sticky columns use `top: 56px; height: calc(100vh - 56px); overflow-y: auto`.

## 4. Top bar

Left: logo (text) and, on mobile, a menu button. Center: wide search box (placeholder "Search posts and floors"), results dropdown with up to 5 floors and 5 posts. Right: Sever toggle, `+ Create` button (opens the composer), avatar menu (Profile, Saved, Handbook, Log out).
In Innie mode the avatar is the `innie-glyph` (see `docs/ascii.md`) once that step exists, otherwise the Innie handle.

## 5. Left nav

1. Primary links with outline icons (use `lucide-react`): Home, Floors, Severed Floor, Comeback, Saved.
2. **Your Floors** (Reddit style): joined floors with member counts, collapsible, `+ Create floor` at the end. Empty state: "Join your first floor" button.
3. **Recent:** last 3 floors or posts visited (kept in localStorage).
4. **Mini profile card** at the bottom (LinkedIn style): avatar, @username or Innie handle, status badge.
5. Small footer links: Handbook, Wellness.
On tablet only icons show, with a tooltip. On mobile this becomes a drawer.

## 6. Center feed (Home)

Top to bottom:
1. **Floors row** (Instagram stories style): horizontally scrolling square cards, one per joined floor (initials in a bordered box, name, member count) plus a `+` card. Empty: suggested floors.
2. **Composer card** (X style): avatar, "What happened?", type chips `Vent` `Question` `Hired`, line "Posting as ...". Expands on click.
3. **Tabs and sort bar** (Reddit style): `ALL | MY FLOORS` on the left; `NEW | TOP` and, for TOP, a time filter `Today | Week | Month | All`; density toggle `Comfortable | Compact` on the right.
4. **Pinned post:** one pinned welcome post at the top, with a `PINNED` tag.
5. **Posts**, with inline cards inserted so the feed never feels thin:
   - after post 3: **Suggested floors** (3 floor cards with Join),
   - after post 6: **Severed Floor snapshot** (month total and last 3 reports),
   - after post 9: **Hiring now** (2 jobs).
6. `Load more` button at the end.
7. **Sparse feed:** with fewer than 5 posts, show the inline cards anyway plus a "Be the first to write" card.
8. **Onboarding card** for new users (LinkedIn style) at the top: "Join 3 floors", "Write your first post", "Read the Handbook", with a progress count. Disappears when done or dismissed.

**PostCard v2** (Reddit layout):
```
+----------------------------------------------------------+
| ▲ | TechNova · @priya_test · 2h          [VENT] [...]    |
| 42| Title in bold                                         |
| ▼ | Two to four lines of the body... Read more            |
|   | [ 18 Comments ]  [ Share ]  [ Save ]  [ Report ]      |
+----------------------------------------------------------+
```
- Vote rail on the left, content on the right. Corner ticks on the card.
- `Share` copies the link. `Save` toggles a bookmark (section 11).
- Type markers: `VENT`, `QUESTION`, and for `hired` a highlighted top strip "REINTEGRATED" with the waffle icon. Posts with a high score show `HOT`.
- Compact density hides the body preview and reduces padding.

## 7. Right rail

Modules, top to bottom, each at most 5 items with a `See all` link. A module with no data shows a short message with an action, never blank space:
1. **Severed this month:** big number, 30-day mini bar chart made of block characters, link to Severed Floor.
2. **Latest layoffs:** 5 rows (company, date, people).
3. **Popular floors** (Reddit style): top floors with Join buttons.
4. **Trending today:** top 3 posts of the last 24 hours.
5. **Hiring now:** 3 latest jobs.
6. Footer: Handbook, Wellness, ASCII credit.
On a floor page the first module is the floor's **About** card (description, member count, created date, rules link, Join). On a post page it is the floor's About card plus "More from this floor".

## 8. Pages

- **Floors (Explore):** filter chips by category (Tech, Finance, Retail, Startup, Manufacturing, Other), sections "Most active today", "Biggest", "New". Grid of floor cards: 1 column on mobile, 2 on tablet, 3 on desktop and wide. Card: initials block, name, members, posts today, two-line description, Join.
- **Floor page:** full-width banner strip (name in large mono, member count, Join, numbers-grid pattern), tabs `Posts | About | Layoffs`. The Layoffs tab lists Severed Floor entries whose company matches the floor name.
- **Severed Floor:** two columns on desktop. Left: big counter and the full table with filters (`7d | 30d | All`, company search, sort by people). Right: "Top companies this month" leaderboard and a by-month bar chart.
- **Comeback:** tabs `JOBS | REINTEGRATED`. Jobs as a grid (2 to 3 columns) with filter chips. Reintegrated stories as a horizontal row of cards on top (Instagram style) and the list below.
- **Profile (Instagram + LinkedIn):** banner strip, avatar block, name, headline, status badge, stats row (`Posts`, `Comments`, `Floors`, `Score`), tabs `Posts | Comments | Floors`. Stats count only non-Innie content so Innie activity can never be linked to the profile.
- **Post page:** post on top, comment box, comments, right rail as in section 7.
- **Handbook and Wellness:** two columns on desktop: sticky table of contents on one side, content cards on the other.
- **Saved:** the user's saved posts, same PostCard list. Private.

## 9. Edge texture (fills the sides on wide screens)

On widths of 1680 and up, the margins outside the shell show a static numbers grid in a very low-contrast tone, a quiet nod to the Severance "Macrodata" screens.
- Pure CSS: a `div` with `aria-hidden="true"`, `background: var(--text)`, `opacity: .05`, and an SVG numbers tile used as `mask-image`. Because it uses the theme variable, it inverts with Sever.
- Static, no animation, hidden below 1680. It never sits behind content.

## 10. Visual details

- Section labels in mono caps with a `//` prefix, for example `// SEVERED THIS MONTH`.
- Cards: 1px border, 16px padding, 12px gap between cards, corner ticks (small `┌ ┐ └ ┘` marks via pseudo-elements). Hover: `--surface` background.
- Body text 15px, line height 1.5, text blocks at most 68 characters wide.
- Skeleton loaders (plain CSS blocks, no animation library) for cards, rails and tables instead of an empty screen.
- Focus outline 2px in `--text` on every clickable element. Icon-only buttons have an `aria-label`.

## 11. Data and API additions (keep everything else unchanged)

- `GET /api/stats/overview` returns `{ severedThisMonth, severedByDay (30 numbers), topCompanies (5) }`.
- `GET /api/floors?sort=active|members|new&category=&limit=` (floors get a `category` field and a computed `postsToday`).
- `GET /api/posts/trending?window=24h&limit=3`.
- `GET /api/search?q=` returns `{ floors (max 5), posts (max 5) }`. Minimum 2 characters, simple contains-match for now. Never search or return author data of Innie posts.
- `GET /api/users/:username` adds `postCount`, `commentCount`, `floorCount`, `score` (Outie content only).
- Pinned post: `pinned` boolean on posts. Pinned posts come first in the "All" tab.
- **Optional, last:** Save. `POST /api/posts/:id/save` toggles, `GET /api/me/saved` lists. Private to the user.

## 12. Seed data for a full-looking app

Update the seed so no page looks empty: 12 floors (with categories), about 60 posts, about 120 comments, 25 layoffs spread over 6 months, 15 jobs, one pinned welcome post. Keep it fictional.

## 13. Tests (report PASS/FAIL)

1. Check at widths 390, 768, 1366, 1920 and 2560. No horizontal scrollbar. At 1920 the three columns together are at least 1400px wide. At 2560 the edge texture shows and no area wider than 120px is left blank without content or texture.
2. Home, Floors, Severed Floor, Comeback and Profile each show at least 3 modules or cards above the fold on a 1080p screen.
3. A brand new account with no floors still sees the onboarding card, suggested floors and populated rails.
4. With an empty database, every page shows an empty state with a button, not blank space.
5. Sever toggle recolors everything, including edge texture and corner ticks.
6. Keyboard: Tab reaches every control and the focus outline is visible.
7. `check:privacy` still passes. Search, trending, profile stats and caches never expose Innie authors.
