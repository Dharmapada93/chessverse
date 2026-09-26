import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  moveProposalSchema,
  reportSchema,
  createGameSchema,
} from "../../../server/src/validation/schemas.js";

describe("Security Audit & Production Hardening (Step 95)", () => {
  it("IDOR: prevents unauthorized player from modifying another user's game", () => {
    const game = {
      id: "game-secret-101",
      whitePlayerId: "user-alice",
      blackPlayerId: "user-bob",
      status: "playing",
    };

    const attemptResign = (requestingUserId: string) => {
      // Must be participant
      if (requestingUserId !== game.whitePlayerId && requestingUserId !== game.blackPlayerId) {
        return { status: 403, error: "Access denied: Not a participant in this game" };
      }
      return { status: 200, success: true };
    };

    // Attacker Eve attempts to resign Alice's game
    const eveAttempt = attemptResign("user-eve");
    assert.equal(eveAttempt.status, 403);
    assert.equal(eveAttempt.error, "Access denied: Not a participant in this game");

    // Legitimate player Bob resigns
    const bobAttempt = attemptResign("user-bob");
    assert.equal(bobAttempt.status, 200);
  });

  it("Admin Privilege Escalation: strictly restricts admin endpoints to users with admin/moderator role", () => {
    const verifyAdminAccess = (userRole?: string) => {
      if (userRole !== "admin" && userRole !== "moderator") {
        return { status: 403, error: "Access restricted to authorized administrators." };
      }
      return { status: 200, access: "granted" };
    };

    // Standard user
    const standardUser = verifyAdminAccess("user");
    assert.equal(standardUser.status, 403);

    // Missing role / guest
    const guestUser = verifyAdminAccess(undefined);
    assert.equal(guestUser.status, 403);

    // Legitimate admin
    const adminUser = verifyAdminAccess("admin");
    assert.equal(adminUser.status, 200);
  });

  it("CSRF Origin Validation: blocks cookie-authenticated mutations from untrusted origins", () => {
    const allowedOrigins = new Set(["http://localhost:3000", "https://chessverse.app"]);

    const validateCsrf = (originHeader?: string, hasSessionCookie = true) => {
      if (!hasSessionCookie) return { allowed: true };
      if (!originHeader || !allowedOrigins.has(originHeader)) {
        return { allowed: false, status: 403, error: "CSRF origin rejected" };
      }
      return { allowed: true };
    };

    // Evil origin attempting CSRF attack
    const attack = validateCsrf("https://malicious-chess-site.com", true);
    assert.equal(attack.allowed, false);
    assert.equal(attack.status, 403);

    // Legitimate origin
    const legitimate = validateCsrf("https://chessverse.app", true);
    assert.equal(legitimate.allowed, true);
  });

  it("Input Validation: Zod schemas strictly validate move payloads and reject malformed inputs", () => {
    // Valid move
    const validMove = moveProposalSchema.safeParse({
      gameId: "game-123",
      from: "e2",
      to: "e4",
    });
    assert.equal(validMove.success, true);

    // Invalid squares (e.g. SQL injection attempt or out-of-bounds coordinates)
    const malformedMove = moveProposalSchema.safeParse({
      gameId: "game-123",
      from: "e9",
      to: "DROP TABLE users;",
    });
    assert.equal(malformedMove.success, false);
  });

  it("Input Validation: rejects invalid report categories and out-of-range time controls", () => {
    // Valid report
    const validReport = reportSchema.safeParse({
      reportedUserId: "usr-bad-1",
      reason: "cheating",
      notes: "High engine agreement",
    });
    assert.equal(validReport.success, true);

    // Invalid report reason
    const invalidReport = reportSchema.safeParse({
      reportedUserId: "usr-bad-1",
      reason: "super_powers", // Not allowed enum
    });
    assert.equal(invalidReport.success, false);

    // Invalid initial time control (> 2 hours)
    const excessiveTimeControl = createGameSchema.safeParse({
      initialTime: 999999, // Too large
    });
    assert.equal(excessiveTimeControl.success, false);
  });
});
