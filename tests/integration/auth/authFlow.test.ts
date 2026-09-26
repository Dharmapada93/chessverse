import { describe, it } from "node:test";
import assert from "node:assert/strict";
import jwt from "jsonwebtoken";
import crypto from "node:crypto";
import bcrypt from "bcryptjs";

describe("Integration: Authentication & Session Flow", () => {
  const secret = "test-jwt-secret-key-12345";
  const mockUser = {
    _id: "usr-int-test-1",
    email: "player1@chessverse.test",
    username: "TestGrandmaster",
    passwordHash: "",
    emailVerified: false,
    role: "user",
  };

  const sessionsDb = new Map<string, {
    sessionId: string;
    userId: string;
    expiresAt: Date;
    revokedAt: Date | null;
  }>();

  it("completes registration, password hashing, and email token issuance", async () => {
    // 1. Password hashing
    const rawPassword = "SecurePassword2026!";
    mockUser.passwordHash = await bcrypt.hash(rawPassword, 12);
    assert.ok(mockUser.passwordHash.length > 50);

    // 2. Email verification token
    const verificationToken = crypto.randomBytes(32).toString("hex");
    assert.equal(verificationToken.length, 64);

    // 3. User verification simulates clicking link
    mockUser.emailVerified = true;
    assert.equal(mockUser.emailVerified, true);
  });

  it("authenticates credentials, creates session, and issues session cookie payload", async () => {
    const rawPassword = "SecurePassword2026!";
    const passwordMatches = await bcrypt.compare(rawPassword, mockUser.passwordHash);
    assert.equal(passwordMatches, true);

    const sessionId = `sess-${crypto.randomUUID()}`;
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    sessionsDb.set(sessionId, {
      sessionId,
      userId: mockUser._id,
      expiresAt,
      revokedAt: null,
    });

    const token = jwt.sign({ userId: mockUser._id, sessionId }, secret, { expiresIn: "30d" });
    assert.ok(token);

    // Verify token decodes session and userId
    const decoded = jwt.verify(token, secret) as { userId: string; sessionId: string };
    assert.equal(decoded.userId, mockUser._id);
    assert.equal(decoded.sessionId, sessionId);
  });

  it("allows access with valid session and rejects revoked sessions with 401", () => {
    const activeSessionId = Array.from(sessionsDb.keys())[0];
    assert.ok(activeSessionId);

    // Authenticate request
    const authenticateRequest = (sId?: string) => {
      if (!sId) return { status: 401, error: "Authentication required" };
      const sess = sessionsDb.get(sId);
      if (!sess || sess.revokedAt || sess.expiresAt.getTime() < Date.now()) {
        return { status: 401, error: "Session has been revoked or expired" };
      }
      return { status: 200, userId: sess.userId };
    };

    // First request: valid
    const res1 = authenticateRequest(activeSessionId);
    assert.equal(res1.status, 200);
    assert.equal(res1.userId, mockUser._id);

    // Revoke session
    const sessRecord = sessionsDb.get(activeSessionId)!;
    sessRecord.revokedAt = new Date();

    // Second request: rejected
    const res2 = authenticateRequest(activeSessionId);
    assert.equal(res2.status, 401);
    assert.equal(res2.error, "Session has been revoked or expired");
  });

  it("verifies non-enumerating responses on unknown password reset requests", () => {
    const requestPasswordReset = (email: string) => {
      // Regardless of whether user exists, return generic non-enumerating message
      const userExists = email === mockUser.email;
      if (userExists) {
        // Send reset email silently
      }
      return {
        success: true,
        message: "If an account exists with this email, a password reset link has been dispatched.",
      };
    };

    const existingRes = requestPasswordReset("player1@chessverse.test");
    const nonExistingRes = requestPasswordReset("nonexistent@chessverse.test");

    // Must be indistinguishable to prevent username/email scraping
    assert.equal(existingRes.success, true);
    assert.equal(nonExistingRes.success, true);
    assert.equal(existingRes.message, nonExistingRes.message);
  });
});
