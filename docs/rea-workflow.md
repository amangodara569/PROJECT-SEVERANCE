# rea-workflow.md — Reverse engineering before building

Every feature is built in two stages: **study with REA, then build our own version.**
REA is the reverse engineering skill installed from GitHub (`https://github.com/morluto/rea`).

## 1. Check REA once per session

1. Check that the skill "REA" is installed (workspace skills folder, then global skills folder).
2. If it is installed: continue.
3. If it is not installed: run `npx skills add morluto/rea`, follow its setup, and ask me before approving anything it wants to install (it may install other software that needs its own license). Confirm it loads.
4. If it cannot be installed or cannot run: STOP. Write the problem in `docs/progress.md` under Blockers and ask me. Never skip REA silently and never replace it with guesses.

## 2. Which app to study for which feature

| Our feature | Study | What to look for |
|---|---|---|
| Votes, comments, communities (Floors) | Reddit | How voting and sorting behave, how comment replies are structured |
| Profile, headline, status, jobs, hired posts | LinkedIn | What a profile shows, how job cards and status work |
| Stories (phase 2) | Instagram | Slide flow, progress bars, 24h expiry |
| Rooms (phase 2) | Telegram | Group chat flow, message list, joining a group |
| Auth and accounts | Reddit and LinkedIn | Signup and login flow, error messages |

Features with no source app (Innie/Outie, Break Room, Waffle Party, Severed Floor look) are our own ideas. Skip REA for these and say "No REA: original feature."

## 3. How to study (keep it small)

1. Write one clear question first, for example: "How does Reddit decide what the Top sort shows?"
2. Use REA only to answer that question. Do not analyze the whole app.
3. Write the result in `docs/rea-notes.md`: **feature, source app, max 5 lines** about behavior worth copying.
4. If REA cannot answer the question, write "unknown" in the notes. Do not invent facts.

## 4. Build rules after the study

- Adapt the behavior to `docs/design.md`. If they disagree, `design.md` wins.
- Never copy code, assets, text, logos or branding from the studied app. We copy the idea, not the work.
- Do not study the same feature twice. Reuse `docs/rea-notes.md`.

## 5. Notes file format (`docs/rea-notes.md`)

```
## <Feature> — <Source app> — Step N
- note 1
- note 2
```

Keep the whole file under 60 lines. If it grows, shorten old entries.

## 6. Report

In the end-of-step reply, show only one line for REA: `REA: <feature> studied, notes saved` or `No REA: original feature`.
