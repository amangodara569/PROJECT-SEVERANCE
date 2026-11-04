# progress.md
> Agent: read this first every session. Update it at the end of every step. Keep it under 80 lines.
> Rule: Tested = yes ONLY when user writes "tested" or "works" for that step. "continue" or "next" means move on but keep Tested = no.

## Status
- Current step: 12b — ASCII interface polish
- State: built, waiting for my test
- Milestone: private beta after Step 13.
- Last updated: 2026-11-04
- Next action: Test ASCII art integration and Sever toggle recoloring across screens

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
| 12 | Stabilize: JSON test-data store, login on, privacy check, hardening | done | store.js, seed.json, seed.js, privacyCheck.js | no |
| 12b | ASCII interface polish | built, waiting for my test | AsciiArt.jsx, AsciiCustom.jsx, pieces | no |
| 13 | Review tool: admin queue for reported posts | built, waiting for my test | admin.js, ReviewQueue.jsx | no |
| 14 | Rooms (chat, socket.io) | not started | socket.io, Room.jsx | no |
| 15 | Refinement game | not started | Refinement.jsx | no |
| 16 | Stories (optional, last) | not started | Stories.jsx | no |
| 17 | Switch data layer to MongoDB Atlas (only server/db/store.js changes) | not started | store.js | no |

## Decisions
- Data: JSON file store until Step 17.
- ASCII art: self-hosted ascii-magic-art web component + 5 custom procedural pieces.
- SystemGuideModal opens once per user via localStorage flag, re-openable via navbar [ ? ].
- Swearing allowed; phone/email doxxing blocked via Break Room modal; 5 reports auto-hide.
- Innie posts strictly strip real author from API responses; pseudonym handle only.

## Blockers
- None.

## Latest test instructions
- Open http://localhost:5173 to view ASCII pieces (counter, split-flap board, elevator 404, candle, sunrise, innie glyphs). Click Sever toggle to verify instant monochrome recoloring.
