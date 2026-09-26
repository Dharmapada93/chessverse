import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import mongoose from "mongoose";

const ALGORITHM = "aes-256-gcm";

export interface BackupMetadata {
  version: string;
  createdAt: string;
  recordCounts: Record<string, number>;
  checksum: string;
}

export interface EncryptedBackupPackage {
  metadata: BackupMetadata;
  iv: string; // hex
  authTag: string; // hex
  ciphertext: string; // hex
}

export function getEncryptionKey(): Buffer {
  const secret = process.env.BACKUP_ENCRYPTION_KEY || process.env.SESSION_SECRET || "chessverse-production-backup-master-secret-key-32";
  return crypto.createHash("sha256").update(secret).digest();
}

/**
 * Encrypts a plain-text backup payload using AES-256-GCM
 */
export function encryptBackupPayload(plainTextJson: string, key: Buffer): EncryptedBackupPackage {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let ciphertext = cipher.update(plainTextJson, "utf8", "hex");
  ciphertext += cipher.final("hex");
  const authTag = cipher.getAuthTag().toString("hex");

  const checksum = crypto.createHash("sha256").update(plainTextJson).digest("hex");

  return {
    metadata: {
      version: "1.0.0",
      createdAt: new Date().toISOString(),
      recordCounts: {},
      checksum,
    },
    iv: iv.toString("hex"),
    authTag,
    ciphertext,
  };
}

/**
 * Decrypts an AES-256-GCM backup package and validates checksum
 */
export function decryptBackupPayload(pkg: EncryptedBackupPackage, key: Buffer): string {
  const decipher = crypto.createDecipheriv(ALGORITHM, key, Buffer.from(pkg.iv, "hex"));
  decipher.setAuthTag(Buffer.from(pkg.authTag, "hex"));

  let decrypted = decipher.update(pkg.ciphertext, "hex", "utf8");
  decrypted += decipher.final("utf8");

  const computedChecksum = crypto.createHash("sha256").update(decrypted).digest("hex");
  if (computedChecksum !== pkg.metadata.checksum) {
    throw new Error("Backup integrity verification failed: checksum mismatch");
  }

  return decrypted;
}

/**
 * Executes a full database backup export
 */
export async function createDatabaseBackup(outputDir = "./backups"): Promise<string> {
  const db = mongoose.connection.db;
  if (!db) {
    throw new Error("Database not connected");
  }

  const collections = ["users", "games", "messages", "puzzles", "gameanalyses", "coachprofiles", "fairplayreviews"];
  const dumpData: Record<string, any[]> = {};
  const recordCounts: Record<string, number> = {};

  for (const col of collections) {
    try {
      const docs = await db.collection(col).find({}).toArray();
      dumpData[col] = docs;
      recordCounts[col] = docs.length;
    } catch {
      dumpData[col] = [];
      recordCounts[col] = 0;
    }
  }

  const plainText = JSON.stringify(dumpData);
  const key = getEncryptionKey();
  const pkg = encryptBackupPayload(plainText, key);
  pkg.metadata.recordCounts = recordCounts;

  await fs.mkdir(outputDir, { recursive: true });
  const filename = `chessverse-backup-${Date.now()}.enc.json`;
  const filePath = path.join(outputDir, filename);

  await fs.writeFile(filePath, JSON.stringify(pkg, null, 2), "utf8");
  return filePath;
}
