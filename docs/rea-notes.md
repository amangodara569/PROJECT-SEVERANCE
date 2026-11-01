# rea-notes.md — Feature research notes

## Auth & Identity — Reddit & LinkedIn — Step 2
- Reddit: Lightweight registration, decoupled pseudonym handle, privacy-first.
- LinkedIn: Strict profile identity, employment status badge, professional headline.
- Adaptation: Linked Out pairs a real Outie profile with an auto-generated decoupled Innie handle.

## Floors (Communities) — Reddit — Step 4
- Reddit Subreddits: Unique slug/name, member join/leave toggle, sidebar description.
- Posts belong to a community, but can also be viewed in an aggregated all-feed.
- Adaptation: Company-based Floors with unique slug, join/leave array, and simple member counts.

## Posts & Votes — Reddit — Step 5
- Reddit Voting: Up/down toggle (+1/-1), clicking current vote toggles it off, net score = up - down.
- Reddit Feeds: Sort by New (chronological) or Top (highest net score).
- Adaptation: Anonymous Innie posts completely strip author ID from client response; only innieHandle is sent.

## Comments & Discussion — Reddit — Step 6
- Reddit Comments: Tree replies, per-comment upvotes and downvotes, score indicator.
- Adaptation: Single level of nesting (all replies attach to the root comment), updates commentCount on post.

## Jobs & Comeback — LinkedIn — Step 9
- LinkedIn Jobs: Direct external application links, location tags, role title.
- Adaptation: Community-posted job listings combined with "Reintegrated" celebration posts.
