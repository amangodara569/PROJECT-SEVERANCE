# ascii.md — ASCII art for Linked Out (Step 12b)

Source: the open-source MIT library from ascii-magic.com (npm package `ascii-magic-art`, repo `github.com/kailashsr38/ascii-magic-art`).
We use ready-made pieces for empty states, error screens and a few showpieces, plus 5 custom pieces we build ourselves.
Library pieces are fixed scenes: the docs show no way to pass your own text or numbers. Anything that shows real data is a custom piece.

## 1. Rules

- **Self-hosted only.** Nothing loads from ascii-magic.com at runtime.
- **Black and white only.** Always use the `mono` attribute. Color comes from CSS variables (`--text`, `--muted`), so the Innie inversion works.
- **Art is decoration.** Real text always stays next to it (headings, messages, lists). Wrap art in `aria-hidden="true"`.
- **Max 1 animated piece on screen at a time.** Anything else uses `still`.
- **Calm tone.** No mascots, animals, cities or landscapes. This is a place for people who lost jobs.
- **Reduced motion:** show one still frame. The library does this itself. Custom pieces must do it too.
- **Fixed size on every piece** so the layout never jumps. `size` is font size in px: 10 small, 12 default, 14 hero.
- Keep the MIT license text next to copied files. Add a small credit in the Handbook footer.

## 2. Setup

1. In `client/`: `npm install ascii-magic-art --save-dev`.
2. Copy from `node_modules/ascii-magic-art/` into `client/public/ascii-magic-art/`: `runtime/`, `lib/`, the LICENSE file, and ONLY the piece files listed in section 3 (into `pieces/`). If the element cannot find a piece without an index file, copy that file too.
3. In `client/index.html` load `/ascii-magic-art/runtime/ascii.js` with `<script type="module">`.
4. `components/AsciiArt.jsx`: wrapper around `<ascii-art>`.
   - Props: `piece`, `size`, `still`, `look`, `tone` (`text` default, or `muted`).
   - Always sets `mono`. Sets CSS `color` to `var(--text)` or `var(--muted)`.
   - Uses the current Innie/Outie mode as the React `key`, so colors redraw after Sever. Test this: the docs do not promise a redraw.
   - If React does not pass attributes to the custom element, use a ref and `setAttribute`.
5. `components/AsciiCustom.jsx`: renders custom pieces.
   - Props: `make`, `options`, `size`, `still`.
   - Draws the frame text inside a `<pre>`, monospace font from the theme, color from a CSS variable.
   - Loops with `requestAnimationFrame` only while visible (IntersectionObserver). One still frame if the user prefers reduced motion. Cleans up on unmount.
6. Copy `lib/kit.js` (it has `Grid` and `rng`) to `client/src/ascii/kit.js`. Keep the license file beside it.

## 3. Library pieces (copy only these)

| Piece | Where | Why |
|---|---|---|
| `waffle-iron-open` | Waffle Party screen, size 14 | A real waffle for our Waffle Party |
| `hourglass` | Break Room modal, size 10 | Cooling off |
| `empty-cobweb-folder` | Home, empty feed | Forgotten office folder. Text: "Nothing here yet. The work is mysterious and important." |
| `empty-no-results` | Floors, Severed Floor and Comeback searches with no match | Standard empty search |
| `empty-smoking-server` | Server error or network failure | Clear error state |
| `empty-session-expired` | Login token expired (401) | Fits our 7-day token |
| `empty-rate-limited` | Too many requests (429, added in Step 12) | Explains the wait |
| `candle-flame` | Wellness Session header, size 12 | Calm and quiet |
| `sunrise-horizon` | Comeback page header, size 12 | New start |
| `empty-all-caught-up` | Review queue when empty (used in Step 13, copy now) | Positive empty state |

Preview any piece first in a terminal: `npx ascii-magic-art <piece>`. If one feels off-tone, tell me and I will swap it.

## 4. Custom pieces (build these)

Module format (same as the library): `export const meta = { cols, rows, fps }` and `export default function create(options)` that returns `draw(t)`. `draw(t)` takes seconds and returns a string of exactly `rows` lines of `cols` characters. Use `Grid` from `kit.js`. Files go in `client/src/ascii/pieces/`.

| Piece | Props | What it draws |
|---|---|---|
| `linked-out-logo` | none | The words LINKED and OUT in block letters, joined by a chain link. On load the link breaks, the two halves drift 2 characters apart with a few `·` sparks, then rest. Plays once, then stays still. Used on Login and Register. The Navbar keeps its plain text logo. |
| `severed-counter` | `value` (number) | An odometer. Digits roll from 0 to `value` in about 1.2 seconds, then rest. Thousands separators. Used for "Severed this month". |
| `severed-board` | `rows` (up to 5 items: company, date, people) | A split-flap departures board, 46 columns: header `COMPANY / DATE / SEVERED`. Each character flips through random letters and digits, left to right, about 1 second, then settles. Plays on load only. Uppercase, long names cut with `..`. The normal LayoffRow list stays below it for real reading. |
| `elevator-404` | none | Closed elevator doors that slowly open on an empty dark shaft, pause, then close. Loops. The words "This floor does not exist." stay as real text on the page. |
| `innie-glyph` | `handle` (string) | A symmetrical 5 by 5 block pattern (each cell 2 characters wide: `██` or spaces), made only from the handle text so the same handle always gives the same glyph. Static. Shown to the left of Innie handles on posts and comments. Outie users get nothing extra. |

## 5. Placement and states

- **Login and Register:** `linked-out-logo` above the form.
- **Home empty feed:** `empty-cobweb-folder`.
- **Search with no results:** `empty-no-results`.
- **Waffle Party:** `waffle-iron-open` replaces the old CSS waffle. Text and Continue button stay.
- **Break Room modal:** `hourglass` above the message.
- **Severed Floor:** `severed-counter` for the number, `severed-board` under it, then the real list.
- **Comeback:** `sunrise-horizon` as header art.
- **Wellness:** `candle-flame` as header art.
- **404 page:** `elevator-404`.
- **ErrorState component** used by `api/api.js`: 401 shows `empty-session-expired` and "Session expired. Log in again."; 429 shows `empty-rate-limited`; server or network error shows `empty-smoking-server`. Always with real text.
- **PostCard and CommentItem:** `innie-glyph` next to Innie handles only.
- **Handbook footer:** "ASCII art: ascii-magic.com (MIT)" as a small muted link.

## 6. Tests (report PASS/FAIL)

1. Every piece in section 5 shows on its page.
2. Clicking Sever recolors every piece (black on white and white on black), including ones already on screen.
3. With "reduce motion" on in the OS, all pieces show one still frame.
4. The browser network tab shows no request to ascii-magic.com.
5. A small Node script checks each custom piece: `draw(t)` returns exactly `rows` lines of `cols` characters for t = 0, 0.5, 1 and 2.5.
6. `severed-counter` ends on the exact value. `innie-glyph` gives the same result for the same handle and different results for different handles.
7. No page has more than one animating piece at a time.

## 7. Later (do not build now)

- Refinement game background (Step 15): `flow-field` with `look="numbers"`.
- Rooms layout ideas (Step 14): study `chat-thread` and `relay-chat-channel` as references only.
