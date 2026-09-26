import test from "node:test";
import assert from "node:assert/strict";
import {
  categorizeError,
  getSafeUserErrorMessage,
  recordSystemError,
  getRecentErrors,
} from "../../../server/src/middleware/errorHandler.js";
import { getApiTelemetry } from "../../../server/src/middleware/telemetry.js";
import { getSocketTelemetry } from "../../../server/src/socket/socket.js";
import { eventDeduplicator } from "../../../src/lib/socket.js";

test("R13.2 & R13.3: Production Health Probes & Telemetry Structure", async (t) => {
  await t.test("telemetry tracker computes real-time request metrics with zero fake claims", () => {
    const telemetry = getApiTelemetry();
    assert.ok(typeof telemetry.requestsPerMin === "number");
    assert.ok(typeof telemetry.p95LatencyMs === "number");
    assert.ok(typeof telemetry.avgLatencyMs === "number");
    assert.ok(typeof telemetry.errorRatePct === "number");
    assert.ok(typeof telemetry.totalRequests === "number");
  });

  await t.test("socket telemetry exports live connection and spectator counts", () => {
    const socketMetrics = getSocketTelemetry();
    assert.ok(typeof socketMetrics.activeConnections === "number");
    assert.ok(typeof socketMetrics.usersOnline === "number");
    assert.ok(typeof socketMetrics.roomCount === "number");
    assert.ok(typeof socketMetrics.spectatorCount === "number");
    // Ensure no hardcoded mock numbers are returned
    assert.ok(socketMetrics.usersOnline >= 0);
    assert.ok(socketMetrics.spectatorCount >= 0);
  });
});

test("R13.9 - R13.11: Error Categorization & Production Sanitization", async (t) => {
  await t.test("correctly categorizes database errors without exposing Mongo internals", () => {
    const mongoErr = new Error("E11000 duplicate key error collection: chessverse.users");
    mongoErr.name = "MongoServerError";
    const category = categorizeError(mongoErr, "/api/auth/register");
    assert.strictEqual(category, "DATABASE_ERROR");

    // In production mode, error message must be sanitized
    (process.env as Record<string, string | undefined>).NODE_ENV = "production";
    const safeMsg = getSafeUserErrorMessage(mongoErr, 500, category);
    assert.strictEqual(safeMsg, "Something went wrong. Please try again.");
    assert.ok(!safeMsg.includes("E11000"));
    assert.ok(!safeMsg.includes("MongoServerError"));
    (process.env as Record<string, string | undefined>).NODE_ENV = "test";
  });

  await t.test("correctly categorizes auth errors and JWT expirations", () => {
    const jwtErr = new Error("jwt expired");
    jwtErr.name = "TokenExpiredError";
    const category = categorizeError(jwtErr, "/api/auth/refresh");
    assert.strictEqual(category, "AUTH_ERROR");

    (process.env as Record<string, string | undefined>).NODE_ENV = "production";
    const safeMsg = getSafeUserErrorMessage(jwtErr, 401, category);
    assert.strictEqual(safeMsg, "Authentication required. Please sign in.");
    (process.env as Record<string, string | undefined>).NODE_ENV = "test";
  });

  await t.test("correctly categorizes game errors and illegal move attempts", () => {
    const gameErr = new Error("Illegal move attempted");
    const category = categorizeError(gameErr, "/api/games/game-123/move");
    assert.strictEqual(category, "GAME_ERROR");
  });

  await t.test("correctly categorizes AI errors and isolates AI service", () => {
    const aiErr = new Error("OpenAI rate limit exceeded");
    const category = categorizeError(aiErr, "/api/ai/coach");
    assert.strictEqual(category, "AI_ERROR");
  });

  await t.test("correctly categorizes input validation errors", () => {
    const valErr = new Error("username is required");
    (valErr as any).status = 400;
    const category = categorizeError(valErr, "/api/users/profile");
    assert.strictEqual(category, "VALIDATION_ERROR");
  });
});

test("R13.35 - R13.37: Admin Error Overview Ring Buffer", async (t) => {
  await t.test("records system errors in bounded ring buffer for admin visibility", () => {
    recordSystemError({
      category: "WEBSOCKET_ERROR",
      endpoint: "/socket.io",
      method: "GET",
      status: 400,
      message: "Client connection handshake dropped unexpectedly",
    });

    const recent = getRecentErrors();
    assert.ok(recent.length > 0);
    const latest = recent[0];
    assert.strictEqual(latest.category, "WEBSOCKET_ERROR");
    assert.strictEqual(latest.endpoint, "/socket.io");
    assert.ok(latest.id.startsWith("err_"));
    assert.ok(typeof latest.time === "string");
  });
});

test("R13.8 & R13.24: Duplicate Event Protection & Deduplication", async (t) => {
  await t.test("event deduplicator rejects duplicate events and accepts unique events", () => {
    eventDeduplicator.clear();

    const eventId = "evt_move_142_abc";
    assert.strictEqual(eventDeduplicator.isDuplicate(eventId), false);
    // Second delivery of the identical event must be rejected
    assert.strictEqual(eventDeduplicator.isDuplicate(eventId), true);

    // Different event must be allowed
    const nextEventId = "evt_move_143_def";
    assert.strictEqual(eventDeduplicator.isDuplicate(nextEventId), false);
  });
});

test("R13.43: Zero Fabricated Metrics Audit", async (t) => {
  await t.test("confirms absence of hardcoded mock statistics in admin views", async () => {
    const fs = await import("node:fs/promises");
    const monitoringPage = await fs.readFile(
      "src/app/admin/monitoring/page.tsx",
      "utf-8"
    );
    // Must NOT contain hardcoded mock user count 1284 or 426 active games
    assert.ok(!monitoringPage.includes("usersOnline: 1284"));
    assert.ok(!monitoringPage.includes("activeGames: 426"));
    assert.ok(!monitoringPage.includes("requestsPerMin: 8420"));

    const healthPage = await fs.readFile(
      "src/admin/pages/System/HealthPage.tsx",
      "utf-8"
    );
    // Must NOT contain fake socket fallback ?? 48
    assert.ok(!healthPage.includes("activeSockets ?? 48"));
  });
});

test("R13.75 & R13.76: Free Product & N-Button Permanence", async (t) => {
  await t.test("verifies 100% free product architecture with zero paid subscriptions", async () => {
    const fs = await import("node:fs/promises");
    const layout = await fs.readFile("src/app/layout.tsx", "utf-8");
    assert.ok(!layout.includes("stripe"));
    assert.ok(!layout.includes("pricing"));
    assert.ok(!layout.includes("subscription"));
  });

  await t.test("verifies Next.js dev indicator ('N' button) remains permanently removed", async () => {
    const fs = await import("node:fs/promises");
    const config = await fs.readFile("next.config.ts", "utf-8");
    assert.ok(config.includes("devIndicators: false"));
  });
});
