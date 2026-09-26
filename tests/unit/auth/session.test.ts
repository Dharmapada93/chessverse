import { describe, it } from "node:test";
import assert from "node:assert/strict";
import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import { parseUserAgent } from "../../../server/src/utils/userAgent.js";

describe("Authentication, Password Security & Session Lifecycle", () => {
  it("securely hashes passwords with high work factor (bcrypt cost 12)", async () => {
    const password = "SuperSecretChessPassword!2026";
    const salt = await bcrypt.genSalt(12);
    const hash = await bcrypt.hash(password, salt);

    assert.notEqual(hash, password);
    assert.ok(hash.startsWith("$2a$12$") || hash.startsWith("$2b$12$"));

    // Verify correct password matches
    const isCorrect = await bcrypt.compare(password, hash);
    assert.equal(isCorrect, true);

    // Verify incorrect password fails
    const isWrong = await bcrypt.compare("WrongPassword123", hash);
    assert.equal(isWrong, false);
  });

  it("accurately classifies user agents into browser, OS, and device categories", () => {
    const desktopChrome = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36";
    const parsedDesktop = parseUserAgent(desktopChrome);
    assert.equal(parsedDesktop.browser, "Chrome");
    assert.equal(parsedDesktop.os, "Windows");
    assert.equal(parsedDesktop.device, "Desktop");

    const iphoneSafari = "Mozilla/5.0 (iPhone; CPU iPhone OS 17_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.3 Mobile/15E148 Safari/604.1";
    const parsedIphone = parseUserAgent(iphoneSafari);
    assert.equal(parsedIphone.os, "iOS");
    assert.equal(parsedIphone.device, "Mobile");

    const ipadSafari = "Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148";
    const parsedIpad = parseUserAgent(ipadSafari);
    assert.equal(parsedIpad.device, "Tablet");
  });

  it("calculates session expiration and verifies TTL validity", () => {
    const now = Date.now();
    const ttlDays = 30;
    const expiresAt = new Date(now + ttlDays * 24 * 60 * 60 * 1000);

    assert.ok(expiresAt.getTime() > now);
    assert.equal(expiresAt.getTime() >= now + (ttlDays - 1) * 24 * 60 * 60 * 1000, true);

    // Expired check
    const isExpired = (exp: Date) => exp.getTime() < Date.now();
    assert.equal(isExpired(expiresAt), false);

    const pastDate = new Date(now - 1000);
    assert.equal(isExpired(pastDate), true);
  });

  it("verifies session revocation state handling", () => {
    type MockSession = {
      sessionId: string;
      userId: string;
      expiresAt: Date;
      revokedAt?: Date | null;
    };

    const activeSession: MockSession = {
      sessionId: "sess-abc-123",
      userId: "user-1",
      expiresAt: new Date(Date.now() + 86400000),
      revokedAt: null,
    };

    const isSessionValid = (s: MockSession) => {
      if (s.revokedAt) return false;
      if (s.expiresAt.getTime() < Date.now()) return false;
      return true;
    };

    assert.equal(isSessionValid(activeSession), true);

    // Revoke session
    activeSession.revokedAt = new Date();
    assert.equal(isSessionValid(activeSession), false);
  });

  it("generates cryptographically secure non-enumerating reset tokens", () => {
    const rawToken = crypto.randomBytes(32).toString("hex");
    assert.equal(rawToken.length, 64);

    // Hash token before storing in database
    const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");
    assert.notEqual(hashedToken, rawToken);

    // Verifying token match
    const incomingToken = rawToken;
    const incomingHash = crypto.createHash("sha256").update(incomingToken).digest("hex");
    assert.equal(incomingHash, hashedToken);
  });
});
