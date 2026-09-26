import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { eventDeduplicator } from "../../../src/lib/socket.js";
import { soundEngine } from "../../../src/lib/soundEngine.js";
import { User } from "../../../server/src/models/User.js";
import { Friendship } from "../../../server/src/models/Friendship.js";
import { Report } from "../../../server/src/models/Report.js";
import { AuditLog } from "../../../server/src/models/AuditLog.js";
import { Game } from "../../../server/src/models/Game.js";

const ROOT_DIR = path.resolve(process.cwd());

describe("ChessVerse R8: Performance & UX Acceptance (R8.1 - R8.84)", () => {
  // -------------------------------------------------------------
  // R8.14 - R8.17: Clock State Isolation & Timestamp Accuracy
  // -------------------------------------------------------------
  describe("R8.14 - R8.17: Clock Isolation & Precision", () => {
    it("confirms AuthoritativeClock component exists and isolates clock ticks from board state", () => {
      const clockPath = path.join(ROOT_DIR, "src", "components", "chess", "AuthoritativeClock.tsx");
      assert.ok(fs.existsSync(clockPath), "AuthoritativeClock component must exist");
      const content = fs.readFileSync(clockPath, "utf-8");

      assert.match(content, /serverTimestamp/);
      assert.match(content, /elapsed\s*=\s*now\s*-\s*turnStartRef\.current/);
      assert.match(content, /formatClockDisplay/);
      assert.match(content, /memo\(AuthoritativeClockComponent\)/);
    });

    it("confirms ChessGame component delegates clocks to AuthoritativeClock without root interval", () => {
      const gamePath = path.join(ROOT_DIR, "src", "components", "chess", "ChessGame.tsx");
      const content = fs.readFileSync(gamePath, "utf-8");

      assert.match(content, /<AuthoritativeClock/);
      // Confirms root setInterval countdown has been removed from ChessGame
      assert.doesNotMatch(content, /const timer = setInterval\(\(\) => \{[\s\S]*setClock/);
    });
  });

  // -------------------------------------------------------------
  // R8.18 - R8.20: Optimistic Move Execution & Server Authority
  // -------------------------------------------------------------
  describe("R8.18 - R8.20: Optimistic Moves & Authoritative Rollback", () => {
    it("confirms ChessGame executes moves optimistically with immediate visual response", () => {
      const gamePath = path.join(ROOT_DIR, "src", "components", "chess", "ChessGame.tsx");
      const content = fs.readFileSync(gamePath, "utf-8");

      assert.match(content, /const nextGame = new Chess\(game\.fen\(\)\)/);
      assert.match(content, /setGame\(nextGame\)/);
      assert.match(content, /soundEngine\.play/);
      assert.match(content, /eventId:/);
    });

    it("confirms ChessGame rolls back to authoritative FEN if move is rejected by server", () => {
      const gamePath = path.join(ROOT_DIR, "src", "components", "chess", "ChessGame.tsx");
      const content = fs.readFileSync(gamePath, "utf-8");

      assert.match(content, /authoritativeFenRef\.current = data\.fen/);
      assert.match(content, /handleRejected/);
      assert.match(content, /setGame\(new Chess\(authoritativeFenRef\.current\)\)/);
    });
  });

  // -------------------------------------------------------------
  // R8.27 - R8.29: WebSocket Reconnect & Event Deduplication
  // -------------------------------------------------------------
  describe("R8.27 - R8.29: WebSocket Resilience & Deduplication", () => {
    it("deduplicates identical event IDs using sliding buffer window", () => {
      eventDeduplicator.clear();

      const eventId = "game-101:e2:e4:1700000000";
      assert.equal(eventDeduplicator.isDuplicate(eventId), false, "First delivery must not be duplicate");
      assert.equal(eventDeduplicator.isDuplicate(eventId), true, "Second delivery of same eventId must be duplicate");
      assert.equal(eventDeduplicator.isDuplicate("game-101:e7:e5:1700000001"), false, "Different eventId must not be duplicate");
    });

    it("confirms socket client is configured with exponential backoff", () => {
      const socketPath = path.join(ROOT_DIR, "src", "lib", "socket.ts");
      const content = fs.readFileSync(socketPath, "utf-8");

      assert.match(content, /reconnection:\s*true/);
      assert.match(content, /reconnectionDelay:\s*1000/);
      assert.match(content, /reconnectionDelayMax:\s*16000/);
      assert.match(content, /randomizationFactor:\s*0\.5/);
    });
  });

  // -------------------------------------------------------------
  // R8.70: Sound Engine Performance & Audio Object Reuse
  // -------------------------------------------------------------
  describe("R8.70: Sound Engine Performance & Resource Reuse", () => {
    it("confirms soundEngine manages sound settings and toggle", () => {
      assert.equal(typeof soundEngine.isEnabled(), "boolean");
      assert.equal(typeof soundEngine.getSettings(), "object");

      soundEngine.setEnabled(false);
      assert.equal(soundEngine.isEnabled(), false);
      soundEngine.setEnabled(true);
      assert.equal(soundEngine.isEnabled(), true);
    });

    it("confirms SoundEngine uses audioCache to preload and reuse audio objects", () => {
      const soundPath = path.join(ROOT_DIR, "src", "lib", "soundEngine.ts");
      const content = fs.readFileSync(soundPath, "utf-8");

      assert.match(content, /private audioCache = new Map<SoundType, HTMLAudioElement>\(\)/);
      assert.match(content, /private preloadAudio\(\)/);
      assert.match(content, /audio\.currentTime = 0/);
    });
  });

  // -------------------------------------------------------------
  // R8.44: Database Compound Indexes
  // -------------------------------------------------------------
  describe("R8.44: Database Query Indexing", () => {
    it("verifies User schema indexes optimize leaderboard and admin lookups", () => {
      const indexes = User.schema.indexes();
      const hasRatingIndex = indexes.some((idx: any) => idx[0]?.rating === -1);
      const hasRoleStatusIndex = indexes.some((idx: any) => idx[0]?.role === 1 && idx[0]?.accountStatus === 1);

      assert.ok(hasRatingIndex, "User schema must index rating for leaderboard queries");
      assert.ok(hasRoleStatusIndex, "User schema must compound index role and accountStatus");
    });

    it("verifies Friendship schema indexes optimize social relations", () => {
      const indexes = Friendship.schema.indexes();
      const hasRequesterStatus = indexes.some((idx: any) => idx[0]?.requesterId === 1 && idx[0]?.status === 1);
      const hasRecipientStatus = indexes.some((idx: any) => idx[0]?.recipientId === 1 && idx[0]?.status === 1);

      assert.ok(hasRequesterStatus, "Friendship must compound index requesterId and status");
      assert.ok(hasRecipientStatus, "Friendship must compound index recipientId and status");
    });

    it("verifies Report schema indexes optimize moderation queries", () => {
      const indexes = Report.schema.indexes();
      const hasStatusCreated = indexes.some((idx: any) => idx[0]?.status === 1 && idx[0]?.createdAt === -1);

      assert.ok(hasStatusCreated, "Report must compound index status and createdAt");
    });

    it("verifies AuditLog schema indexes optimize audit compliance", () => {
      const indexes = AuditLog.schema.indexes();
      const hasTargetCreated = indexes.some((idx: any) => idx[0]?.targetType === 1 && idx[0]?.createdAt === -1);

      assert.ok(hasTargetCreated, "AuditLog must compound index targetType and createdAt");
    });
  });

  // -------------------------------------------------------------
  // R8.36 & R8.65 - R8.66: Touch, Layout & Motion Boundaries
  // -------------------------------------------------------------
  describe("R8.36 & R8.65 - R8.66: Touch, Motion & Layout Boundaries", () => {
    it("verifies global CSS defines prefers-reduced-motion media query (R8.36)", () => {
      const cssPath = path.join(ROOT_DIR, "src", "app", "globals.css");
      const css = fs.readFileSync(cssPath, "utf-8");

      assert.match(css, /@media\s*\(prefers-reduced-motion:\s*reduce\)/);
      assert.match(css, /animation-duration:\s*0\.01ms/);
    });

    it("verifies board container applies touch-none to prevent accidental mobile scroll (R8.66)", () => {
      const gamePath = path.join(ROOT_DIR, "src", "components", "chess", "ChessGame.tsx");
      const content = fs.readFileSync(gamePath, "utf-8");

      assert.match(content, /touch-none/);
      assert.match(content, /aspect-square/);
    });

    it("verifies game room buttons enforce >= 44px touch targets on mobile (R8.65)", () => {
      const gamePath = path.join(ROOT_DIR, "src", "components", "chess", "ChessGame.tsx");
      const content = fs.readFileSync(gamePath, "utf-8");

      assert.match(content, /min-h-\[44px\]/);
    });
  });

  // -------------------------------------------------------------
  // R8.40: Chess Engine Isolation (Web Worker)
  // -------------------------------------------------------------
  describe("R8.40: Chess Engine Worker Isolation", () => {
    it("verifies Stockfish engine executes in a dedicated Web Worker off the main UI thread", () => {
      const enginePath = path.join(ROOT_DIR, "src", "lib", "stockfish.ts");
      const content = fs.readFileSync(enginePath, "utf-8");

      assert.match(content, /new Worker\(/);
      assert.match(content, /this\.worker\.onmessage/);
    });
  });

  // -------------------------------------------------------------
  // R8.58 & R8.59: Offline Detection & Network Recovery
  // -------------------------------------------------------------
  describe("R8.58 & R8.59: Offline Detection & Network Recovery", () => {
    it("verifies ConnectionBanner handles offline, reconnecting, and synchronized states", () => {
      const bannerPath = path.join(ROOT_DIR, "src", "components", "ui", "ConnectionBanner.tsx");
      const content = fs.readFileSync(bannerPath, "utf-8");

      assert.match(content, /window\.addEventListener\("offline"/);
      assert.match(content, /window\.addEventListener\("online"/);
      assert.match(content, /You(&apos;|')re offline/);
      assert.match(content, /Connection restored\. Syncing game\.\.\./);
      assert.match(content, /Game synchronized/);
    });
  });
});
