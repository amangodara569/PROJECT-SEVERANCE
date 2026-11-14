# tokens.md — Less tokens, more output

Goal: build fast and cheap. Follow every rule here in every session.

## 1. Reading

- Read `docs/progress.md` first. It replaces re-reading the whole project.
- Read only the section of `build.md`, `design.md` or `interface.md` needed for the current step. Use search or line ranges, not full-file reads.
- Do not re-read a file you already know. Do not re-read a file you just wrote.
- Before installing a package, check `package.json`. Do not install what is already there.

## 2. Writing code

- Edit existing files with small changes. Do not rewrite a whole file for a small fix.
- Create several files in one go when a step needs them.
- Reuse existing components and helpers. Never create a second version of something that exists.
- Keep comments to one short line. Beginner-friendly means clear code, not long essays in comments.
- No extra files: no README, no summaries, no notes files except `docs/progress.md`, `docs/rea-notes.md`, `docs/test-guide.md`, `docs/scale.md`, `docs/perf.md` and `docs/deploy.md`.

## 3. Running and testing

- Test with the smallest command that proves the step works (one curl, one script).
- Limit logs: show only the last 20 lines of long output.
- Do not restart servers or re-run tests that already passed.

## 4. Thinking

- Decide quickly. No long plans. The plan is already in `docs/build.md`.
- If blocked, ask ONE short question. Do not list many options.
- Do not repeat these docs or the REA notes back to me.

## 5. Reply format (end of every step, max 8 lines)

```
Step N done: <name>
REA: <one line>
Files: <list of created/changed files>
Test: <exact commands or clicks>
Next: Step N+1 <name> (say "continue")
```

If something failed, replace "Step N done" with "Step N blocked" and add one line explaining why.
No other text. No code pasted in chat.

## 6. Session hygiene

- Everything needed to resume is in `docs/progress.md`. A new chat costs almost nothing.
- Start a fresh chat after every step or two. Long chats cost more tokens because old messages are re-sent.
- Keep `docs/progress.md` under about 80 lines: shorten old entries, never let it grow without limit.
