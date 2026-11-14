# Performance Measurements (docs/perf.md)

Recorded metrics across Step 18 upgrades.

## 1. Baseline (Before Step 18 Changes)
Tested with local server against initial dataset (`connections: 10`, `duration: 5s`).

| Endpoint | p50 (ms) | p95 (ms) | p99 (ms) | Req/Sec | Total Requests |
|---|---|---|---|---|---|
| `GET /api/posts?sort=new` | < 1 ms | 1 ms | 3 ms | 10,784 | 53,920 |
| `GET /api/posts?sort=top` | < 1 ms | 1 ms | 2 ms | 12,972 | 64,855 |

## 2. After Step 18 (seed:big with 5,000 posts, 20,000 comments, 50 floors, 200 layoffs)
Tested with local server against large dataset with cursor pagination, caching, gzip compression, and structured logging (`connections: 10`, `duration: 5s`).

| Endpoint | p50 (ms) | p95 (ms) | p99 (ms) | Req/Sec | Total Requests | Target Met (< 150 ms) |
|---|---|---|---|---|---|---|
| `GET /api/posts?sort=new` (cached) | 1 ms | ~4 ms | 10 ms | 4,195.6 | 20,976 | PASS (1 ms << 150 ms) |
| `GET /api/posts?sort=top` (cached) | 1 ms | ~3 ms | 8 ms | 4,989.8 | 24,946 | PASS (1 ms << 150 ms) |

### Observations:
- Cached feed latency p95 is ~3-4ms, well below the 150ms local threshold requirement.
- Gzip response compression and code-splitting reduced client bundle footprint by >55%.
- Single-flight caching deduplicates concurrent cache misses.
