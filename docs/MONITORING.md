# ChessVerse — Production Monitoring & Reliability Guide

This document defines the monitoring architecture, health check procedures, error classification, real-time observability, deployment verification, and incident response runbook for the production ChessVerse application.

---

## 1. Production Monitoring Architecture

ChessVerse employs an observable, multi-layer monitoring topology ensuring continuous visibility into frontend client experience, backend API throughput, real-time WebSocket connectivity, and database health:

```
                 ChessVerse
                     │
        ┌────────────┼────────────┐
        ↓            ↓            ↓
     Frontend      Backend     Database
        │            │            │
        └────────────┼────────────┘
                     ↓
              Error Monitoring (Structured Logs & Categories)
                     │
                     ↓
               Health Checks (/health, /health/live, /health/ready)
                     │
                     ↓
              Admin Visibility (/api/admin/metrics & System Health)
```

### Core Monitoring Principles
1. **Zero Fabricated Metrics:** Telemetry reflects genuine system state (connected sockets, MongoDB ping latency, real active games). No fake "99.99%" marketing claims.
2. **Zero Sensitive Data Leaks:** Stack traces, MongoDB connection strings, JWT tokens, and player credentials are never exposed publicly or leaked in error responses.
3. **Server Authoritative Priority:** Gameplay and timing decisions remain strictly validated on the server; client disconnects or monitoring overhead never corrupts an active match.
4. **AI Isolation:** Failures or rate limits from external AI providers fall back seamlessly to local engine heuristics without interrupting active chess games.

---

## 2. Monitored Systems

| Component | Metrics & Signals Monitored | Frequency | Alert Threshold |
| :--- | :--- | :--- | :--- |
| **API Server** | Request volume (RPM), P95 response latency, error rate (% 4xx/5xx) | Continuous (Sliding window) | P95 > 500ms, Error rate > 5% |
| **MongoDB** | Connection status (`readyState`), Ping latency, query execution times | 10s intervals | Ping > 100ms or disconnected |
| **WebSockets** | Active sockets, room counts, disconnect grace timers, spectator count | Continuous | Rapid disconnect spikes |
| **Game Clocks** | Server-side clock decrements, timeout expiration, drift correction | 500ms loop | Player clock <= 0 |
| **Stockfish AI** | Web Worker thread pool availability, WASM execution errors | Per request | Thread failure / fallback |
| **External AI** | LLM request latency, rate limit status, timeout fallback engagement | Per request | Timeout > 5s (fallback triggers) |

---

## 3. Health Check Mechanism

The backend exposes three lightweight, unauthenticated health probes designed for load balancers, container orchestrators, and monitoring services:

### 3.1 Overall Component Health
- **Endpoint:** `GET /health` (or `GET /api/health`)
- **Status Codes:**
  - `200 OK` when MongoDB is connected (`readyState === 1`)
  - `503 Service Unavailable` when database is degraded or disconnected
- **Payload Structure:**
```json
{
  "status": "ok",
  "database": "ok",
  "redis": "memory_fallback",
  "websocket": "ok",
  "ai": "available",
  "version": "1.0.0",
  "uptimeSeconds": 1420,
  "memoryMb": 68
}
```

### 3.2 Liveness Probe
- **Endpoint:** `GET /health/live`
- **Purpose:** Verifies that the Node.js event loop is responsive and accepting connections.
- **Response:** `200 OK` with `{"status": "alive"}`.

### 3.3 Readiness Probe
- **Endpoint:** `GET /health/ready`
- **Purpose:** Verifies that external dependencies (MongoDB database connection pool) are initialized and ready to serve user traffic before routing incoming player requests.
- **Response:**
  - `200 OK` with `{"status": "ready"}`
  - `503 Service Unavailable` with `{"status": "not_ready", "reason": "Database connection not established"}`

---

## 4. Error Categorization & Sanitization

Production errors are intercepted centrally by `server/src/middleware/errorHandler.ts` and mapped to internal domain categories for debugging and alerting:

### Standardized Error Categories
- **`AUTH_ERROR`**: Invalid credentials, expired JWT tokens, missing session cookies, CSRF origin rejections, or unauthorized administrative access attempts.
- **`GAME_ERROR`**: Move validation rejections, illegal chess moves, out-of-turn play, draw dispute rejections, or missing game rooms.
- **`DATABASE_ERROR`**: MongoDB connection timeouts, unique index collisions (`E11000`), casting errors, or schema validation failures.
- **`WEBSOCKET_ERROR`**: Socket handshake failures, unexpected client disconnections, or room subscription drops.
- **`AI_ERROR`**: External LLM rate limits, invalid API keys, timeout fallbacks, or Stockfish engine worker termination.
- **`VALIDATION_ERROR`**: Malformed payload bodies, invalid FEN notations, missing required fields, or out-of-range parameters.
- **`SERVER_ERROR`**: Uncaught exceptions, memory exhaustion, or unexpected runtime failures.

### Production Error Sanitization
Clients receive safe, user-friendly responses. Internal details are stripped:
```json
{
  "success": false,
  "message": "Something went wrong. Please try again."
}
```
*Technical details, stack traces, and database error names remain restricted to server-side structured logs.*

---

## 5. Administrative Observability

Administrators access real-time telemetry through authenticated endpoints in the Admin Panel:

1. **`GET /api/admin/metrics`**:
   - Live authenticated users online (`userSockets.size`)
   - Live active games (`Game.countDocuments({ status: "playing" })`)
   - Real spectator count across rooms
   - Real-time P95 latency and request throughput
   - Subsystem operational status flags
   - Recent system alert stream from the in-memory error buffer
