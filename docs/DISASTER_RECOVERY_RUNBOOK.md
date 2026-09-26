# ChessVerse Disaster Recovery Runbook

**Service**: ChessVerse Production Cluster  
**Classification**: Mission-Critical Operations  
**Target RPO (Recovery Point Objective)**: ≤ 15 minutes  
**Target RTO (Recovery Time Objective)**: ≤ 60 minutes  

---

## 1. Architecture & Backup Strategy

```
                MONGODB ATLAS PRIMARY
                          │
                          ↓
               Automated Daily Snapshot
                + Continuous Oplog PITR
                          │
            ┌─────────────┴─────────────┐
            ↓                           ↓
      Daily Backup               PITR Replay
   (AES-256-GCM Encrypted)     (To Point in Time)
            │                           │
            └─────────────┬─────────────┘
                          ↓
                 Cloud Object Storage
               (AWS S3 / GCP Cloud Storage)
               (Bucket Lock / WORM enabled)
```

### Essential Data Sets
* **Users**: Credentials, verification status, profiles, roles, ratings (`ratings.rapid`, `ratings.blitz`, etc.).
* **Games**: Move sequences, canonical FENs, clocks, termination outcomes, rating deltas.
* **Game Analysis & Telemetry**: Stockfish evals, accuracy scores, fair-play telemetry.
* **Social**: Friendships, direct messages, active notifications.
* **Puzzles & Training**: Daily puzzles, user progression, weakness detector history.
* *Note*: Redis memory state is ephemeral and safely reconstructable upon startup.

---

## 2. Emergency Incident Runbook (12 Steps)

### Step 1: Detect Incident & Confirm Outage
- **Triggers**: Cloud alerts, `/health/ready` reporting HTTP 503, database connectivity timeouts, or data corruption detected.
- Confirm outage status via operational monitoring dashboard at `/admin/monitoring`.

### Step 2: Declare Disaster State & Assemble Team
- Notify On-Call Engineer, Database Admin, and Operations Lead.
- Open dedicated incident triage channel.

### Step 3: Isolate Writes & Protect Remaining Data
- Put the API Gateway into maintenance mode:
  ```bash
  # Redirect traffic to maintenance standby page
  kubectl scale deployment chessverse-web --replicas=0
  ```
- Terminate write operations to prevent further state divergence.

### Step 4: Provision Target Database Cluster
- If hardware or provider failure occurred, spin up standby MongoDB Atlas cluster or restore target.
- Verify connectivity using `mongosh` or `DATABASE_URL`.

### Step 5: Restore Database From Encrypted Backup
- Download latest verified backup archive from secure cold storage.
- Execute automated decryption and restoration script:
  ```bash
  npx tsx server/src/scripts/restore.ts --backup backups/chessverse-backup-latest.enc.json
  ```

### Step 6: Verify Database Integrity & Checksums
- Inspect record counts against metadata manifest:
  - Users collection count matches expected baseline.
  - Games and move sequences parse correctly with `chess.js`.
  - SHA-256 backup package checksum validates successfully.

### Step 7: Rehydrate Redis Cache & Matchmaking State
- Flush stale keys in Redis:
  ```bash
  redis-cli FLUSHDB
  ```
- Allow cache warm-up; leaderboard and session keys will automatically regenerate via lazy write-through.

### Step 8: Verify WebSocket Cluster Health
- Start WebSocket service instances.
- Verify socket ping/pong latency and room namespace segregation (`game:{id}`).

### Step 9: Validate Authentication & Session Security
- Run automated integration verification:
  ```bash
  npx tsx --test tests/integration/auth/authFlow.test.ts
  ```
- Confirm users can authenticate and new sessions are created without errors.

### Step 10: Run End-to-End Game Flow Smoke Test
- Run real-time chess E2E tests against the restored cluster:
  ```bash
  npx tsx --test tests/e2e/game/twoPlayerGame.test.ts
  ```
- Assert that moves are accepted, clocks tick, and games complete cleanly.

### Step 11: Re-Enable Production Traffic
- Re-route ingress / load balancer to live application pods:
  ```bash
  kubectl scale deployment chessverse-web --replicas=3
  ```
- Verify `/health/ready` returns HTTP 200.

### Step 12: Post-Incident Review & Root-Cause Analysis (RCA)
- Monitor error rates on `/admin/monitoring` for 2 hours post-recovery.
- Compile incident timeline, root cause, data delta (if any within RPO window), and mitigation steps.

---

## 3. Disaster Recovery Verification Checklist

- [ ] Automated backup executed daily and encrypted with AES-256-GCM.
- [ ] Backup encryption key stored securely in cloud key vault (never committed to repository).
- [ ] Restore test performed in staging environment at least quarterly.
- [ ] RPO within 15 minutes verified.
- [ ] RTO within 60 minutes verified.
