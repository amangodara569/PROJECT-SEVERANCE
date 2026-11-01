# progress.md
> Agent: read this first every session. Update it at the end of every step. Keep it under 80 lines.

## Status
- Current step: 11 — Handbook, Wellness, and System Feature Guide (Phase 1 Complete)
- State: built, waiting for my test
- Last updated: 2026-11-01
- Next action: Test the new System Guide pop-up modal and all Phase 1 MVP features

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
| 11 | Handbook, Wellness, empty states, 404, Guide | done | Handbook.jsx, Wellness.jsx, SystemGuideModal.jsx | yes |
| 12 | Phase 2: Stories, Rooms, Refinement game | not started | socket.io, Stories.jsx | no |

## Implemented Feature Descriptions
- Sever Toggle (Innie/Outie): Inverts CSS theme vars and toggles between real @username and anonymous Innie-XXXX handle.
- Feed & Discussion: Vents, questions, and hired posts with ▲/▼ score calculation, 1-level replies, and NEW/TOP sorting.
- Floors: Company-specific communities with member join/leave counters and filtered post feeds.
- The Severed Floor: Monthly layoff headcount counter with crowdsourced reporting and peer verification confirmations.
- Comeback & Waffle Party: Job opportunity board and celebratory full-screen retro waffle party upon sharing a hired post.
- The Break Room: Unrestricted swearing permitted; doxxing (phone/email) triggers modal for revision; 5 flags auto-hide.
- Outie Profiles: Public career status badges (Employed/Severed/Reintegrated), headline, bio, and public posts.
- System Guide Modal: Automatic orientation pop-up detailing all features with an interactive multi-tab guide.

## Decisions
- SystemGuideModal appears automatically on first entry and can be reopened anytime via [ Guide ] in the navbar.
- Login requirement remains commented out for live browser preview without MongoDB.

## Blockers
- None.

## Latest test instructions
- Open http://localhost:5173: the System Guide modal appears automatically.
- Click through all sections to learn about every feature, then click [ Acknowledge Protocols ].
- Re-open the guide anytime by clicking [ Guide ] in the top navbar.