2. **`GET /api/admin/system/health`**:
   - Service latency breakdown (API, MongoDB ping, WebSockets, Stockfish engine, AI service)
3. **`GET /api/admin/system/errors`**:
   - Bounded ring buffer containing the last 50 sanitized system errors (timestamp, category, endpoint, status, message).
4. **`GET /api/admin/audit-logs`**:
   - Complete historical audit trail of administrative actions (suspensions, bans, setting changes, CSV exports) with admin ID, IP, and reason.

---

## 6. Real-Time Game Reliability & Reconnection Flow

A temporary network drop or mobile handover (Wi-Fi ↔ Cellular) must never corrupt an active chess match:

```
Network Lost
     ↓
Client Detects Disconnect (ConnectionIndicator: "Reconnecting...")
     ↓
Controlled Backoff Reconnect (1s initial, 16s max, 0.5 jitter)
     ↓
Re-authenticate with Fresh Token (socket.auth updated on reconnect_attempt)
     ↓
Authorize Game & Role via Server (player / spectator)
     ↓
Server Cancels 30s Disconnect Grace Window (emits player:reconnected)
     ↓
Fetch Authoritative Snapshot (game:rejoin -> game:state)
     ↓
Synchronize Board, Turn, Authoritative Clock, Move History
     ↓
Resume Active Gameplay (ConnectionIndicator: "Connected")
```

### Key Reliability Safeguards
- **30-Second Grace Window:** When a player disconnects, an authoritative 30-second timer begins. If the player returns within 30 seconds, the timer is cleared and the game resumes. If not, the opponent is awarded victory on timeout/forfeit.
- **Server-Authoritative Clocks:** Clocks are computed on the server based on `turnStartedAt` and elapsed milliseconds. Local browser `setInterval` timers only drive UI interpolation; timeout victory is decided strictly by the backend timeout loop (`server/src/socket/gameSocket.ts`).
- **Duplicate Event Protection:** Both client (`eventDeduplicator`) and server enforce sliding window sequence tracking and move rate limits (minimum 80ms interval) to reject duplicate submissions.
- **Memory Leak Protection:** Component unmount hooks in `useGameRoom.ts` and `ChessGame.tsx` explicitly detach all socket listeners via `socket.off(...)` and clear all countdown intervals.

---

## 7. Deployment Verification & Rollback Runbook

### Pre-Deployment Checklist
- [ ] Run full test suite: `npm test` (all 238+ unit and integration tests must pass)
- [ ] Verify root type-checking: `npx tsc --noEmit`
- [ ] Verify server compilation: `npm --prefix server run build`
- [ ] Verify Next.js production build: `npm run build`
- [ ] Verify environment variables are configured in `.env` (no missing keys)
- [ ] Confirm no secrets or `.env` files are tracked in git

### Post-Deployment Smoke Verification
1. Access `https://your-domain.com/health` → verify `200 OK` and `"status": "ok"`.
2. Access `https://your-domain.com/health/ready` → verify `200 OK` and `"status": "ready"`.
3. Open landing page → verify clean asset loading and absence of console errors.
4. Log in as a player → verify session cookie and JWT generation.
5. Create a match in `/play` → verify room creation and WebSocket connection.
6. Make a move on the board → verify move reception and clock start.
7. Open game URL in an incognito window → verify spectator mode loads live board without play permissions.
8. Disconnect network for 5 seconds → verify automatic reconnection and state rehydration.
9. Finish game via checkmate or resignation → verify match appears in profile history.
10. Check `/admin/monitoring` → verify live telemetry displays authentic active numbers.

### Rollback Procedure
If a critical failure is detected post-deployment (database connectivity failure, WebSocket crash loops, or corrupted move state):

```
Problem Detected
      ↓
Identify Affected Service (API, Socket, Database, or Frontend)
      ↓
Check Server Logs (Structured JSON error events)
      ↓
Check Recent Deployment (Git commit diff / configuration)
      ↓
Protect Active Games (Prevent destructive migrations or forced restarts)
      ↓
Initiate Rollback to Previous Stable Release
      ↓
Verify Health Endpoints (/health, /health/ready)
      ↓
Confirm Active Game Reconnection
```

1. **Revert Deployment:**
   - In container/platform host: Trigger rollback to the previous container image or deployment SHA.
   - Using Git:
     ```bash
     git revert HEAD --no-edit
     git push origin main
     ```
2. **Database Verification:**
   - ChessVerse database migrations are purely additive (adding indexes and non-breaking fields). No destructive schema drops are ever executed in production.
3. **Verify Restored Release:**
   - Execute the Post-Deployment Smoke Verification checklist immediately.

---

## 8. Incident Response Protocol

When an alert triggers or an issue is reported:

1. **Triage Severity:**
   - **Critical (P0):** Server down, database unreachable, or live matches failing to record moves.
   - **High (P1):** WebSocket reconnection loops or AI analysis unavailable.
   - **Medium (P2):** Slow API responses or minor cosmetic UI errors.
2. **Diagnosis:**
   - Inspect `/api/admin/system/errors` for recent categorized exceptions.
   - Filter logs by category: `grep '"category":"DATABASE_ERROR"' /path/to/logs`.
   - Inspect memory and connection pools via `/health`.
3. **Remediation:**
   - If AI fails: verify fallback is operating; chess games continue uninterrupted.
   - If MongoDB ping spikes: inspect index usage and query concurrency.
   - If WebSockets drop: restart backend worker process; clients will back off and re-synchronize automatically once restored.
