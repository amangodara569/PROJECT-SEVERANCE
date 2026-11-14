# scale.md — Pro-level upgrade (Steps 18 to 21)

Do these steps only after Steps 12, 13 and 17 are tested (real MongoDB Atlas, review tool done).
A JSON file store cannot be shared by several servers, so scaling needs the real database first.

## 0. Principles

- **Measure first.** Run the load test before changing anything and again after. Save both results in `docs/perf.md`.
- **Stateless server.** Nothing important lives in one server's memory (sessions, rate-limit counters, cache). Then more copies can be started later.
- **Fail soft.** If Redis or the cache dies, the app keeps working, only slower.
- **One place for settings.** Limits in `server/config/limits.js`, environment in `server/config/env.js`.
- **Beginner-friendly.** Comments explain *why*, not only what.

## 1. What is worth it for Linked Out

| Concept | Why we need it | Real need today? | Step |
|---|---|---|---|
| DB indexes + pagination | Feed speed | Yes, biggest win | 18 |
| Rate limiting (tiers) | Abuse, brute force, spam | Yes | 18 |
| Caching | Hot shared reads (feed, floors, layoff total) | Yes, small | 18 |
| Circuit breaker + timeouts | Redis or a slow dependency must not take the app down | Light, yes | 18 |
| Logging, request ids, health checks, graceful shutdown | Debugging and safe deploys | Yes | 18 |
| Compression | Smaller responses | Yes | 18 |
| Innie author protection, audit log | Our core promise | Yes, before public | 19 |
| httpOnly cookie auth, CSRF defense | Safer than localStorage tokens | Yes | 19 |
| Account deletion | Privacy duty | Yes | 19 |
| API gateway (nginx) | One entry point, edge limits, same-origin cookies | Learning + useful | 20 |
| Load balancing | Several API copies | Not for the beta. Build and test locally | 20 |
| Docker, Compose, CI | Repeatable builds, catches breakage | Yes | 20 |
| CDN, monitoring, backups | Speed and knowing when it breaks | Yes | 21 |
| Redis adapter + sticky sessions | Rooms (chat) on many servers | At Step 14 | later |
| Microservices, queues, CQRS | Too big for this app | No | skip |

## 2. Step 18: speed and resilience inside the app

Allowed new libraries: `pino`, `pino-http`, `compression`, `ioredis`, `rate-limit-redis`, `opossum`, `lru-cache`, `autocannon` (dev only). Client: `@fontsource/ibm-plex-mono`, `@fontsource/inter`.

### 2.1 Basics
- `config/env.js`: read and check all env vars at startup (PORT, MONGO_URI, JWT_SECRET, CLIENT_URL, optional REDIS_URL, NODE_ENV). Exit with a clear message if something required is missing.
- `utils/logger.js` with pino. Pretty logs in dev, JSON in production. Add a request id to every request (`X-Request-Id`). Never log passwords, tokens, cookies, or which user wrote an Innie post. Log a warning for any request slower than 500 ms.
- `GET /api/health` (alive) and `GET /api/ready` (database ping, cache status, breaker state, instance id).
- Graceful shutdown on SIGTERM and SIGINT: stop accepting requests, finish running ones, close the DB, then exit.
- One error middleware: JSON `{ error: { code, message, requestId } }`, no stack traces in production. Add a 404 handler and handle unhandled promise rejections.
- Request timeout 15 seconds. `express.json({ limit: "10kb" })`. Set `trust proxy` correctly for when a proxy sits in front (needed for real client IPs).
- `compression` middleware.

### 2.2 Database speed
- **Votes collection.** Move votes out of the `upvotes/downvotes` arrays into `votes` (`user`, `targetType`, `targetId`, `value`) with a unique index on user + targetType + targetId. Keep `score` as a counter on posts and comments, changed with atomic `$inc` using the difference from the user's previous vote. Do the same for `commentCount` and `reportCount`. Auto-hide at 5 reports with one conditional update. Write `server/scripts/migrateVotes.js` to convert existing data, and update the seed and `check:privacy` to match.
- **Indexes:** posts `{floor, createdAt:-1}`, `{score:-1, _id:-1}`, `{hidden, createdAt:-1}`; comments `{post, createdAt:1}`; floors unique lowercase slug; layoffs `{createdAt:-1}`, `{company}`; users unique username and email; reports unique `{reporter, targetType, targetId}`.
- **Cursor pagination** on all lists: `?limit=20&cursor=...`, max limit 50, response `{ items, nextCursor }`. NEW uses createdAt + id, TOP uses score + id.
- Use `.lean()` and select only needed fields. Never run a query inside a loop; fetch related items in one batch by ids. Set `maxTimeMS` 5000 on list queries and a short server selection timeout.
- `npm run seed:big`: 5,000 posts, 20,000 comments, 50 floors, 200 layoffs, for honest speed tests.

