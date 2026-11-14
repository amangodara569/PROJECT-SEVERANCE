# interface.md — Linked Out

How every screen and component should look. Features are in `design.md`, structure in `build.md`.

## 1. Look and feel

Cold, quiet, corporate, a little unsettling. Think old office terminal. Black and white only (final theme decided later).

**Theme variables** (in `index.css`, used everywhere, never hard-code colors in components):

| Variable | Outie (default) | Innie (inverted) |
|---|---|---|
| `--bg` | `#000000` | `#ffffff` |
| `--surface` | `#0a0a0a` | `#f5f5f5` |
| `--border` | `#262626` | `#d4d4d4` |
| `--text` | `#ffffff` | `#000000` |
| `--muted` | `#a3a3a3` | `#525252` |

- The Innie colors apply when the root element has the class `innie`.
- Because everything uses variables, the Sever toggle only flips one class.
- Add `transition: background-color .3s, color .3s` on the root so the flip feels smooth.

**Fonts:** headings and labels in a monospace font (`IBM Plex Mono`, fallback `monospace`). Body in `Inter` (fallback `sans-serif`).
**Shapes:** square corners (radius 2px at most). 1px borders. No shadows, no gradients.
**Spacing:** 4px grid. Cards have 16px padding. Page content max width 1100px.
**Buttons:**
- Primary: filled with `--text`, text in `--bg`.
- Secondary: transparent, 1px `--border`, text `--text`.
- Hover: swap them.
**Icons:** simple outline icons only. A small waffle icon is used in Waffle Party.

## 2. Layout

Replaced by docs/layout.md.

**Desktop (width 900px and up):** three columns.

```
+----------------------------------------------------------+
| LINKED OUT                     [ Outie | Innie ]  @user  |  <- Navbar
+-----------+---------------------------------+------------+
| Home      |                                 | Trending   |
| Floors    |        Main content             | Floors     |
| Severed   |        (feed / page)            |            |
|  Floor    |                                 | Severed    |
| Comeback  |                                 | this month |
| Handbook  |                                 |  N people  |
| Wellness  |                                 |            |
+-----------+---------------------------------+------------+
```

**Mobile:** one column. Bottom tab bar with Home, Floors, Severed Floor, Comeback, Profile. The Sever toggle sits in the top bar. The right column is hidden.

## 3. Components

**Navbar:** logo text `LINKED OUT` (monospace, letter-spaced) on the left, Sever toggle in the center-right, username on the right. Logo links to `/`.

**SeverToggle:** a two-part switch labeled `OUTIE` and `INNIE`. The active part is filled. On click, the root class flips and the choice is saved. Under it, tiny muted text: "You are Outie" or "You are Innie".

**PostCard:**
```
+------------------------------------------------+
| ▲  Title of the post                           |
| 12  Floor name  ·  Innie-4821  ·  2h ago        |
| ▼  First two lines of the body text...          |
|    [ 8 comments ]  [ Report ]                   |
+------------------------------------------------+
```
- Vote arrows on the left with the score between them. The active vote is filled.
- Author shows `@username` (Outie) or `Innie-XXXX` (Innie, in monospace).
- `Reintegrated` badge: small outlined tag next to the author.

**PostComposer:** title input, body textarea, floor dropdown (optional), type dropdown, a line "Posting as ...", and a `Post` button.

**VoteButtons:** two small arrow buttons with the score. Same component for posts and comments.

**CommentItem:** author line, body, vote buttons, `Reply` and `Report` links. Replies are indented by 24px with a left border.

**LayoffRow:** one line: `Company · date · N people · Confirmed by 7 · [ Confirm ]`.

**JobCard:** title, company, location, `Apply` link button.

**EmptyState:** centered muted text with a one-line message (see `design.md` section 0).

**BreakRoom (modal):** see section 4.

## 4. Screens

### Login / Register
Centered card on black. Logo, two inputs, one button, a link to the other page. Footer line in muted monospace: "Please enjoy all facts equally."

### Home
Composer on top (collapsed to one line "What happened?" until clicked). Below it a sort switch `NEW | TOP`, then PostCards. Empty state if none.

### Floors
Search input at top. Grid of floor cards: name, member count, `Join` button. A `Create floor` button at the top right opens a small form (name, description).

### Floor page
```
+------------------------------------------------+
| FLOOR: Company X          42 members  [ Join ] |
| Short description                              |
+------------------------------------------------+
| Composer (floor is preselected)                |
| NEW | TOP                                      |
| PostCards...                                   |
+------------------------------------------------+
```

### Post page
Full PostCard (full body), a comment box, then the comment list.

### Severed Floor
```
+------------------------------------------------+
| THE SEVERED FLOOR                              |
| Severed this month: 1,240                      |
+------------------------------------------------+
| [ Search company ]            [ Add report ]   |
| LayoffRow                                      |
| LayoffRow                                      |
+------------------------------------------------+
```
The big "Severed this month" number is large monospace. The Add report form is a small inline panel: company, date, people affected, source link, note.

### Comeback
Two tabs: `JOBS` and `REINTEGRATED`. Jobs tab shows JobCards plus a `Post a job` button. Reintegrated tab shows posts of type `hired`, with a `I got hired` button that opens the composer with type preselected.

### Waffle Party (full screen, shown once after a hired post)
Solid `--bg`, a large outline waffle icon centered (CSS grid squares), the text "WAFFLE PARTY", under it "You were reintegrated.", and one `Continue` button. Fades in over 500ms.

### Break Room (modal, shown when a post is held)
```
+------------------------------------------+
|  BREAK ROOM                              |
|                                          |
|  This post contains a phone number       |
|  or email address. We cannot publish it. |
|                                          |
|  Swear all you want. Do not expose       |
|  people.                                 |
|                                          |
|  [ Edit post ]                           |
+------------------------------------------+
```
Narrow centered box, 1px border, dark overlay. The server's message is shown in the middle. The single button closes the modal and keeps the text.

### Profile
Header: `@username`, headline, status badge (`Employed`, `Severed`, `Reintegrated`), bio. Below: list of that user's non-anonymous posts. If the viewer is the owner, an `Edit profile` button.

### Handbook
Simple long-text page: short headings, short paragraphs, the allowed and not-allowed lists from `design.md` section 6.

### Wellness Session
Short kind message at top, then a plain list of link buttons.

### NotFound
Centered: "This floor does not exist." and a `Go home` button.

## 5. States and feedback

- **Loading:** a single line of muted text "Loading..." (no spinners).
- **Errors:** a bordered box with the message, shown above the form or list.
- **Success:** a short line of text that disappears after 3 seconds.
- **Empty lists:** use EmptyState.
- **Disabled buttons:** 40% opacity, no hover change.

## 6. Sever animation

When the toggle is clicked: the page colors transition over 300ms. Nothing else. No sounds, no extra effects.

## 7. Phase 2 screens (do not build yet)

- **Stories:** a horizontal row of square cards at the top of Home. Tapping opens a full-screen slide viewer with progress bars at the top.
- **Rooms:** two panes, room list on the left, messages on the right, input at the bottom. Mobile: list then chat.
- **Refinement:** full-screen grid of small monospace numbers drifting slightly. Bins at the bottom labeled with plain words. Quiet, no score popups.

