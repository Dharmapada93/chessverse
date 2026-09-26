import fs from "node:fs/promises";
import mongoose from "mongoose";
import {
  decryptBackupPayload,
  getEncryptionKey,
  type EncryptedBackupPackage,
} from "./backup.js";

/**
 * Restores a database backup from an encrypted file package
 */
export async function restoreDatabaseFromBackup(backupFilePath: string): Promise<Record<string, number>> {
  const fileContent = await fs.readFile(backupFilePath, "utf8");
  const pkg: EncryptedBackupPackage = JSON.parse(fileContent);

  const key = getEncryptionKey();
  const decryptedJson = decryptBackupPayload(pkg, key);
  const data: Record<string, any[]> = JSON.parse(decryptedJson);

  const db = mongoose.connection.db;
  if (!db) {
    throw new Error("Database connection not ready for restore");
  }

  const restoredCounts: Record<string, number> = {};

  for (const [colName, docs] of Object.entries(data)) {
    if (Array.isArray(docs) && docs.length > 0) {
      const collection = db.collection(colName);
      await collection.deleteMany({});
      await collection.insertMany(docs);
      restoredCounts[colName] = docs.length;
    } else {
      restoredCounts[colName] = 0;
    }
  }

  return restoredCounts;
}