### 2.3 Rate limiting v2 (all numbers live in `config/limits.js`)

| Where | Limit | Key |
|---|---|---|
| All routes | 300 per 15 min | user id if logged in, else IP |
| Register and login | 10 per 15 min | IP |
| Failed logins | 5 per 15 min, then wait | account + IP |
| Create post | 20 per hour | user |
| Create comment | 60 per hour | user |
| Votes | 300 per hour | user |
| Reports | 30 per day | user |
| Layoff reports, confirms, jobs | 10 / 60 / 5 per day | user |

- Use Redis as the counter store when REDIS_URL is set, memory otherwise.
- Return 429 with `Retry-After` and standard rate-limit headers. The client shows the `empty-rate-limited` state (see `docs/ascii.md`).

### 2.4 Cache layer (`server/cache/cache.js`)
- Functions: `get`, `set`, `del`, and `wrap(key, ttlSeconds, fetchFunction)`. Backend: `lru-cache` in memory by default, Redis when REDIS_URL is set.
- **Single flight:** if many requests miss the same key at once, only one hits the database.
- **Only shared, non-personal data is cached:**

| Key | Content | TTL |
|---|---|---|
| `stats:severed:month` | monthly total | 60 s |
| `floors:list` | floors with member counts | 60 s |
| `feed:{floor or all}:{sort}:{version}:{cursor}` | one page of public post fields | 20 s |
| `post:{id}` | public post fields | 20 s |

- **Personalization is added after the cache:** read the page from cache, then fetch `myVote` for those post ids in one query on the votes collection. Never cache `myVote`, `confirmedByMe`, `/auth/me` or any write.
- Invalidate with a version number per floor (bump it on new, deleted or hidden posts). Vote score changes are allowed to be up to 20 seconds old. Write this trade-off in a comment.
- Cache keys and values must never contain author ids for Innie posts.

### 2.5 Circuit breaker and timeouts (`utils/breaker.js`, using `opossum`)
- Wrap every Redis call. Settings: timeout 300 ms, open when 50% fail after 10 calls, try again after 10 s.
- When the breaker is open, skip the cache and read from the database (fail soft). Log each state change. Show the state in `/api/ready`.
- Keep the wrapper generic so future external calls (email, job feeds) can use it.
- Redis connection uses a retry strategy with exponential backoff.

### 2.6 Client speed
- Lazy-load every page with `React.lazy` and `Suspense`.
- "Load more" button using `nextCursor`. No infinite lists in memory.
- Optimistic votes: update the number at once, undo if the request fails.
- Debounce search inputs by 300 ms.
- Self-host fonts with `@fontsource` (no Google Fonts request). Only the weights we use.

### 2.7 Tests (report PASS/FAIL, save numbers in `docs/perf.md`)
1. **Before changes:** `autocannon` on `GET /api/posts?sort=new` and `sort=top` with `seed:big` (p50, p95, requests per second).
2. After indexes and pagination, then after cache: same test again. p95 for the cached feed should be under 150 ms locally.
3. Stop Redis: the app still answers (breaker opens, no errors for users).
4. Rate limits: a script triggers 429 for login, posting and voting.
5. SIGTERM during a request: the request finishes, then the process exits.
6. `check:privacy` still passes with the new votes collection and cache.

## 3. Step 19: privacy and auth hardening

