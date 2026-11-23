# progress.md
> Agent: read this first every session. Update it at the end of every step. Keep it under 80 lines.
> Rule: Tested = yes ONLY when user writes "tested" or "works" for that step. "continue" or "next" means move on but keep Tested = no.

## Status
- Current step: 12d — Theme v2
- State: built, waiting for my test
- Milestone: private beta after Step 21 (Phase 2 steps 14 to 16 come after the beta).
- Last updated: 2026-11-24
- Next action: Test static tabs bar on Home, universal borderless cards, 2000-char limit, and auto-expanding post composer

## Steps
| # | Step | State | Main files | Tested |
|---|---|---|---|---|
| 1 | Folders, server, db, Vite, theme vars | done | server.js, db.js, index.css | yes |
| 2 | User model, auth routes, AuthContext, login/reg | done | User.js, auth.js, AuthContext.jsx | yes |
| 3 | App shell: Navbar, Sidebar, routes, Sever toggle | done | AppLayout.jsx, SeverToggle.jsx | yes |
| 4 | Floor model, floors list, floor page, join/leave | done | Floor.js, floors.js, Floors.jsx | yes |
| 5 | Post model, composer, feed, PostCard, votes | done | Post.js, posts.js, PostCard.jsx | yes |
| 6 | Comments with one reply level, comment votes | done | Comment.js, comments.js, CommentItem.jsx | yes |
| 7 | Language rules: Break Room check, Report button | done | checkPost.js, reports.js, BreakRoom.jsx | yes |
| 8 | Layoff model, Severed Floor page, add + confirm | done | Layoff.js, SeveredFloor.jsx, LayoffRow.jsx | yes |
| 9 | Job model, Comeback page, Waffle Party screen | done | Job.js, Comeback.jsx, WaffleParty.jsx | yes |
| 10 | Profile page (Outie/Innie view), status labels | done | users.js, Profile.jsx | yes |
| 11 | Handbook, Wellness, empty states, 404, Guide | built, waiting for my test | Handbook.jsx, Wellness.jsx, SystemGuideModal.jsx | no |
| 12 | Stabilize: JSON test-data store, login on, privacy check, hardening | done | store.js, seed.json, seed.js, privacyCheck.js | yes |
| 12b | ASCII interface polish | built, waiting for my test | AsciiArt.jsx, AsciiCustom.jsx, pieces | no |
| 12c | Layout v2: fill the screen | done | AppShell.jsx, TopBar.jsx, LeftNav.jsx, RightRail.jsx | no |
| 12d | Theme v2 | built, waiting for my test | index.css, Avatar.jsx, PostCard.jsx, SeverToggle.jsx | no |
| 13 | Review tool: admin queue for reported posts | done | admin.js, ReviewQueue.jsx | yes |
| 14 | Rooms (chat, socket.io) | not started | socket.io, Room.jsx | no |
| 15 | Refinement game | not started | Refinement.jsx | no |
| 16 | Stories (optional, last) | not started | Stories.jsx | no |
| 17 | Switch data layer to MongoDB Atlas (only server/db/store.js changes) | done | store.js | yes |
| 18 | App speed and resilience: indexes, pagination, votes collection, rate limits v2, cache, circuit breaker, logging | built, waiting for my test | env.js, limits.js, logger.js, breaker.js, cache.js, store.js | no |
| 19 | Privacy and auth hardening: Innie author protection, cookie auth, account deletion | not started | User.js, auth.js, posts.js | no |
| 20 | Gateway, load balancing, Docker, CI (local) | not started | nginx.conf, Dockerfile, docker-compose.yml | no |
| 21 | Deploy and observe | not started | docs/deploy.md | no |

## Decisions
- Dedicated votes collection with atomic score increments on target models; upvotes/downvotes arrays removed.
- Redis optional with circuit breaker (opossum) and memory fallback (lru-cache).
- Cursor pagination on posts feed (NEW uses createdAt+id, TOP uses score+id).
- Personalization (myVote) batch-merged after cache; innie authors strictly protected and never cached.
- Client code-split with React.lazy; search inputs debounced by 300ms; fonts self-hosted via @fontsource.

## Blockers
- None.

## Latest test instructions
- Run `npm run check:privacy --prefix PROJECT-SEVERANCE/server` to confirm all 7 privacy checks pass.
- Run `node PROJECT-SEVERANCE/server/scripts/testRateLimits.js` to verify tiered 429 enforcement.
- Check `http://localhost:5000/api/ready` for server health, cache, and breaker status.
- Load `http://localhost:5173/` to test cursor pagination ("Load more transmissions") and optimistic votes.

