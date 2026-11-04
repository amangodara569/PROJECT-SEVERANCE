# build.md — Linked Out

How the project is structured, how users move through it, and the order we build it in.
Read this first. Then read `design.md` (features) and `interface.md` (screens).

## 1. What we are building

**Linked Out** is a place where people talk honestly about losing their jobs.
Raw language is allowed. Targeting named people is not.
It mixes the best parts of four apps:

| From | We take |
|---|---|
| Reddit | Communities per company, upvotes/downvotes, comments |
| LinkedIn | Profile headline, status, jobs, "I got hired" stories |
| Instagram | Short story posts (phase 2) |
| Telegram | Group chat rooms (phase 2) |

Severance touch: the whole app has an **Innie / Outie** switch (anonymous vs real identity). See `design.md`.

## 2. Stack and rules

- **M**ongoDB + Mongoose, **E**xpress, **R**eact (Vite), **N**ode
- Data: JSON file store for now (server/db/store.js, server/data/). MongoDB Atlas comes back at Step 17.
- Tailwind CSS, React Router, axios
- Auth: JWT + bcryptjs (basic only)
- Phase 2 only: socket.io
- Plain JavaScript. No TypeScript.
- Not now: security hardening, caching, rate limits, tests, deployment. We will do these later.
- No new libraries unless asked.

## 3. Folder structure

Data: JSON file store for now (server/db/store.js, server/data/). MongoDB Atlas comes back at Step 17.

```
linked-out/
  docs/                  build.md, design.md, interface.md
  server/
    server.js            starts Express, mounts routes
    db/store.js          JSON file database store
    data/                seed.json, db.json
    models/              User, Post, Comment, Floor, Layoff, Job, Report
    routes/              auth, posts, comments, floors, layoffs, jobs, reports, users
    middleware/auth.js   checks JWT, sets req.user
    utils/innie.js       makes the random Innie handle
    utils/checkPost.js   blocks phone numbers and emails in posts
    .env                 JWT_SECRET, PORT, CLIENT_URL
  client/
    src/
      main.jsx, App.jsx  entry and routes
      api/api.js         one axios instance, adds token to requests
      context/           AuthContext.jsx (user + token), ModeContext.jsx (innie/outie)
      components/        Navbar, Sidebar, PostCard, PostComposer, VoteButtons,
                         SeverToggle, BreakRoom, LayoffRow, JobCard, EmptyState
      pages/             Home, Floors, FloorPage, PostPage, SeveredFloor,
                         Comeback, Profile, Login, Register, Handbook, Wellness, NotFound
      index.css          Tailwind + theme variables
```

Rules for structure:
- One route file = one feature. Handlers live inside the route file (no separate controllers).
- Keep every file under about 150 lines. If it grows, split it.
- Use simple names: `getPosts`, `createPost`, `PostCard`.

## 4. User navigation

Logged out: `/login`, `/register` only.
Logged in: everything below.

| Path | Page | Notes |
|---|---|---|
| `/` | Home | Feed of all posts. Sort: New / Top |
| `/floors` | Floors | List of company communities |
| `/floors/:slug` | FloorPage | Posts of one company |
| `/post/:id` | PostPage | Post + comments |
| `/severed-floor` | SeveredFloor | Layoff tracker |
| `/comeback` | Comeback | Jobs + "I got hired" stories |
| `/u/:username` | Profile | Outie profile, or Innie persona |
| `/handbook` | Handbook | Community rules |
| `/wellness` | Wellness | Mental health and money help links |
| `*` | NotFound | 404 |

Flow: Register → Home → pick or join a Floor → write a post (Outie or Innie) → get votes and comments → when hired, post in Comeback → Waffle Party.

Navigation bar (always visible): Home, Floors, Severed Floor, Comeback, Sever toggle, Profile.

## 5. API routes

All routes start with `/api`. Everything except register/login needs a token.

| Method | Route | Does |
|---|---|---|
| POST | `/auth/register` | Create user, return token |
| POST | `/auth/login` | Return token |
| GET | `/auth/me` | Current user |
| GET | `/users/:username` | Public profile |
| GET | `/posts?floor=&sort=` | List posts |
| POST | `/posts` | Create post |
| GET | `/posts/:id` | One post |
| DELETE | `/posts/:id` | Delete own post |
| POST | `/posts/:id/vote` | Body `{value: 1 or -1}`. Same value again removes the vote |
| GET | `/posts/:id/comments` | List comments |
| POST | `/posts/:id/comments` | Add comment (optional `parentId`) |
| POST | `/comments/:id/vote` | Vote on comment |
| GET | `/floors` | List floors |
| POST | `/floors` | Create floor |
| GET | `/floors/:slug` | One floor |
| POST | `/floors/:slug/join` | Join or leave |
| GET | `/layoffs` | List layoffs |
| POST | `/layoffs` | Add a layoff report |
| POST | `/layoffs/:id/confirm` | Confirm a report |
| GET | `/jobs` | List jobs |
| POST | `/jobs` | Post a job |
| POST | `/reports` | Report a post or comment |

Important privacy rule: when a post or comment is anonymous, the API must never send the real `author` id or username. Send only `innieHandle`.

## 6. Build order (one step at a time)

After each step: run it, test it, then move on. Do not skip ahead.

| Step | Build | Done when |
|---|---|---|
| 1 | Folders, server, MongoDB connection, Vite client with Tailwind, theme variables | `GET /api/health` works and the client shows a black page |
| 2 | User model, register, login, `/auth/me`, AuthContext, Login and Register pages | I can sign up, log in, refresh, and stay logged in |
| 3 | App shell: Navbar, Sidebar, routes, empty pages, Sever toggle (invert colors) | I can click every page and the toggle flips black/white |
| 4 | Floor model, floors list, floor page, join/leave | I can create and open a floor |
| 5 | Post model, composer, feed, PostCard, votes, Innie/Outie posting | I can post as Innie and the real author is hidden |
| 6 | Comments with one level of replies, comment votes | I can discuss under a post |
| 7 | Language rules: Break Room check, Report button, auto-hide | A post with a phone number is held in the Break Room |
| 8 | Layoff model, Severed Floor page, add + confirm | I can add a layoff and confirm it |
| 9 | Job model, Comeback page, "I got hired" post, Waffle Party screen | Hired post shows the Waffle Party |
| 10 | Profile page (Outie view and Innie view), status labels | Profile shows headline and status |
| 11 | Handbook and Wellness pages, empty states, 404 text | All text pages exist |
| 12 | Stabilize: JSON test-data store, login on, privacy check, hardening | No MongoDB needed, seed data fills app, privacy check passes |
| 13 | Review tool: admin queue for reported posts | Admin can review and resolve flagged content |
| 14 | Rooms (chat, socket.io) | Real-time group chat per Floor works |
| 15 | Refinement game | Crowd-check layoff reports with number binning game |
| 16 | Stories (optional, last) | 24h disappearing slide posts work |
| 17 | Switch data layer to MongoDB Atlas (only server/db/store.js changes) | App works identically with Atlas connection |

## 7. Coding rules for the AI

1. Build only the current step. Do not add features that were not asked for.
2. Beginner-friendly code: simple logic, clear variable names, no clever tricks.
3. A short comment above every function and every block that is not obvious.
4. Advanced ideas are fine if written simply and explained in a comment.
5. No placeholder code, no dead code, no TODO piles, no fake data in final files.
6. Handle errors with try/catch and send a clear message.
7. Keep replies short: list the files changed and how to test. No long explanations.