- **Innie author protection.** For Innie posts and comments do not store a plain `author`. Store `authorKey` (HMAC-SHA256 of the user id with `AUTHOR_HMAC_KEY`) for ownership checks such as delete, and `authorEnc` (AES-256-GCM of the user id with `AUTHOR_ENC_KEY`) for abuse handling. Keys are 32 bytes in env, never in the repo. This protects against a leaked database dump. It does not protect against someone who has both the database and the server secrets, or a legal order. Say so in the Handbook.
- **Admin role and unmask.** Add `role` ("user" or "admin") to users, set with `npm run make-admin <username>`. Only an admin can unmask, only for threats or legal orders, and every unmask writes an audit log entry (admin, target, reason, time). Unmask is rate limited. **Decision for me:** keep unmasking, or never allow it. Default: allow with audit log, and tell users in the Handbook.
- **Cookie auth.** Move the token from localStorage to an httpOnly cookie (`Secure` in production, `SameSite=Lax`). The client sends requests with credentials. For state-changing requests require a custom header and check the `Origin` against CLIENT_URL. Logout clears the cookie. Works because the gateway/hosting serves app and API on one origin.
- **Login safety:** same error message for wrong email or wrong password, lockout from section 2.3, bcrypt cost 12 using only async functions.
- **Input safety:** reject any body or query key starting with `$` or containing a dot (NoSQL injection). Helmet with a Content Security Policy that only allows our own scripts (the ASCII runtime is self-hosted).
- **Account deletion:** `DELETE /api/users/me` removes the account and its Outie posts, and removes the link from Innie posts (keep the text, drop the author fields). Needs the password again.
- Add a "Data and privacy" section to the Handbook in plain words. Check India's rules with a professional before going public.
- Tests: ownership delete works with `authorKey`; a DB dump contains no plain author id for Innie items; `check:privacy` passes; unmask writes an audit entry; cookie is httpOnly.

## 4. Step 20: gateway, load balancing, Docker, CI (run locally)

Files: `server/Dockerfile`, `client/Dockerfile`, `gateway/nginx.conf`, `docker-compose.yml`, `.env.example`, `.dockerignore`, `.github/workflows/ci.yml`, `scripts/loadtest.js`.

- **Docker:** server on the current Node LTS image, non-root user, healthcheck on `/api/health`. Client built with Vite and served as static files by the gateway image.
- **Gateway (nginx), with comments on every block:** serves the built client, forwards `/api` to the API instances, sets `X-Request-Id`, security headers, gzip, long cache for hashed asset files, no cache for `index.html`, edge rate limit (about 20 requests per second per IP with a small burst), upstream timeouts, and a request size limit.
- **Load balancing:** upstream with 2 API instances, `least_conn`, passive health checks, and retry on the next instance for safe GET requests only.
- **Compose services:** `gateway`, `api` (scalable with `--scale api=2`), `redis`, `mongo` (local development only).
- **Sticky sessions:** not needed now. Add a note in `docs/scale.md` section 6 for Rooms: Socket.io needs sticky sessions and the Redis adapter once there is more than one API instance.
- **CI (GitHub Actions):** install, build the client, run a smoke test against `/api/health`, run `npm audit` (report only).
- Tests: `docker compose up --scale api=2` works; `/api/ready` returns different instance ids on repeated calls; stopping one API container does not break requests; stopping Redis does not break the app; spamming requests gets 429 from the gateway and from the app; load test results added to `docs/perf.md`.

## 5. Step 21: deploy and observe

Antigravity cannot deploy for me. It prepares the configs and writes `docs/deploy.md`, a short runbook with exact commands for me to run.

- **Layout:** frontend on a CDN host (for example Vercel, Netlify or Cloudflare Pages), backend on a Node or Docker host (for example Render, Railway or Fly.io), MongoDB Atlas, a managed Redis if needed. Check current free-tier limits before choosing. Requests to `/api` must go through the same domain (rewrite or proxy) so cookies work.
- **Region:** put backend and database in the same region, close to users (for India, a Mumbai or nearby region).
- `NODE_ENV=production`, secrets in the host's secret store, `.env` never in git, production build only.
- Atlas: IP access limited to the backend, a dedicated database user, automatic backups on, connection pool size set (`maxPoolSize`).
- Monitoring: Sentry (server and client), an uptime monitor on `/api/ready`, log retention, an alert when the error rate or latency rises.
- Runbook sections: deploy, rollback, rotate secrets, restore a backup, what to do when Redis or the database is down.
- Speed checks (report PASS/FAIL): Lighthouse mobile score 90 or higher on the main pages, no API call over 1 second in normal use, cached assets served with long cache headers, first request after idle time measured and reported (some free hosts put apps to sleep).

## 6. Not now

Microservices, message queues, Kubernetes, multi-region, search engine, and real-time chat scaling (comes with Step 14, then add the Redis adapter and sticky sessions).
