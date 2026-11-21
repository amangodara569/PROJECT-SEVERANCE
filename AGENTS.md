# AGENTS.md — Linked Out

MERN app (MongoDB, Express, React + Vite, Node). Plain JavaScript. Docs are in `docs/`.
This file is read at the start of every session. Follow it without being told.

## 1. Session start (do silently, in this order)

1. Read `docs/progress.md`. It says which step we are on and the exact next action.
2. Read `docs/tokens.md` and `docs/rea-workflow.md` (both are short).
3. Read ONLY the parts needed for the current step:
   - `docs/build.md`: the row of the current step in section 6.
   - `docs/design.md`: the section of the feature being built.
   - `docs/interface.md`: the screen or component being built.
   - `docs/ascii.md`: only when working on ASCII art.
   - `docs/DESIGN.md`: only when working on theme, colours, type or shape.
   - `docs/scale.md`: only the section of the current step (18 to 21).
   - `docs/layout.md`: only when working on layout or page structure.
   Never read these three files fully.
4. Say one line: `Resuming Step N: <name>.` Then start working. Do not ask what to do.

If `docs/progress.md` does not exist, stop and tell me. Do not guess where we are.

## 2. Before every feature

Use the REA reverse engineering skill first. Rules are in `docs/rea-workflow.md`.
Check `docs/rea-notes.md` first: if the feature was already studied, reuse the notes and do not study it again.

## 3. End of every step

1. Update `docs/progress.md` (format is written inside that file). Tested = yes ONLY when I write "tested" or "works" for that step. "continue" or "next" means move on but keep Tested = no.
2. Reply in the short format from `docs/tokens.md`.
3. STOP. Wait for me to say `continue` or `next`.

If I say `continue`, `next`, or anything vague, resume from `docs/progress.md`.
If I report a bug, fix it first, note it in `docs/progress.md`, then wait.

## 4. Code rules

- Plain JavaScript. Only the libraries in `docs/build.md`. Ask before adding any other.
- Very easy, beginner-friendly code: simple names, no clever tricks.
- A short one-line comment above every function and every non-obvious block.
- Advanced ideas are allowed only if written simply and explained in a comment.
- Files under about 150 lines. Colors only from CSS variables (docs/DESIGN.md).
- No dead code, no fake data, no placeholder code, no features outside the current step.
- Follow docs/scale.md in Steps 18 to 21. Before that, do not add them.
- Never copy code, assets or branding from other apps.


