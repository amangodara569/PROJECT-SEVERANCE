# Test Guide — Linked Out

## 1. Test Accounts
All accounts share the password: `Test@1234`

| Email | Outie Username | Innie Handle | Status | Role / Bio |
|---|---|---|---|---|
| `aman@lumon.com` | aman_test | Innie-1001 | Employed | Architect @ TechNova (Admin) |
| `priya@lumon.com` | priya_test | Innie-2002 | Severed | Ex-MegaCorp Senior FE |
| `rahul@lumon.com` | rahul_test | Innie-3003 | Severed | Fullstack Dev |
| `meera@lumon.com` | meera_test | Innie-4004 | Reintegrated | Staff @ ByteForge |
| `sam@lumon.com` | sam_test | Innie-5005 | Employed | EM @ StartupZero |
| `neha@lumon.com` | neha_test | Innie-6006 | Severed | Product Designer |

## 2. CLI Commands
- `cd server; npm run seed` — Resets test data to clean seed state.
- `cd server; npm run check:privacy` — Runs automated API privacy leak audit.

## 3. Feature Click Checklist
1. **Auth**: Sign in `priya@lumon.com` / `Test@1234` -> lands on Home with JWT token.
2. **Sever Switch**: Click toggle in navbar -> switches between Outie and Innie modes.
3. **Feed**: Switch tabs (All / Vents / Questions / Hired) -> filtered post stream.
4. **Post Composer**: Post with Innie active -> publishes with Innie handle, no author.
5. **Comments**: Open any post -> post top-level or threaded reply comment.
6. **Voting**: Click ▲ or ▼ on post/comment -> score updates and toggles state.
7. **Floors**: Click Floors -> view company floors, join/leave floor, browse floor feed.
8. **Tracker**: Click Layoffs -> view layoff entries and click "Confirm" (+1 trust).
9. **Jobs**: Click Jobs -> browse opportunities and submit new external job.
10. **Break Room**: Write post with phone number `555-0199` -> redirected to Break Room.
11. **Profile**: Visit `/u/priya_test` -> shows Outie posts only, zero Innie items.
12. **Admin Review Queue**: Sign in as `aman@lumon.com` -> click navbar `[ Audit ]` or `/review` -> review flagged items, click `Dismiss Reports` or `Sever Transmission`.

## 4. Two-User Privacy Verification Test
1. Window 1 (Normal): Log in as `priya@lumon.com`.
2. Window 2 (Incognito): Log in as `rahul@lumon.com`.
3. In Window 1: Toggle Sever switch to **Innie**, post a vent titled "Severance audit test".
4. In Window 2: Refresh Home feed. Confirm post shows author as `Innie-2002` (not Priya).
5. In Window 2: Upvote the post and post comment "Stay strong".
6. In Window 1: Refresh post -> verify Rahul's comment appears and score increased.
7. In Window 2: Click on Priya's Outie profile (`/u/priya_test`) -> verify the Innie post is NOT listed.
8. In Window 1: Submit post body containing `9876543210` -> confirm Break Room blocks submission.

