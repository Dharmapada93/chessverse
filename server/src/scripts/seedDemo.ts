import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { User } from "../models/User.js";
import { Friendship } from "../models/Friendship.js";
import { Game } from "../models/Game.js";
import { Room } from "../models/Room.js";

const MONGODB_URI =
  process.env.MONGODB_URI ||
  process.env.DATABASE_URL ||
  "mongodb://127.0.0.1:27017/chessverse";

export const DEMO_USERS = [
  {
    username: "demo_player1",
    email: "demo_player1@chessverse.local",
    password: "Demo1234!",
    role: "user" as const,
    rating: 1540,
    ratings: { bullet: 1510, blitz: 1540, rapid: 1560, classical: 1580 },
    puzzleRating: 1520,
  },
  {
    username: "demo_player2",
    email: "demo_player2@chessverse.local",
    password: "Demo1234!",
    role: "user" as const,
    rating: 1515,
    ratings: { bullet: 1490, blitz: 1515, rapid: 1530, classical: 1540 },
    puzzleRating: 1495,
  },
  {
    username: "demo_spectator",
    email: "demo_spectator@chessverse.local",
    password: "Demo1234!",
    role: "user" as const,
    rating: 1480,
    ratings: { bullet: 1450, blitz: 1480, rapid: 1500, classical: 1510 },
    puzzleRating: 1460,
  },
  {
    username: "demo_admin",
    email: "demo_admin@chessverse.local",
    password: "AdminDemo123!",
    role: "admin" as const,
    rating: 1650,
    ratings: { bullet: 1620, blitz: 1650, rapid: 1680, classical: 1700 },
    puzzleRating: 1710,
    adminPermissions: [
      "all",
      "manage_users",
      "manage_games",
      "manage_reports",
      "manage_announcements",
      "system_settings",
      "view_audit_logs",
      "view_metrics",
    ],
  },
];

export async function seedDemoEnvironment() {
  console.log("Connecting to MongoDB for demo seeding...");
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(MONGODB_URI);
  }

  const userMap = new Map<string, any>();

  for (const demo of DEMO_USERS) {
    const passwordHash = await bcrypt.hash(demo.password, 10);
    const existing = await User.findOne({ username: demo.username });

    if (existing) {
      existing.email = demo.email;
      existing.passwordHash = passwordHash;
      existing.role = demo.role;
      existing.rating = demo.rating;
      existing.ratings = demo.ratings;
      existing.puzzleRating = demo.puzzleRating;
      existing.accountStatus = "ACTIVE";
      existing.emailVerified = true;
      if (demo.adminPermissions) {
        existing.adminPermissions = demo.adminPermissions;
      }
      await existing.save();
      userMap.set(demo.username, existing);
      console.log(`✓ Updated demo user: ${demo.username} (${demo.role})`);
    } else {
      const created = await User.create({
        username: demo.username,
        email: demo.email,
        passwordHash,
        role: demo.role,
        rating: demo.rating,
        ratings: demo.ratings,
        puzzleRating: demo.puzzleRating,
        accountStatus: "ACTIVE",
        emailVerified: true,
        adminPermissions: demo.adminPermissions || [],
        preferences: {
          theme: "dark",
          boardTheme: "emerald",
          pieceSet: "standard",
          soundEnabled: true,
          animationsEnabled: true,
          coordinates: true,
        },
      });
      userMap.set(demo.username, created);
      console.log(`✓ Created demo user: ${demo.username} (${demo.role})`);
    }
  }

  const p1 = userMap.get("demo_player1");
  const p2 = userMap.get("demo_player2");

  if (p1 && p2) {
    // Seed mutual friendship
    await Friendship.findOneAndUpdate(
      {
        $or: [
          { requesterId: p1._id, recipientId: p2._id },
          { requesterId: p2._id, recipientId: p1._id },
        ],
      },
      {
        requesterId: p1._id,
        recipientId: p2._id,
        status: "accepted",
        updatedAt: new Date(),
      },
      { upsert: true, new: true }
    );
    console.log("✓ Established mutual friendship between demo_player1 and demo_player2");

    // Seed a finished showcase game
    const sampleGame = await Game.findOneAndUpdate(
      { roomId: "demo-showcase-game-001" },
      {
        roomId: "demo-showcase-game-001",
        whitePlayerId: p1._id,
        blackPlayerId: p2._id,
        whitePlayerName: p1.username,
        blackPlayerName: p2.username,
        whiteRating: p1.rating,
        blackRating: p2.rating,
        status: "finished",
        result: "1-0",
        resultReason: "checkmate",
        initialFen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
        fen: "r1bqkb1r/pppp1ppp/2n5/4p3/2B1n3/5N2/PPPP1PPP/RNBQK2R w KQkq - 0 5",
        turn: "w",
        timeControl: { initialTime: 300, increment: 2, display: "Blitz 5+2" },
        whiteTimeMs: 245000,
        blackTimeMs: 218000,
        moves: [
          { from: "e2", to: "e4", san: "e4", fen: "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1", color: "w" },
          { from: "e7", to: "e5", san: "e5", fen: "rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2", color: "b" },
          { from: "g1", to: "f3", san: "Nf3", fen: "rnbqkbnr/pppp1ppp/8/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 1 2", color: "w" },
          { from: "b8", to: "c6", san: "Nc6", fen: "r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3", color: "w" },
          { from: "f1", to: "c4", san: "Bc4", fen: "r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 3 3", color: "w" },
          { from: "g8", to: "f6", san: "Nf6", fen: "r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4", color: "b" },
        ],
        rated: true,
      },
      { upsert: true, new: true }
    );
    console.log(`✓ Seeded finished showcase game (${sampleGame._id})`);

    // Seed active room for quick testing
    await Room.findOneAndUpdate(
      { code: "DEMO99" },
      {
        code: "DEMO99",
        name: "Recruiter Live Showcase",
        status: "waiting",
        hostId: p1._id,
        isPrivate: false,
        timeControl: { initialTime: 300, increment: 2, display: "Blitz 5+2" },
      },
      { upsert: true, new: true }
    );
    console.log("✓ Seeded active showcase room (Code: DEMO99)");
  }

  console.log("\n=======================================================");
  console.log("  ChessVerse Recruiter Demo Environment Seeded!");
  console.log("=======================================================");
  console.log("  Player 1 : demo_player1   / Demo1234! (Elo: 1540)");
  console.log("  Player 2 : demo_player2   / Demo1234! (Elo: 1515)");
  console.log("  Spectator: demo_spectator / Demo1234! (Elo: 1480)");
  console.log("  Admin    : demo_admin     / AdminDemo123! (Role: admin)");
  console.log("=======================================================\n");
}

if (import.meta.url === `file://${process.argv[1]}`) {
  seedDemoEnvironment()
    .then(async () => {
      await mongoose.disconnect();
      process.exit(0);
    })
    .catch(async (err) => {
      console.error("Seed error:", err);
      await mongoose.disconnect();
      process.exit(1);
    });
}
