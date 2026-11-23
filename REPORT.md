# PROJECT SEVERANCE — Technical Architecture & Development Report

**Project**: Linked Out (`PROJECT-SEVERANCE`)  
**Type**: Full-Stack MERN Corporate Network & Severed Floor Forum  
**Repository**: [amangodara569/PROJECT-SEVERANCE on GitHub](https://github.com/amangodara569/PROJECT-SEVERANCE.git)  
**Date**: November 23, 2026  

---

## 1. What is Linked Out? (The Concept in Plain English)

**Linked Out** is a full-stack corporate social network inspired by the Apple TV+ series *Severance*. It is built around a **dual-identity architecture**:

- **Outie Mode (The Upper Floors)**:
  - The user's public corporate persona.
  - Theme: Corporate dark navy (`#181E27`), charcoal panels (`#1F2630`), and warm executive golden-amber accents (`#D6B27A`, `10px` rounded corners).
  - User profile shows real username (`@username`), full name, corporate title, employment status, and post history.
- **Innie Mode (The Severed Floor)**:
  - The anonymous, severed workplace identity.
  - Theme: Sterile clinical mint-green (`#E6EEEA`), pale panels (`#F1F6F3`), and surgical teal accents (`#2D6F63`, sharp `2px` corners).
  - Complete anonymity: real usernames and user IDs are stripped from transmissions. Posts display only a system-generated cryptographic identifier (e.g. `Innie-4821`).

---

## 2. Technology Stack

| Layer | Technology | Version | Purpose |
| :--- | :--- | :--- | :--- |
| **Frontend Framework** | React | `^19.3.1` | Concurrent component rendering, lazy-loaded page routes |
| **Routing** | React Router DOM | `^7.18.5` | Client-side routing, protected auth guards |
| **Styling** | Tailwind CSS | `^4.3.3` | Utility styling with CSS variable switching |
| **Typography** | IBM Plex Sans & Mono | `^5.3.0` | Severance retro-futuristic & corporate fonts |
| **Icons** | Lucide React | `^1.73.0` | Minimalist SVG icons |
| **HTTP Client** | Axios | `^1.21.0` | Request/response interceptors for auth & severance mode |
| **Build Tool** | Vite | `^8.3.5` | Sub-second dev server and optimized production bundler |
| **Backend Framework** | Express | `^5.3.0` | REST API routes and custom middleware |
| **Authentication** | JWT (`jsonwebtoken`) | `^9.0.3` | 7-day signed Bearer tokens |
| **Password Security** | `bcryptjs` | `^3.0.3` | Salted password hashing (salt rounds $\ge 10$) |
| **Primary Storage** | In-Memory + `db.json` | Custom | Instant local JSON persistence (zero database startup delay) |
| **Cloud Sync** | MongoDB Atlas (Mongoose) | `^9.12.1` | Optional asynchronous cloud backup and index creation |
| **Caching (L1/L2)** | LRU Cache + Redis (`ioredis`) | `^11.5` / `^6.0` | Dual-layer cache with circuit breakers |
| **Resilience** | Opossum | `^10.0.0` | Circuit breaker protecting against Redis latency/failures |
| **Security Headers** | Helmet | `^8.3.0` | Automatic CSP, HSTS, and frame protection |
| **Rate Limiting** | `express-rate-limit` | `^8.7.2` | Tiered per-endpoint request throttling |
| **Logging** | Pino + `pino-http` | `^10.4.0` | High-speed structured JSON audit logging |

---

## 3. High-Level System Architecture

```mermaid
flowchart TD
    subgraph Client["Client (React 19 SPA)"]
        Browser["User Browser"]
        Axios["Axios API Client"]
        AuthCtx["AuthContext"]
        ModeCtx["ModeContext"]
    end

    subgraph Server["Server (Express 5 API)"]
        MW["Middleware Pipeline<br/>(Helmet, CORS, Rate Limiters, Pino Logger)"]
        AuthRoute["/api/auth"]
        PostsRoute["/api/posts"]
        CommentsRoute["/api/comments"]
        FloorsRoute["/api/floors"]
        OtherRoutes["/api/users, /api/layoffs, /api/admin"]
    end

    subgraph DataLayer["Storage & Cache Engine"]
        MemStore["In-Memory Store (8 Collections)"]
        LocalFile["server/data/db.json (Sync Disk Save)"]
        Atlas["MongoDB Atlas (Async Cloud Sync)"]
        L1Cache["L1: In-Memory LRU Cache"]
        L2Cache["L2: Redis (Circuit Protected)"]
    end

    Browser --> AuthCtx & ModeCtx
    AuthCtx & ModeCtx --> Axios
    Axios -->|"HTTP + JWT + X-Severance-Mode"| MW
    MW --> AuthRoute & PostsRoute & CommentsRoute & FloorsRoute & OtherRoutes
    AuthRoute & PostsRoute & CommentsRoute & FloorsRoute & OtherRoutes <--> MemStore
    AuthRoute & PostsRoute & CommentsRoute & FloorsRoute & OtherRoutes <--> L1Cache & L2Cache
    MemStore -->|"saveLocal()"| LocalFile
    MemStore -.->|"async syncToAtlas()"| Atlas
```

---

## 4. Database Schema (8 Collections)

All database entities are created using clean factory functions in `server/models/`.

```mermaid
erDiagram
    USERS {
        string _id PK "UUID"
        string name "Full legal name"
        string username UK "Lowercase alphanumeric"
        string email UK "Corporate email"
        string passwordHash "Bcrypt hash"
        string headline "Job title / department"
        string bio "Bio text"
        string status "Employed | Severed | Reintegrated"
        string innieHandle UK "Unique Innie-XXXX"
        array joinedFloors "Joined floor IDs"
        array savedPosts "Bookmarked post IDs"
        boolean isAdmin "Admin status"
        string createdAt "ISO timestamp"
    }

    FLOORS {
        string _id PK "UUID"
        string name "Display name"
        string slug UK "URL slug"
        string description "Department mandate"
        string mode "outie | innie"
        array members "User IDs"
        string createdBy FK "User ID"
        string createdAt "ISO timestamp"
    }

    POSTS {
        string _id PK "UUID"
        string title "5-200 chars"
        string body "10-10000 chars"
        string type "vent | question | hired"
        string floor FK "Floor ID"
        string author FK "User ID"
        boolean isInnie "True if posted in Innie mode"
        string innieHandle "Innie-XXXX identifier"
        number score "Vote tally"
        number commentCount "Total comments"
        number reportCount "Report counter"
        boolean hidden "Auto-hidden at 5 reports"
        string createdAt "ISO timestamp"
    }

    COMMENTS {
        string _id PK "UUID"
        string post FK "Post ID"
        string parent FK "Parent Comment ID (nested tree)"
        string replyToUser "Username target"
        string body "1-2000 chars"
        string author FK "User ID"
        boolean isInnie "True if Innie"
        string innieHandle "Innie-XXXX identifier"
        number score "Vote tally"
        number reportCount "Report counter"
        boolean hidden "Auto-hidden at 5 reports"
        string createdAt "ISO timestamp"
    }

    VOTES {
        string _id PK "UUID"
        string user FK "User ID"
        string targetType "post | comment"
        string targetId FK "Post or Comment ID"
        number value "+1 or -1"
        string createdAt "ISO timestamp"
    }

    REPORTS {
        string _id PK "UUID"
        string targetType "post | comment"
        string targetId FK "Post or Comment ID"
        string reporter FK "User ID"
        string reason "Flag rationale"
        string createdAt "ISO timestamp"
    }

    LAYOFFS {
        string _id PK "UUID"
        string company "Company name"
        string date "Date of layoff"
        number peopleAffected "Headcount reduction"
        string sourceUrl "News/Verification URL"
        string note "Severance details"
        string addedBy FK "User ID"
        array confirmedBy "User IDs who verified"
        string createdAt "ISO timestamp"
    }

    JOBS {
        string _id PK "UUID"
        string title "Job title"
        string company "Company name"
        string location "Location (or Remote)"
        string link "Application link"
        string postedBy FK "User ID"
        string createdAt "ISO timestamp"
    }

    USERS ||--o{ POSTS : "authors"
    USERS ||--o{ COMMENTS : "writes"
    USERS ||--o{ VOTES : "casts"
    USERS ||--o{ REPORTS : "files"
    USERS ||--o{ LAYOFFS : "reports"
    USERS ||--o{ JOBS : "posts"
    USERS }o--o{ FLOORS : "member of"
    FLOORS ||--o{ POSTS : "contains"
    POSTS ||--o{ COMMENTS : "has"
    COMMENTS ||--o{ COMMENTS : "replies to"
    POSTS ||--o{ VOTES : "receives"
    COMMENTS ||--o{ VOTES : "receives"
    POSTS ||--o{ REPORTS : "flagged by"
    COMMENTS ||--o{ REPORTS : "flagged by"
```

---

## 5. Authentication & Session Lifecycle

```mermaid
sequenceDiagram
    autonumber
    actor User as Employee
    participant UI as Login / Register UI
    participant AuthCtx as AuthContext
    participant Server as /api/auth
    participant Store as Data Store
    participant JWT as JWT Engine

    Note over User, JWT: REGISTRATION
    User->>UI: Enters username, email, password, headline
    UI->>AuthCtx: register(userData)
    AuthCtx->>Server: POST /api/auth/register
    Server->>Server: Validate username & password
    Server->>Store: Check duplicate username / email
    Server->>Server: bcrypt.hash(password, salt=10)
    Server->>Server: generateUniqueInnieHandle() -> "Innie-XXXX"
    Server->>Store: Save new user record
    Server->>JWT: sign({ id: user._id }, 7d)
    Server-->>AuthCtx: { token, user }
    AuthCtx->>AuthCtx: Save token in localStorage
    AuthCtx-->>UI: Redirect to Home ("/")

    Note over User, JWT: LOGIN
    User->>UI: Enters email & password
    UI->>AuthCtx: login(credentials)
    AuthCtx->>Server: POST /api/auth/login
    Server->>Store: Find user by email
    Server->>Server: bcrypt.compare(password, passwordHash)
    Server->>JWT: sign({ id: user._id }, 7d)
    Server-->>AuthCtx: { token, user }
    AuthCtx-->>UI: Redirect to Home ("/")

    Note over User, JWT: SESSION RECOVERY (Page Refresh)
    UI->>AuthCtx: App mount
    AuthCtx->>Server: GET /api/auth/me (Bearer token)
    Server->>Store: Find user by decoded token ID
    Server-->>AuthCtx: { user } (hydrates user state)

    Note over User, JWT: LOGOUT
    User->>UI: Clicks Logout
    UI->>AuthCtx: logout()
    AuthCtx->>AuthCtx: Remove token from localStorage
    AuthCtx->>AuthCtx: Force mode to 'outie'
    AuthCtx->>AuthCtx: Reset DOM classes to 'dark', remove 'innie'
    AuthCtx->>AuthCtx: Swap favicon to gold
    AuthCtx-->>UI: Redirect to /login
```

> [!IMPORTANT]
> The login and registration screens strictly enforce **Outie mode** via `useEffect(() => setMode('outie'))`. Users always enter the platform through the outside corporate gate, never from the severed floor.

---

## 6. The Dual-Mode Severance System

```mermaid
flowchart LR
    subgraph ClientSwitch["Client Mode Switch"]
        Toggle["SeverToggle Slider"]
        ModeCtx["ModeContext"]
    end

    subgraph VisualEngine["Theme Engine"]
        OutieTheme["Outie Theme (Dark)<br/>Navy #181E27, Gold #D6B27A<br/>Radius 10px, Gold Door Logo"]
        InnieTheme["Innie Theme (Light)<br/>Sage #E6EEEA, Teal #2D6F63<br/>Radius 2px, Green Door Logo"]
    end

    subgraph NetworkLayer["Network Interceptor"]
        AxiosReq["api.interceptors.request"]
        Header["Header: X-Severance-Mode: outie | innie"]
    end

    subgraph DataSegregation["Server Data Segregation"]
        FeedSeg["Feed Filter: innie posts shown only in Innie mode"]
        AuthorStrip["Author Anonymizer: user ID replaced with innieHandle"]
        SearchFilter["Search Wall: innie content excluded from Outie searches"]
    end

    Toggle -->|"toggleMode()"| ModeCtx
    ModeCtx -->|"mode === 'outie'"| OutieTheme
    ModeCtx -->|"mode === 'innie'"| InnieTheme
    ModeCtx --> AxiosReq
    AxiosReq --> Header
    Header --> FeedSeg & AuthorStrip & SearchFilter
```

### Identity Comparison Matrix

| Property | Outie Mode (Upper Floors) | Innie Mode (Severed Floor) |
| :--- | :--- | :--- |
| **Theme Aesthetic** | Dark Executive Navy / Charcoal | Clinical Fluorescent Mint / Sage |
| **Accent Color** | Amber Gold (`#D6B27A`) | Lumon Teal (`#2D6F63`) |
| **Border Radius** | Soft Corporate (`10px`) | Sharp Brutalist (`2px`) |
| **Brand Mark & Favicon** | Golden Isometric Door (`door-gold.png`) | Green Isometric Door (`door-green.png`) |
| **Author Visibility** | Real username (`@username`), Name, Title | Anonymized (`Innie-XXXX`), Real ID stripped |
| **Post Ownership** | Verified by `post.author === user._id` | Verified by `post.innieHandle === user.innieHandle` |
| **Search Scope** | Outie posts and public floors | Innie posts and severed floors |

---

## 7. Post Lifecycle & Anti-Doxxing Pipeline

The platform encourages raw, honest conversation about workplace restructuring while strictly preventing doxxing.

```mermaid
flowchart TD
    UserSubmits["User submits post in PostComposer"] --> ClientCheck["Client Validation<br/>Title: 5-200 chars<br/>Body: 10-10,000 chars"]
    
    ClientCheck --> APICall["POST /api/posts<br/>Header: X-Severance-Mode"]
    
    APICall --> AuthCheck{"Authenticated?<br/>JWT Valid?"}
    AuthCheck -->|"No"| Err401["HTTP 401 Unauthorized"]
    AuthCheck -->|"Yes"| DoxxScanner{"checkContent(title, body)<br/>Regex Phone & Email Scanner"}
    
    DoxxScanner -->|"Phone/Email Found"| BreakRoom["BLOCK SUBMISSION<br/>Return isBreakRoom: true<br/>'This post contains a phone number or email address...'"]
    
    DoxxScanner -->|"Clean Content"| TypeCheck{"Transmission Type?"}
    
    TypeCheck -->|"type === 'hired'"| Reintegrate["Update user status:<br/>status = 'Reintegrated'"]
    TypeCheck -->|"vent | question"| MakePost["makePost(data)"]
    Reintegrate --> MakePost
    
    MakePost --> ModeAssign{"X-Severance-Mode?"}
    ModeAssign -->|"innie"| MarkInnie["isInnie = true<br/>innieHandle = user.innieHandle<br/>author = req.user.id (DB only)"]
    ModeAssign -->|"outie"| MarkOutie["isInnie = false<br/>innieHandle = null<br/>author = req.user.id"]
    
    MarkInnie & MarkOutie --> StoreInsert["store.insert('posts', postObj)"]
    StoreInsert --> InvalidateCache["cache.bumpFloorVersion(floor)<br/>cache.bumpFloorVersion('all')"]
    InvalidateCache --> Sanitize["sanitizePostPublic(post)"]
    Sanitize --> Resp201["HTTP 201 Created<br/>Return clean transmission"]
```

---

## 8. Atomic Voting & Score Calculation Engine

Voting on posts and comments uses an atomic state machine in `store.castVote()` that prevents race conditions and double-voting.

```mermaid
stateDiagram-v2
    [*] --> CheckExistingVote: User clicks Upvote (+1) or Downvote (-1)
    
    CheckExistingVote --> FirstTimeVote: No previous vote record
    CheckExistingVote --> CancelVote: Clicked same button again
    CheckExistingVote --> FlipVote: Clicked opposite button
    
    FirstTimeVote --> AddVoteRecord: Insert Vote record
    AddVoteRecord --> UpdateScore1: score += value (+1 or -1)
    UpdateScore1 --> Done1: Return { score, userVote: value }

    CancelVote --> DeleteVoteRecord: Delete Vote record
    DeleteVoteRecord --> UpdateScore2: score -= previous value
    UpdateScore2 --> Done2: Return { score, userVote: 0 }

    FlipVote --> UpdateVoteRecord: Update Vote record value
    UpdateVoteRecord --> UpdateScore3: score += (value * 2)
    UpdateScore3 --> Done3: Return { score, userVote: value }
```

### High-Performance Batch Vote Loading (`getUserVotesMap`)
When loading a feed of 20–50 posts, checking votes individually would cause 50 database calls. The server uses `store.getUserVotesMap(userId, 'post', postIds)`:
- Executes a single hash scan across all post IDs in the feed.
- Returns a map: `{ [postId]: 1 | -1 | 0 }`.
- Merged into the feed response in $O(1)$ time per post, guaranteeing instant feed loading without flickering vote buttons.

---

## 9. Content Moderation & Auto-Hide Pipeline

```mermaid
flowchart TD
    UserReport["User reports post/comment<br/>POST /api/reports"] --> DupCheck{"Already reported by<br/>this user?"}
    
    DupCheck -->|"Yes"| Err400["HTTP 400: Already reported"]
    DupCheck -->|"No"| SaveReport["store.insert('reports', reportObj)"]
    
    SaveReport --> IncReport["store.inc(col, id, 'reportCount', 1)"]
    
    IncReport --> ThresholdCheck{"reportCount >= 5<br/>AND !hidden?"}
    
    ThresholdCheck -->|"Yes (Threshold Met)"| AutoHide["AUTO-HIDE TRIGGERED<br/>1. store.update(col, id, { hidden: true })<br/>2. Invalidate cache: cache.del('post:' + id)<br/>3. Bump floor cache version"]
    ThresholdCheck -->|"No"| RespOK["HTTP 200 OK"]
    
    AutoHide --> AdminQueue["Item appears in Admin Review Queue<br/>GET /api/admin/reports"]
    
    AdminQueue --> AdminAction{"Admin Decision"}
    
    AdminAction -->|"Dismiss"| Restore["POST /api/admin/reports/:type/:id/dismiss<br/>hidden = false, reportCount = 0<br/>Item restored to feed"]
    AdminAction -->|"Remove"| Purge["POST /api/admin/reports/:type/:id/remove<br/>store.remove(col, id)<br/>Cascading cleanup of child comments"]
```

---

## 10. Community Floors & Synchronized Layout

### 10.1 Floor Membership & Event-Based Sync
- Community channels ("Floors") represent Lumon departments (`#macrodata-refinement`, `#optics-and-design`, etc.).
- When a user joins or leaves a floor, the client fires a lightweight DOM custom event:
  ```javascript
  window.dispatchEvent(new CustomEvent('linkedout:floor-joined', { detail: { floorId } }));
  ```
- `LeftNav.jsx`, `RightRail.jsx`, and `Home.jsx` listen to this event and update their joined state immediately without page refreshes or layout shifts.

### 10.2 Synchronized 3-Column Layout Geometry

```
+----------------------------------------------------------------------------------------------------+
|  TopBar (Fixed 56px, max-w-[1400px], px-4)                                                         |
|  [Logo] [Search Box / Keyboard Navigation Dropdown]             [SeverToggle] [Post] [User Avatar] |
+----------------------------------------------------------------------------------------------------+
|                                                                                                    |
|  Container (max-w-[1400px] mx-auto px-4, Grid: 260px | 1fr | 260px, gap-6)                         |
|                                                                                                    |
|  +-------------------+  +---------------------------------------------------+  +-------------------+ |
|  | LeftNav (260px)   |  | Center Feed / Outlet (~832px)                     |  | RightRail (260px) | |
|  | - Home            |  | - PostComposer (expanding input)                  |  | - Floor Context   | |
|  | - Floors          |  | - Tab Navigation (For You | My Floors)            |  | - Layoff Counter  | |
|  | - Severed Floor   |  | - Sort Selector (New | Top)                       |  | - Suggested Floors| |
|  | - Comeback        |  | - Feed Stream (PostCard items)                    |  |                   | |
|  | - Joined Floors   |  | - Pagination / Loading Indicator                  |  |                   | |
|  | - Handbook Links  |  |                                                   |  |                   | |
|  +-------------------+  +---------------------------------------------------+  +-------------------+ |
+----------------------------------------------------------------------------------------------------+
```

---

## 11. Core Pages & Specialized Features

### 11.1 Severed Floor (Workforce Reduction Ledger)
- **30-Day Unicode Sparkline**: Renders a lightweight, zero-dependency layoff sparkline using UTF-8 blocks (`[' ', '▂', '▃', '▄', '▅', '▆', '▇', '█']`).
- **Community Layoff Verification**: Users submit layoff events with company name, date, headcount, and source URL. Other employees click "Confirm" to verify accuracy and build trust.

### 11.2 Personnel Profile Cards
- **Dossier Header**: Employee monogram avatar, legal name, handle, corporate title, bio, and status badge (`Employed`, `Severed`, `Reintegrated`).
- **4-Tile Stats Bar**: Shows live counts for `Transmissions` (posts), `Responses` (comments), `Floors` (joined communities), and `Enrolled` (tenure).

### 11.3 Authentication Terminal (Login & Register)
- **Full-Bleed Severance Divide Background**: Cinematic isometric elevator threshold (`/severance-poster.jpg`) dividing warm executive architecture from the cold mint-green Lumon corridor.
- **Frosted Glass Terminal Card**: Styled with `backdrop-blur-xl bg-[#141A23]/90`, golden hairline border, terminal status header (`LUMON_OS // TERM #0492 · ONLINE`), branded icons (`Mail`, `Lock`, `User`, `Briefcase`), show/hide password toggle, and golden-amber CTA buttons.

### 11.4 Wellness & Handbook
- **Wellness Chamber**: Retro ASCII animated candle flame, calming Lumon quotes, and verified mental health and career transition hotline links.
- **Community Handbook**: Corporate guidelines clearly distinguishing allowed conduct (venting, harsh critique) from prohibited conduct (doxxing, harassment).

---

## 12. Dual-Store Persistence & Dual-Layer Caching

```mermaid
flowchart TD
    subgraph ReadFlow["Read Request (Cache-Aside Pattern)"]
        Req["Read Request"] --> Dedup{"In-Flight<br/>Promise exists?"}
        Dedup -->|"Yes"| JoinPromise["Join existing Promise (Single-Flight Dedup)"]
        Dedup -->|"No"| L1Check{"L1: LRU Memory Hit?"}
        L1Check -->|"Hit"| RetL1["Return in <1ms"]
        L1Check -->|"Miss"| L2Check{"L2: Redis Hit?<br/>(Circuit Breaker Closed)"}
        L2Check -->|"Hit"| Backfill["Backfill L1 -> Return"]
        L2Check -->|"Miss / Breaker Open"| ReadDB["Read from In-Memory Store"]
        ReadDB --> CacheWrite["Write to L1 & L2"]
        CacheWrite --> RetData["Return Fresh Data"]
    end

    subgraph WriteFlow["Write Request (Immediate Consistency)"]
        Mutation["Write: insert / update / delete"]
        Mutation --> UpdateMem["1. Update In-Memory Store (Instant)"]
        UpdateMem --> WriteDisk["2. fs.writeFileSync('db.json') (Local Persistence)"]
        UpdateMem --> InvalCache["3. Invalidate Cache: bumpFloorVersion()"]
        UpdateMem -.->|"4. Async"| SyncAtlas["Sync to MongoDB Atlas (Optional Backup)"]
    end
```

### Floor-Version Cache Invalidation
Instead of costly mass-deletion of Redis keys, cache keys incorporate a floor version:
`feed:floor_${floorId}:v_${floorVersion}:...`
When a post is added, `cache.bumpFloorVersion(floorId)` increments the integer. Old keys expire naturally, eliminating cache purge latency.

---

## 13. Complete REST API Reference

| Endpoint | Method | Auth | Description |
| :--- | :--- | :---: | :--- |
| `/api/auth/register` | `POST` | Public | Register new employee & auto-generate Innie handle |
| `/api/auth/login` | `POST` | Public | Authenticate with corporate email & password; returns JWT |
| `/api/auth/me` | `GET` | 🔒 | Get current user profile and private Innie handle |
| `/api/posts` | `GET` | Public | Cursor-paginated feed (`sort`, `time`, `floor`, `mode`) |
| `/api/posts` | `POST` | 🔒 | Submit post with anti-doxxing scan |
| `/api/posts/trending` | `GET` | Public | Top transmissions in the last 24 hours |
| `/api/posts/:id` | `GET` | Public | View single post transmission |
| `/api/posts/:id/vote` | `POST` | 🔒 | Atomic vote toggle (+1 / -1 / 0) |
| `/api/posts/:id/save` | `POST` | 🔒 | Bookmark or un-bookmark a post |
| `/api/posts/:id` | `PUT` | 🔒 | Edit own post |
| `/api/posts/:id` | `DELETE` | 🔒 | Delete own post and nested comments |
| `/api/posts/:id/comments` | `GET` | Public | List threaded comments for a post |
| `/api/posts/:id/comments` | `POST` | 🔒 | Add a comment or reply |
| `/api/comments/:id/vote` | `POST` | 🔒 | Vote on a comment |
| `/api/comments/:id` | `PUT` | 🔒 | Edit own comment |
| `/api/comments/:id` | `DELETE` | 🔒 | Delete own comment |
| `/api/floors` | `GET` | Public | List community floors |
| `/api/floors` | `POST` | 🔒 | Create a community floor |
| `/api/floors/:slug` | `GET` | Public | Get single floor by slug |
| `/api/floors/:slug/join` | `POST` | 🔒 | Toggle join/leave floor |
| `/api/users/:username` | `GET` | Public | View public personnel card & post history |
| `/api/users/profile` | `PUT` | 🔒 | Update own profile details |
| `/api/me/saved` | `GET` | 🔒 | View user's bookmarked posts |
| `/api/layoffs` | `GET` | Public | List workforce reduction reports |
| `/api/layoffs` | `POST` | 🔒 | Submit new layoff report |
| `/api/layoffs/:id/confirm` | `POST` | 🔒 | Verify/confirm a layoff report |
| `/api/jobs` | `GET` | Public | List job opportunities |
| `/api/jobs` | `POST` | 🔒 | Share a job opportunity |
| `/api/reports` | `POST` | 🔒 | Report a post/comment (auto-hides at 5 flags) |
| `/api/admin/reports` | `GET` | 🔒 👑 | View flagged/hidden items (admin only) |
| `/api/admin/reports/:t/:id/dismiss` | `POST` | 🔒 👑 | Dismiss flags and unhide content (admin only) |
| `/api/admin/reports/:t/:id/remove` | `POST` | 🔒 👑 | Permanently delete flagged item (admin only) |
| `/api/health` | `GET` | Public | Basic server health probe |
| `/api/ready` | `GET` | Public | Readiness probe (database, cache, circuit breaker status) |

---

## 14. Security & Production Hardening

1. **Tiered Rate Limiting**:
   - Global: `300 requests / 15 minutes` per IP.
   - Authentication: `10 attempts / 15 minutes` per IP (brute-force protection).
   - Post Creation: `20 posts / 1 hour` per user.
   - Comments: `60 comments / 1 hour` per user.
   - Votes: `300 votes / 1 hour` per user.
   - Reports: `30 reports / 24 hours` per user.
2. **Payload Protection**:
   - `express.json({ limit: '10kb' })` prevents memory exhaustion attacks.
   - `15-second request timeouts` automatically kill hung connections.
3. **HTTP Hardening**:
   - Helmet enforces strict Content Security Policy, HSTS, and X-Frame headers.
   - CORS strictly restricts origins to the configured `CLIENT_URL`.
4. **Structured JSON Logging**:
   - `pino-http` attaches a unique UUID `req.id` to every incoming request.
   - Passwords and tokens are strictly omitted from log outputs.
5. **Graceful Shutdown**:
   - Listens to `SIGTERM` and `SIGINT`, closes HTTP listeners gracefully, and flushes memory to disk before exiting.

---

## 15. How to Run the Project

```bash
# 1. Clone repository
git clone https://github.com/amangodara569/PROJECT-SEVERANCE.git
cd PROJECT-SEVERANCE

# 2. Configure server environment
# Create server/.env with:
# PORT=5000
# JWT_SECRET=super_secret_severance_lumon_key_2026
# CLIENT_URL=http://localhost:5173
# NODE_ENV=development

# 3. Start backend server
cd server
npm install
npm run dev

# 4. In a separate terminal, start frontend client
cd ../client
npm install
npm run dev

# 5. Open terminal in browser
# http://localhost:5173
```

---

*Report certified against actual production codebase implementation.*  
*“Please enjoy all facts equally.”* — Lumon Industries Corporation
