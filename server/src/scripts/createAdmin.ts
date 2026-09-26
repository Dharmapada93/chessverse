import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { User } from "../models/User.js";

async function createAdmin() {
  const mongoUri = process.env.MONGODB_URI || process.env.DATABASE_URL;
  if (!mongoUri) {
    console.error("Error: MONGODB_URI or DATABASE_URL environment variable must be set.");
    process.exit(1);
  }

  const args = process.argv.slice(2);
  const username = args[0] || process.env.ADMIN_USERNAME;
  const email = args[1] || process.env.ADMIN_EMAIL;
  const password = args[2] || process.env.ADMIN_PASSWORD;

  if (!username || !email || !password) {
    console.error(
      "Usage: npm --prefix server run create:admin -- <username> <email> <password>\n" +
      "Or set ADMIN_USERNAME, ADMIN_EMAIL, and ADMIN_PASSWORD environment variables."
    );
    process.exit(1);
  }

  try {
    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB.");

    let user = await User.findOne({
      $or: [{ username: username.toLowerCase() }, { email: email.toLowerCase() }],
    });

    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    const adminPermissions = [
      "all",
      "manage_users",
      "manage_games",
      "manage_reports",
      "manage_announcements",
      "system_settings",
      "view_audit_logs",
      "view_metrics",
    ];

    if (user) {
      user.role = "admin";
      user.passwordHash = passwordHash;
      user.adminPermissions = adminPermissions;
      await user.save();
      console.log(`✓ Existing user "${user.username}" successfully promoted to Administrator.`);
    } else {
      user = await User.create({
        username: username.toLowerCase(),
        email: email.toLowerCase(),
        passwordHash,
        role: "admin",
        adminPermissions,
        rating: 1500,
        ratings: { bullet: 1500, blitz: 1500, rapid: 1500, classical: 1500 },
        puzzleRating: 1500,
      });
      console.log(`✓ New Administrator account "${user.username}" created successfully.`);
    }

    await mongoose.disconnect();
    process.exit(0);
  } catch (err: any) {
    console.error("Failed to create administrator account:", err.message);
    process.exit(1);
  }
}

createAdmin();
