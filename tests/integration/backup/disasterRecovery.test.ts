import { describe, it } from "node:test";
import assert from "node:assert/strict";
import crypto from "node:crypto";
import {
  encryptBackupPayload,
  decryptBackupPayload,
  getEncryptionKey,
} from "../../../server/src/scripts/backup.js";

describe("Disaster Recovery & Encrypted Backup Testing (Step 96)", () => {
  const masterKey = getEncryptionKey();

  it("encrypts database payload with AES-256-GCM and generates SHA-256 checksum", () => {
    const mockDbDump = JSON.stringify({
      users: [
        { id: "u1", username: "grandmaster_alex", rating: 2200 },
        { id: "u2", username: "tactician_beth", rating: 2150 },
      ],
      games: [
        { id: "g1", whitePlayerId: "u1", blackPlayerId: "u2", moves: ["e4", "e5"] },
      ],
    });

    const backupPackage = encryptBackupPayload(mockDbDump, masterKey);

    assert.ok(backupPackage.iv, "IV must be generated");
    assert.ok(backupPackage.authTag, "Auth tag must be present for GCM authentication");
    assert.ok(backupPackage.ciphertext, "Ciphertext must be present");
    assert.notStrictEqual(backupPackage.ciphertext, mockDbDump, "Ciphertext must be encrypted");
    assert.strictEqual(backupPackage.metadata.version, "1.0.0");
    assert.ok(backupPackage.metadata.createdAt);
    assert.ok(backupPackage.metadata.checksum, "Checksum must be generated");

    const expectedChecksum = crypto.createHash("sha256").update(mockDbDump).digest("hex");
    assert.strictEqual(backupPackage.metadata.checksum, expectedChecksum);
  });

  it("decrypts backup package successfully with correct key and validates integrity", () => {
    const originalData = {
      users: [{ id: "u1", email: "alice@chessverse.test" }],
      games: [{ id: "g1", fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1" }],
    };
    const jsonStr = JSON.stringify(originalData);

    const backupPackage = encryptBackupPayload(jsonStr, masterKey);
    const decryptedJson = decryptBackupPayload(backupPackage, masterKey);
    const parsedData = JSON.parse(decryptedJson);

    assert.deepStrictEqual(parsedData, originalData);
  });

  it("detects ciphertext tampering and fails decryption via GCM auth tag mismatch", () => {
    const original = JSON.stringify({ test: "data" });
    const pkg = encryptBackupPayload(original, masterKey);

    // Tamper with ciphertext by altering last byte
    const tamperedCiphertext = pkg.ciphertext.slice(0, -2) + (pkg.ciphertext.slice(-2) === "aa" ? "bb" : "aa");
    const tamperedPkg = { ...pkg, ciphertext: tamperedCiphertext };

    assert.throws(
      () => {
        decryptBackupPayload(tamperedPkg, masterKey);
      },
      /Unsupported state or unable to authenticate data|bad decrypt/i,
      "Tampered ciphertext should fail GCM authentication"
    );
  });

  it("detects checksum tampering when metadata does not match decrypted payload", () => {
    const original = JSON.stringify({ integrity: "verified" });
    const pkg = encryptBackupPayload(original, masterKey);

    // Tamper with metadata checksum
    const tamperedChecksumPkg = {
      ...pkg,
      metadata: {
        ...pkg.metadata,
        checksum: "0000000000000000000000000000000000000000000000000000000000000000",
      },
    };

    assert.throws(
      () => {
        decryptBackupPayload(tamperedChecksumPkg, masterKey);
      },
      /Backup integrity verification failed: checksum mismatch/,
      "Mismatched checksum must abort restore"
    );
  });

  it("rejects decryption with an incorrect secret key", () => {
    const original = JSON.stringify({ sensitive: "rating_adjustments" });
    const pkg = encryptBackupPayload(original, masterKey);

    const wrongKey = crypto.createHash("sha256").update("completely-different-key").digest();

    assert.throws(
      () => {
        decryptBackupPayload(pkg, wrongKey);
      },
      /Unsupported state or unable to authenticate data|bad decrypt/i,
      "Decryption with wrong key must fail"
    );
  });

  it("simulates full backup-restore rehydration cycle under RTO benchmark", () => {
    const mockDatabase: Record<string, any[]> = {
      users: Array.from({ length: 50 }, (_, i) => ({
        id: `user_${i}`,
        username: `player_${i}`,
        rating: 1200 + i * 10,
        fairPlayScore: 100,
      })),
      games: Array.from({ length: 20 }, (_, i) => ({
        id: `game_${i}`,
        whitePlayerId: `user_${i}`,
        blackPlayerId: `user_${i + 1}`,
        moves: ["e4", "e5", "Nf3", "Nc6"],
      })),
    };

    const startTime = performance.now();

    // 1. Snapshot and encrypt
    const rawDump = JSON.stringify(mockDatabase);
    const backupPkg = encryptBackupPayload(rawDump, masterKey);

    // 2. Decrypt and rehydrate simulated destination
    const restoredJson = decryptBackupPayload(backupPkg, masterKey);
    const restoredData = JSON.parse(restoredJson);

    const durationMs = performance.now() - startTime;

    assert.strictEqual(restoredData.users.length, 50);
    assert.strictEqual(restoredData.games.length, 20);
    assert.strictEqual(restoredData.users[0].username, "player_0");
    assert.strictEqual(restoredData.games[0].moves.length, 4);

    // Benchmark check: small restore cycle must be fast (< 500ms)
    assert.ok(
      durationMs < 500,
      `Restore rehydration cycle took ${durationMs}ms, well within RTO SLA`
    );
  });
});
