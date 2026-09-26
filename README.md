# ChessVerse — Real-Time Multiplayer Chess Platform

> A full-stack, real-time multiplayer chess web application engineered for playing live matches with friends, analyzing positions with off-thread AI, and managing platform operations through a server-authoritative administrative dashboard. 100% free with zero paywalls.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-16.3.5-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2.8-blue?logo=react)](https://react.dev/)
[![Express](https://img.shields.io/badge/Express-5.2.1-lightgrey?logo=express)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose%209.10-green?logo=mongodb)](https://www.mongodb.com/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-4.8.3-black?logo=socket.io)](https://socket.io/)
[![Stockfish](https://img.shields.io/badge/Stockfish-18%20WASM-orange?logo=chess)](https://stockfishchess.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## Project Metadata

- **Project Title:** ChessVerse — Real-Time Multiplayer Chess Platform
- **Repository Description:** Full-stack real-time multiplayer chess web application built with Next.js 16, Express 5, Socket.IO, MongoDB, and Stockfish 18 WASM. Features server-authoritative move validation, resilient state recovery, spectator mode, and role-based administrative control.
- **GitHub Topics:** `chess`, `real-time`, `websockets`, `socketio`, `nextjs`, `react`, `typescript`, `express`, `mongodb`, `stockfish`, `web-workers`, `multiplayer-game`
- **Concise Summary:** A high-performance, real-time chess platform prioritizing responsive gameplay, server-authoritative game state management, and accessible competitive features with zero commercial bloat.

---

## Table of Contents

- [Live Demo](#live-demo)
- [Project Overview](#project-overview)
- [Production Architecture](#production-architecture)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Real-Time Architecture](#real-time-architecture)
- [Multiplayer Gameplay](#multiplayer-gameplay)
- [Spectator Mode](#spectator-mode)
- [AI Features](#ai-features)
- [Admin Panel](#admin-panel)
- [Authentication & Security](#authentication--security)
- [Reconnection Handling](#reconnection-handling)
- [Performance & UX](#performance--ux)
- [Responsive Design](#responsive-design)
- [Installation & Setup](#installation--setup)
- [Environment Variables](#environment-variables)
- [Running Locally](#running-locally)
- [Production Deployment Guide](#production-deployment-guide)
- [Project Structure](#project-structure)
- [Testing & Quality Assurance](#testing--quality-assurance)
- [Future Improvements](#future-improvements)

---

## Live Demo

- **Production URL:** [ChessVerse Web](https://chessverse.app) *(Configured for deployment with auto-reconnection and WSS)*
- **API Health Endpoint:** `https://api.chessverse.app/health`

---

## Project Overview

ChessVerse is a modern full-stack web application designed for friends who want to play chess online together in a distraction-free, aesthetically refined environment. Built from the ground up to showcase clean distributed systems engineering, the platform replaces generic SaaS templates with a human-crafted design language, low-latency WebSocket communication, and robust server-side security.

Every player-facing feature—including matchmaking, private rooms, clock customisation, AI analysis, tactics puzzles, and visual board themes—is completely free, without subscription plans, pricing tiers, or artificial restrictions.

---

## Production

ChessVerse is designed around:
- Real-time multiplayer gameplay
- Server-authoritative game state
- WebSocket communication
- Reconnection handling
- Spectator mode
- AI-assisted analysis
- Administrative controls

---

## Production Architecture

The platform architecture decouples the static frontend edge delivery from the stateful, real-time WebSocket and chess engine server:

```
                    ♟ CHESSVERSE
                         │
              ┌──────────┴──────────┐
              ↓                     ↓
         Frontend                Backend
      (Next.js App)           (Express 5)
              │                     │
              │               REST + WebSocket (WSS)
              │                     │
              └──────────┬──────────┘
                         ↓
                     Database
                  (MongoDB)
                         │
                         ↓
                    AI Service
              (Stockfish 18 / LLM)
```

### Component Hierarchy & Responsibilities

```
Frontend (Next.js 16 + React 19)
   │
   ├── REST API (Stateless Authentication, Profiles, History, Announcements)
   │
   └── WebSocket (Stateful Real-Time Game Rooms, Move Sync, Presence)
          │
          ↓
       Backend (Node.js + Express 5 + Socket.IO)
          │
          ├── Chess Logic & Validation (chess.js rule enforcement)
          ├── Server-Authoritative Clocks (drift-free countdowns)
          ├── Authentication & RBAC (JWT + MongoDB/Redis Sessions)
          ├── AI Analysis & Coach (Off-thread Stockfish 18 + LLM)
          └── Administrative Moderation & Telemetry
          │
          ↓
       Database (MongoDB Atlas / Production Cluster)
          ├── Users, Profiles, progression, friendships
          ├── Game records, move logs, telemetry, audit logs
          └── Pre-computed indexes on frequently queried keys
```

---

## Key Features

- **Real-Time Multiplayer:** Play live chess against friends or match with players using standard time controls (Bullet, Blitz, Rapid, Classical).
- **Authoritative Chess Clocks:** Server-side millisecond timestamp calculation with increment support and drift compensation.
- **Live Spectator Mode:** Spectators can observe active games with real-time viewer counters and move broadcasts without having permission to alter board state.
- **Off-Thread Stockfish 18 Engine:** Full position evaluation, blunder detection, and best-move recommendations executed in dedicated browser Web Workers.
- **Interactive Move Review & PGN Export:** Move-by-move navigation, captured piece differential, and standard PGN/FEN copying.
- **Tactics Puzzles:** Curated chess puzzles with immediate interactive validation and rating progression.
- **Social & Presence:** Multi-state friendship model (pending, accepted, blocked), direct friend challenges, and live online/in-game status indicators.
- **Free Theme Studio:** Customise board wood grains, stone textures, and piece sets with zero locked options.
- **Administrative Control Panel:** Role-based access control (RBAC) dashboard for server telemetry, user management, game moderation, and audit logs.

---

## Tech Stack

### Frontend
- **Framework:** Next.js 16.3.5 (App Router, Turbopack, React Compiler)
- **Library:** React 19.2.8
- **Language:** TypeScript 5.x
- **Styling:** Tailwind CSS 4.x with custom design tokens (`tokens.css`)
- **Chess Components:** `react-chessboard` (5.12.1) & `chess.js` (1.4.0)
- **Engine Analysis:** Stockfish 18 WASM running in dedicated Web Workers
- **Icons & Animation:** `lucide-react`, `framer-motion`

### Backend
- **Runtime:** Node.js (ES Modules)
- **Server Framework:** Express 5.2.1
- **Real-Time Transport:** Socket.IO 4.8.3
- **Database:** MongoDB & Mongoose 9.10.0
- **Cache & Presence:** Redis (`ioredis` 6.0.0)
- **Security & Headers:** `helmet`, `bcryptjs`, `jsonwebtoken`, `cookie-parser`, `express-rate-limit`, `zod`

---

## Real-Time Architecture

ChessVerse strictly follows a **server-authoritative** real-time pipeline. While the client renders optimistic move feedback for an instant feel, the backend WebSocket gateway and chess engine determine the valid state of the game.

### Move Execution & Validation Flow

```
Player A
   │
   ▼
WebSocket Server (Socket.IO)
   │
   ▼
Authentication / Authorization (Session Cookie & Role Verification)
   │
   ▼
Chess Move Validation (chess.js against authoritative server FEN)
   │
   ▼
Game State Update (Turn toggle, clock calculation, move list append)
   │
   ▼
Persistence (MongoDB atomic save / Redis cache update)
   │
   ▼
Broadcast (Socket room event emission)
   │
   ├───────────────────────────────┐
   ▼                               ▼
Player B (Move + Clock Sync)   Spectators (Read-Only Move Broadcast)
```

1. **Player A** drops a piece. The client executes an optimistic UI transition and emits `game:move` with `{ gameId, from, to, promotion }`.
2. The **WebSocket Server** intercepts the event, validates the sender's socket session, and checks rate limits (80ms throttle).
3. The server validates that Player A is an active participant in this game (not a spectator) and that it is Player A's turn.
4. The server runs **Chess Move Validation** using `chess.js` against the canonical server FEN. If invalid, the move is rejected and the client rolls back.
5. The server calculates remaining clock time, deducts turn elapsed time, adds increment, and advances turn.
6. The updated state is **persisted to MongoDB** and cached.
7. The move payload and updated game snapshot are **broadcast** to both players and all connected spectators.

---

## Multiplayer Gameplay

- **Private & Public Rooms:** Create custom rooms with 6-character room codes or shareable direct invitation URLs.
- **Time Controls:** Flexible initial times (1 min to 30 min) and increment bonuses (0s to 10s).
- **Draw Offers & Resignations:** Authoritative mutual draw agreements and 2-step resignation confirmations to prevent accidental forfeits.
- **Mutual Rematches:** Rematch offers require mutual acceptance, automatically reversing piece colors and resetting clocks.

---

## Spectator Mode

Spectators can watch live matches in real time without creating account conflicts or performance degradation:

- **Strict Privilege Separation:** Spectator socket connections join the game room in read-only mode.
- **Security Boundary:** Any move, resign, or draw event sent by a spectator socket is rejected server-side with an unauthorized error.
- **Live Viewer Count:** Spectator counts update dynamically via room join/leave events.

---

## AI Features

ChessVerse features integrated chess intelligence designed to enhance learning without turning the application into an AI demo:

- **Client-Side Stockfish 18 WASM:** Runs entirely inside dedicated browser Web Workers, computing centipawn evaluation, mate lines, and tactical blunders without blocking the UI.
- **Contextual Chess Coach:** Provides human-readable move explanations, identifying mistakes, missed tactics, and positional ideas.
- **Tactics Generator:** Automated puzzle challenges with interactive step-by-step solving and rating progression.

---

## Admin Panel

The administrative panel is a private, role-gated control center for platform operations:

- **Server-Side Authorization:** Admin routes (`/api/admin/*`) require server-side authentication (`requireAuth`) and admin role verification (`requireAdmin`). Frontend role gating is strictly for UX.
- **Platform Telemetry:** Monitor active WebSocket connections, CPU usage, database status, and memory consumption.
- **User Moderation:** Search users, inspect match histories, issue suspensions, or review fair-play reports.
- **Audit Logging:** Every administrative action is logged with IP address, user agent, target ID, and reason for accountability.

---

## Authentication & Security

- **Session Management:** Secure HTTP-only cookies paired with Redis session caching and cryptographic token hashing.
- **Password Security:** Salted `bcryptjs` hashing with 10 rounds.
- **Input Validation:** Strict `zod` schemas for all REST endpoints and WebSocket payloads.
- **CSRF & Origin Verification:** Enforces strict origin checking on cookie-authenticated mutations.
- **Rate Limiting:** Protects auth endpoints, social interactions, and socket events against denial-of-service and brute force.

---

## Reconnection Handling

Mobile connections and public Wi-Fi frequently drop packets. ChessVerse includes automated state recovery to ensure games are not lost to transient network drops.

### Reconnect Flow Diagram

```
Disconnect (Socket disconnect detected)
   │
   ▼
Reconnect (Client establishes new socket connection)
   │
   ▼
Authentication (Session token validated during handshake)
   │
   ▼
Request Latest Game State (Client emits "game:rejoin" or "game:sync")
   │
   ▼
Synchronize (Server clears disconnect timer & sends authoritative snapshot)
   │
   ▼
Resume Game (Clocks re-anchor and board resumes seamlessly)
```

- **30-Second Grace Window:** When a player disconnects, a 30-second disconnect timer is initiated and the opponent is notified.
- **Grace Cancellation:** If the player reconnects within 30 seconds, the timer is cleared and the game continues normally.
- **Snapshot Recovery:** The server rehydrates the client with the full board snapshot (current FEN, remaining clock milliseconds, last move, and move history).

---

## Performance & UX

- **Isolated Clocks:** Chess clocks calculate time deltas server-side and tick client-side via high-precision `requestAnimationFrame`, preventing expensive parent re-renders.
- **Audio Preloading:** Sound effects (move, capture, check, castle) are preloaded and reused via an in-memory `audioCache`.
- **WASM Worker Offloading:** Stockfish computations run off the main event loop, maintaining a consistent 60fps UI.
- **Zero AI Dev Artifacts:** Next.js development indicator ("N" button) is permanently suppressed.

---

## Responsive Design

ChessVerse is engineered with a mobile-first philosophy:

- **Touch Prevention:** Board containers enforce `touch-action: none` to eliminate accidental browser pull-to-refresh or swipe-scrolling during piece dragging.
- **Adaptive Board Sizing:** Board dimensions automatically scale to viewport dimensions across Mobile Portrait (iPhone), Mobile Landscape, Tablet (iPad), and Desktop monitors.
- **Accessible Touch Targets:** All interactive controls enforce minimum touch-target boundaries (>= 44px).

---

## Installation & Setup

### Prerequisites
- **Node.js:** v20.x or higher
- **MongoDB:** v6.x or higher (local or MongoDB Atlas)
- **Redis:** (Optional for local dev; in-memory fallback enabled)

### Step 1: Clone the Repository
```bash
git clone https://github.com/dharm/chessverse.git
cd chessverse
```

### Step 2: Install Dependencies
```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd server
npm install
cd ..
```

---

## Environment Variables

Copy the provided template configuration files (variable names only, never commit real secrets):

```bash
# Root environment configuration
cp .env.example .env.local

# Server environment configuration
cp server/.env.example server/.env
```

### Root `.env.example`
```env
PORT=
NODE_ENV=
CLIENT_URL=
NEXT_PUBLIC_API_URL=
NEXT_PUBLIC_SOCKET_URL=
DATABASE_URL=
MONGODB_URI=
REDIS_URL=
JWT_SECRET=
SESSION_SECRET=
SESSION_EXPIRY_DAYS=
OPENAI_API_KEY=
AI_MODEL=
STOCKFISH_PATH=
LOG_LEVEL=
```

### Server `server/.env.example`
```env
PORT=
NODE_ENV=
CLIENT_URL=
DATABASE_URL=
MONGODB_URI=
REDIS_URL=
JWT_SECRET=
SESSION_SECRET=
SESSION_EXPIRY_DAYS=
OPENAI_API_KEY=
AI_MODEL=
STOCKFISH_PATH=
LOG_LEVEL=
```

---

## Running Locally

### 1. Seed Demo Data (Local Development & QA)
Populate safe, pre-configured accounts with ratings, mutual friendships, and sample game history:
```bash
npm run seed:demo
```

**Local Testing Accounts:**
| Role | Username | Password | Rating |
| :--- | :--- | :--- | :--- |
| **Player 1** | `demo_player1` | `Demo1234!` | 1540 |
| **Player 2** | `demo_player2` | `Demo1234!` | 1515 |
| **Spectator** | `demo_spectator` | `Demo1234!` | 1480 |

> **Administrator Account Hygiene:** In accordance with production security standards (R12.14), production administrator credentials are never committed to source files or documentation. To create or promote a controlled administrator account, run:
> ```bash
> npm run create:admin -- <username> <email> <password>
> ```

### 2. Start Backend Server
```bash
cd server
npm run dev
# Server runs on http://localhost:4000
```

### 3. Start Frontend Application
In a separate terminal:
```bash
npm run dev
# Frontend runs on http://localhost:3000
```

---

## Production Deployment Guide

Follow the recommended backend-first deployment order (R12.16):

### 1. Production Database (MongoDB Atlas)
1. Provision a dedicated MongoDB cluster named `chessverse-production`.
2. Retrieve your secure connection string: `mongodb+srv://<user>:<password>@cluster.mongodb.net/chessverse-production`.
3. Verify network access allows connection from your server's IP range or VPC.
4. Mongoose automatically initializes query indexes on startup (`User`, `Game`, `Room`, `Friendship`, `Challenge`, `Notification`, `Session`).

### 2. Backend Deployment (Render / Railway / Fly.io / VPS)
1. Deploy the `server/` directory as a Node.js web service.
2. Build command: `npm run build`
3. Start command: `npm start`
4. Set production environment variables in your hosting provider's dashboard:
   - `NODE_ENV=production`
   - `PORT=4000` (or provider's default)
   - `DATABASE_URL=mongodb+srv://...`
   - `CLIENT_URL=https://chessverse.app` *(or comma-separated allowed origins)*
   - `JWT_SECRET=<64-character-random-hex-string>`
   - `SESSION_SECRET=<64-character-random-secret>`
   - `OPENAI_API_KEY=<your-key>`
5. Verify health: `GET https://your-backend.com/health` returns `{"status":"ok","database":"ok"}`.

### 3. Production Admin Account Setup
Once the backend is connected to your production database, securely provision your administrator:
```bash
npm --prefix server run create:admin -- <admin_username> <admin_email> <strong_password>
```

### 4. Frontend Deployment (Vercel / Netlify / Cloudflare Pages)
1. Deploy the root repository to your frontend hosting platform.
2. Build command: `npm run build`
3. Configure environment variables in the project settings:
   - `NEXT_PUBLIC_API_URL=https://your-backend.com`
   - `NEXT_PUBLIC_SOCKET_URL=https://your-backend.com`
4. Verify DNS and HTTPS certificates are provisioned.
5. Secure WebSockets connect over `wss://` automatically when the host is served over HTTPS.

---

## Project Structure

```
chessverse/
├── src/
│   ├── app/                      # Next.js App Router pages
│   │   ├── admin/                # Role-gated admin control center
│   │   ├── analysis/             # Stockfish WASM analysis board
│   │   ├── coach/                # AI Coach interactive review
│   │   ├── friends/              # Friends list & direct challenges
│   │   ├── games/                # Match history & PGN review
│   │   ├── leaderboard/          # Global player rankings
│   │   ├── play/                 # Matchmaking lobby
│   │   ├── profile/              # Player profiles & match milestones
│   │   ├── puzzles/              # Tactics puzzles
│   │   ├── room/[roomId]/        # Real-time game room
│   │   ├── theme-studio/         # Free theme customisation
│   │   └── watch/                # Live spectator directory
│   ├── components/               # Modular UI components
│   │   ├── admin/                # Admin panels & audit tables
│   │   ├── ai/                   # AI chat & move evaluation
│   │   ├── chess/                # Chessboard, clocks, move list
│   │   ├── navigation/           # Desktop & mobile navigation
│   │   └── ui/                   # Design system primitives (Button, Badge, Modal)
│   ├── hooks/                    # Reusable React hooks (useGameRoom, useTheme)
│   ├── lib/                      # API client, sound engine, socket client
│   └── styles/                   # Design tokens & global CSS
├── server/
│   ├── src/
│   │   ├── middleware/           # Auth, admin RBAC, rate-limiting, CSRF
│   │   ├── models/               # Mongoose schemas (User, Game, Room, AuditLog)
│   │   ├── routes/               # REST API endpoints (auth, games, admin)
│   │   ├── scripts/              # Seed scripts (seedDemo.ts) & backups
│   │   ├── services/             # Chess engine, clocks, ELO, Redis
│   │   └── socket/               # Socket.IO game handlers & event routers
├── tests/
│   ├── unit/                     # UI components, design tokens, ELO rating
│   ├── integration/              # Auth flows, game lifecycle, room security
│   ├── e2e/                      # Real-time synchronization, clocks, mobile layout
│   └── load/                     # Concurrency stress tests
└── docs/
    └── PORTFOLIO_GUIDE.md        # Technical interview guide & resume bullets
```

---

## Testing & Quality Assurance

ChessVerse includes a comprehensive automated test suite covering unit logic, integration flows, and end-to-end real-time game synchronization.

```bash
# Run all automated tests
npm test

# Run unit tests only
npm run test:unit

# Run integration tests
npm run test:integration

# Run e2e real-time tests
npm run test:e2e

# Run production build validation
npm run build
```

---

## Future Improvements

- [ ] Support for Chess960 (Fischer Random Chess) position generation.
- [ ] Tournament brackets (Swiss-system and single-elimination).
- [ ] WebRTC peer audio channel for friendly in-game voice chat.
- [ ] Voice move input using Web Speech API for accessibility.

---

## Author & Contact

Built with passion for chess and high-performance web engineering.  
Feel free to open an issue or connect on LinkedIn for feedback and technical discussions!
