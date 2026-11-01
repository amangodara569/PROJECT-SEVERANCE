# design.md — Linked Out

How each feature works: purpose, behavior, data, rules. Screens are in `interface.md`.
Phase 1 = MVP (build steps 1 to 11). Phase 2 = after the MVP works.

## 0. Naming (Severance homage)

Our words are inspired by the TV series *Severance*. This is a light homage: names and tone only. No logos, images or text copied from the show.

| Normal word | Linked Out word |
|---|---|
| Anonymous mode | **Innie** |
| Real identity mode | **Outie** |
| Switching mode | **Sever** |
| Laid off | **Severed** |
| Got a new job | **Reintegrated** |
| Company community | **Floor** |
| Layoff tracker | **Severed Floor** |
| Cool-off for angry posts | **Break Room** |
| Hired celebration | **Waffle Party** |
| Community rules | **Handbook** |
| Mental health help | **Wellness Session** |
| Group chat (phase 2) | **Room** |
| Crowd-checking game (phase 2) | **Refinement** |

Tone of text: calm, cold, corporate, slightly dark humor. Short sentences.
Small touches (keep to one line each):
- Login footer: "Please enjoy all facts equally."
- Empty feed: "Nothing here yet. The work is mysterious and important."
- 404: "This floor does not exist."

## 1. Accounts and profile (LinkedIn)

Purpose: a real identity (Outie) that people can recognize and connect with.

**User fields:** `username`, `email`, `passwordHash`, `headline` (like "Backend dev, ex-Company X"), `bio`, `status`, `innieHandle`, `joinedFloors[]`, `createdAt`.

- `status` is one of `Employed`, `Severed`, `Reintegrated`. Shown as a small badge.
- `innieHandle` is created at register, example `Innie-4821`. It stays the same for that user, so anonymous conversations feel continuous. It is never linked to the username in any API response.
- Profile page shows the Outie view (username, headline, status, bio, own non-anonymous posts).
- Profile never shows anonymous posts.

## 2. Innie / Outie and the Sever toggle (core Severance feature)

Purpose: the biggest reason people will use the app. They can speak freely about an ex-employer without their name attached.

- A toggle in the navbar called **Sever**. Two states:
  - **Outie** (default): black background, white text. Posts show the real username.
  - **Innie**: the whole app inverts to white background, black text. Posts show only `Innie-XXXX`.
- The mode is saved in the browser (localStorage) and applied as a CSS class on the app root.
- The composer follows the current mode. A small line under it tells the user what will be shown: "Posting as Innie-4821" or "Posting as @username".
- Server rule: if `isInnie` is true, store the real `author` for moderation, but return only `innieHandle` to everyone else.
- A user can never change a post's mode after posting.

## 3. Posts (Reddit + Instagram)

Purpose: the main content. People tell their layoff story.

**Post fields:** `title`, `body`, `type`, `floor` (ref, optional), `author` (ref, hidden if Innie), `isInnie`, `innieHandle`, `upvotes[]` (user ids), `downvotes[]` (user ids), `commentCount`, `reportCount`, `hidden`, `createdAt`.

- `type`: `vent` (default), `question`, `hired` (used by Comeback).
- Score = upvotes minus downvotes (calculated, not stored).
- Feed sort: **New** (by date) or **Top** (by score).
- Voting: one vote per user per post. Clicking the same arrow again removes the vote.
- Delete: only the real author can delete, even for Innie posts.
- Posts with `hidden: true` are not returned in lists.
- Text only for the MVP. Images come later.

## 4. Comments (Reddit)

**Comment fields:** `post` (ref), `parent` (ref, optional), `body`, `author` (hidden if Innie), `isInnie`, `innieHandle`, `upvotes[]`, `downvotes[]`, `reportCount`, `hidden`, `createdAt`.

- One level of replies only (a reply to a reply attaches to the same parent). Keeps the code and the screen simple.
- Comments follow the same Innie/Outie and voting rules as posts.
- Updates `commentCount` on the post.

## 5. Floors (Reddit communities, one per company)

Purpose: people from the same company find each other.

**Floor fields:** `name` (company), `slug`, `description`, `members[]`, `createdBy`, `createdAt`.

- Anyone can create a floor. Name must be unique (case-insensitive).
- Join or leave with one button.
- Floor page shows: name, member count, a Join button, and the posts of that floor.
- Posting inside a floor sets the post's `floor`.
- Floor names are plain company names, no "official" badge in the MVP.

## 6. Language rules and the Break Room (moderation)

Rule in one line: **free words, not free targets.**

Allowed: swearing, raw anger, dark humor, harsh criticism of companies and layoff decisions.
Not allowed: harassment, threats, doxxing, abusing a named individual.

How the MVP enforces it (kept simple):
1. **No word filter.** Swearing is never blocked.
2. **Doxx check** (`utils/checkPost.js`): if a title, body or comment contains a phone number or email address, the server refuses it with a clear message.
3. **Break Room:** when step 2 refuses a post, the client shows the Break Room screen (see `interface.md`). The text stays in the box so the user can edit it and try again.
4. **Report button** on every post and comment. Creates a `Report` (`targetType`, `targetId`, `reporter`, `reason`).
5. **Auto-hide:** when a post or comment reaches 5 reports, set `hidden: true`. A manual review tool comes later.
6. One user can report the same item only once.

The **Handbook** page explains these rules in plain words.

## 7. Severed Floor (layoff tracker)

Purpose: a reason to open the app every day. A live list of layoffs.

**Layoff fields:** `company`, `date`, `peopleAffected` (number, optional), `sourceUrl` (optional), `note`, `addedBy`, `confirmedBy[]`, `createdAt`.

- Anyone can add a report.
- Anyone can **Confirm** a report once. The confirm count is shown as the trust level.
- Sort: newest first. Filter by company name.
- A header line shows: "Severed this month: N" (sum of `peopleAffected` for the current month).
- Each row can link to the company's Floor if one exists.

## 8. Comeback (LinkedIn)

Purpose: stop the app from being only negative. Show that people recover.

- **Jobs:** a list of job posts. **Job fields:** `title`, `company`, `location`, `link`, `postedBy`, `createdAt`. Anyone can post one. Shows as simple cards.
- **I got hired:** a post with `type: "hired"`. When one is created:
  - the user's `status` becomes `Reintegrated`,
  - the client shows the **Waffle Party** screen once.
- **Waffle Party** (Severance touch): a full-screen celebration with a waffle icon and the text "Waffle Party. You were reintegrated." One button to continue. No confetti library, just CSS.
- Hired posts appear in the main feed with a small `Reintegrated` badge and in the Comeback page.

## 9. Handbook and Wellness Session (static pages)

- **Handbook:** the community rules from section 6, written short and clear, plus the line "Please enjoy all facts equally."
- **Wellness Session:** a plain page with a short kind message and links to mental health support and money/unemployment help. Links are filled in by me later.

## 10. Phase 2 features (do not build yet)

- **Stories (Instagram):** short slide posts, "How I found out I was fired". 1 to 6 slides of text on a black or white card. Disappear after 24 hours.
- **Rooms (Telegram):** real-time group chat per Floor using socket.io. Join, send text, see members. Innie/Outie rules apply.
- **Refinement (Severance game):** a calm grid of numbers. Users sort items into bins by clicking. It is used to **crowd-check layoff reports**: each round shows a few unconfirmed layoff reports and asks "Looks real / Looks fake". Matches raise or lower the confirm trust. Tone is the Macrodata Refinement mood: quiet, hypnotic, black and white.
- **Follows (LinkedIn):** follow other Outie users.
- **Images and links** in posts.

## 11. Out of scope for now

Security hardening, caching, rate limits, email verification, notifications, payments, admin dashboard, native mobile apps. We will plan these later.
