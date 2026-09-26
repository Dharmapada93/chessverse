import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, "../../../");

describe("ChessVerse R12: Production Deployment Acceptance Suite", () => {
  // -------------------------------------------------------------
  // R12.2 - R12.4: Environment Variables & Secret Hygiene
  // -------------------------------------------------------------
  describe("R12.2 - R12.4: Environment Configuration & Secret Hygiene", () => {
    it("confirms root and server .env.example contain variable names only without secrets", () => {
      const rootEnvPath = path.join(ROOT_DIR, ".env.example");
      const serverEnvPath = path.join(ROOT_DIR, "server", ".env.example");

      assert.ok(fs.existsSync(rootEnvPath), "Root .env.example must exist");
      assert.ok(fs.existsSync(serverEnvPath), "Server .env.example must exist");

      const rootContent = fs.readFileSync(rootEnvPath, "utf-8");
      const serverContent = fs.readFileSync(serverEnvPath, "utf-8");

      const expectedRootVars = [
        "PORT=",
        "NODE_ENV=",
        "CLIENT_URL=",
        "NEXT_PUBLIC_API_URL=",
        "NEXT_PUBLIC_SOCKET_URL=",
        "DATABASE_URL=",
        "MONGODB_URI=",
        "JWT_SECRET=",
        "OPENAI_API_KEY=",
      ];

      for (const v of expectedRootVars) {
        assert.ok(rootContent.includes(v), `Root .env.example must specify ${v}`);
      }

      assert.ok(serverContent.includes("DATABASE_URL="), "Server .env.example must include DATABASE_URL=");
      assert.ok(serverContent.includes("JWT_SECRET="), "Server .env.example must include JWT_SECRET=");
      assert.ok(serverContent.includes("CLIENT_URL="), "Server .env.example must include CLIENT_URL=");

      // Ensure no accidental hardcoded secret values exist in .env.example files
      assert.ok(!rootContent.includes("sk-"), "Root .env.example must not contain real API keys");
      assert.ok(!serverContent.includes("sk-"), "Server .env.example must not contain real API keys");
      assert.ok(!rootContent.includes("mongodb+srv://"), "Root .env.example must not contain credentials");
    });

    it("verifies gitignore suppresses environment secret files", () => {
      const gitignorePath = path.join(ROOT_DIR, ".gitignore");
      const content = fs.readFileSync(gitignorePath, "utf-8");

      assert.match(content, /\.env\*/, ".gitignore must ignore .env* files");
      assert.match(content, /node_modules/, ".gitignore must ignore node_modules");
      assert.match(content, /\.next/, ".gitignore must ignore .next build folder");
    });
  });

  // -------------------------------------------------------------
  // R12.5 - R12.7: Production Database & Indexes
  // -------------------------------------------------------------
  describe("R12.5 - R12.7: Production Database & Indexes", () => {
    it("confirms database configuration supports both MONGODB_URI and DATABASE_URL with connection timeout options", () => {
      const dbConfigPath = path.join(ROOT_DIR, "server", "src", "config", "database.ts");
      const content = fs.readFileSync(dbConfigPath, "utf-8");

      assert.ok(content.includes("process.env.MONGODB_URI || process.env.DATABASE_URL"));
      assert.ok(content.includes("serverSelectionTimeoutMS"));
      assert.ok(content.includes("maxPoolSize"));
    });

    it("verifies required query indexes exist across core Mongoose models", () => {
      // User model indexes
      const userModel = fs.readFileSync(path.join(ROOT_DIR, "server", "src", "models", "User.ts"), "utf-8");
      assert.ok(userModel.includes("userSchema.index({ rating: -1 })"), "User model must index rating");
      assert.ok(userModel.includes("role: 1, accountStatus: 1"), "User model must index role + accountStatus");

      // Game model indexes
      const gameModel = fs.readFileSync(path.join(ROOT_DIR, "server", "src", "models", "Game.ts"), "utf-8");
      assert.ok(gameModel.includes("roomId: 1"), "Game model must index roomId");
      assert.ok(gameModel.includes("whitePlayerId: 1"), "Game model must index whitePlayerId");
      assert.ok(gameModel.includes("blackPlayerId: 1"), "Game model must index blackPlayerId");
      assert.ok(gameModel.includes("status: 1"), "Game model must index status");

      // Friendship model indexes
      const friendshipModel = fs.readFileSync(path.join(ROOT_DIR, "server", "src", "models", "Friendship.ts"), "utf-8");
      assert.match(friendshipModel, /requesterId:\s*1,\s*recipientId:\s*1/, "Friendship must index requester + recipient");

      // Challenge model indexes
      const challengeModel = fs.readFileSync(path.join(ROOT_DIR, "server", "src", "models", "Challenge.ts"), "utf-8");
      assert.ok(challengeModel.includes("challengedId: 1"), "Challenge must index challengedId");
      assert.ok(challengeModel.includes("challengerId: 1"), "Challenge must index challengerId");

      // Room model indexes
      const roomModel = fs.readFileSync(path.join(ROOT_DIR, "server", "src", "models", "Room.ts"), "utf-8");
      assert.ok(roomModel.includes("visibility: 1, status: 1"), "Room must index visibility + status");

      // Notification model indexes
      const notifModel = fs.readFileSync(path.join(ROOT_DIR, "server", "src", "models", "Notification.ts"), "utf-8");
      assert.match(notifModel, /userId:\s*1,\s*read:\s*1/, "Notification must index userId + read status");
    });
  });

  // -------------------------------------------------------------
  // R12.8 - R12.12: API, WebSocket URLs & Production CORS
  // -------------------------------------------------------------
  describe("R12.8 - R12.12: API, WebSocket URLs & Production CORS", () => {
    it("confirms ChessGame component uses apiFetch rather than hardcoded localhost", () => {
      const chessGamePath = path.join(ROOT_DIR, "src", "components", "chess", "ChessGame.tsx");
      const content = fs.readFileSync(chessGamePath, "utf-8");

      assert.ok(!content.includes("http://localhost:4000/api/games/room"), "ChessGame must not hardcode localhost:4000");
      assert.ok(content.includes("apiFetch(`/api/games/room/${roomId}/current`)"), "ChessGame must use apiFetch");
    });

    it("verifies production CORS origins accept configured client domains and chessverse.app", () => {
      const csrfPath = path.join(ROOT_DIR, "server", "src", "middleware", "csrf.ts");
      const content = fs.readFileSync(csrfPath, "utf-8");

      assert.ok(content.includes("https://chessverse.app"));
      assert.ok(content.includes("parseOrigins"));
    });

    it("verifies client socket connects with auto-reconnection and auth credentials", () => {
      const socketClientPath = path.join(ROOT_DIR, "src", "lib", "socket.ts");
      const content = fs.readFileSync(socketClientPath, "utf-8");

      assert.ok(content.includes("process.env.NEXT_PUBLIC_SOCKET_URL"));
      assert.ok(content.includes("withCredentials: true"));
      assert.ok(content.includes("reconnection: true"));
    });
  });

  // -------------------------------------------------------------
  // R12.17 - R12.20: Health Endpoint, Logging & Error Masking
  // -------------------------------------------------------------
  describe("R12.17 - R12.20: Health Endpoint, Logging & Error Masking", () => {
    it("verifies health check endpoint exists and returns non-sensitive status", () => {
      const healthPath = path.join(ROOT_DIR, "server", "src", "routes", "health.ts");
      const content = fs.readFileSync(healthPath, "utf-8");

      assert.ok(content.includes('status: isHealthy ? "ok" : "degraded"'));
      assert.ok(content.includes('/health'));
      assert.ok(!content.includes("password"), "Health check must not expose passwords");
      assert.ok(!content.includes("mongoUri"), "Health check must not expose raw connection string");
    });

    it("verifies globalErrorHandler masks internal 500 errors in production", () => {
      const errorHandlerPath = path.join(ROOT_DIR, "server", "src", "middleware", "errorHandler.ts");
      const content = fs.readFileSync(errorHandlerPath, "utf-8");

      assert.ok(content.includes('process.env.NODE_ENV === "production"'));
      assert.ok(content.includes("An unexpected error occurred. Please try again later."));
      assert.ok(content.includes("isProduction ? undefined : err.stack"));
    });

    it("verifies logger redacts sensitive credentials and authentication tokens", () => {
      const loggerPath = path.join(ROOT_DIR, "server", "src", "utils", "logger.ts");
      const content = fs.readFileSync(loggerPath, "utf-8");

      assert.ok(content.includes("password"));
      assert.ok(content.includes("token"));
      assert.ok(content.includes("jwt"));
      assert.ok(content.includes("secret"));
      assert.ok(content.includes("[REDACTED]"));
    });
  });

  // -------------------------------------------------------------
  // R12.41 - R12.45: Custom Production Error States
  // -------------------------------------------------------------
  describe("R12.41 - R12.45: Custom Production Error States", () => {
    it("confirms custom 404 page exists with chess thematic messaging", () => {
      const notFoundPath = path.join(ROOT_DIR, "src", "app", "not-found.tsx");
      assert.ok(fs.existsSync(notFoundPath), "src/app/not-found.tsx must exist");

      const content = fs.readFileSync(notFoundPath, "utf-8");
      assert.ok(content.includes("This position doesn&apos;t exist.") || content.includes("This position doesn't exist."));
      assert.ok(content.includes("Return Home"));
      assert.ok(content.includes("♟"));
    });

    it("confirms custom 500 error boundary page exists", () => {
      const errorPagePath = path.join(ROOT_DIR, "src", "app", "error.tsx");
      assert.ok(fs.existsSync(errorPagePath), "src/app/error.tsx must exist");

      const content = fs.readFileSync(errorPagePath, "utf-8");
      assert.ok(content.includes("Something went wrong."));
      assert.ok(content.includes("Try Again"));
    });

    it("confirms invalid game URL renders Game unavailable message", () => {
      const gamePagePath = path.join(ROOT_DIR, "src", "app", "game", "[gameId]", "page.tsx");
      const content = fs.readFileSync(gamePagePath, "utf-8");

      assert.ok(content.includes("Game unavailable"));
      assert.ok(content.includes("This game may have ended or the link may be invalid."));
      assert.ok(content.includes("Back to ChessVerse"));
    });

    it("confirms ConnectionBanner provides offline and recovery notifications", () => {
      const bannerPath = path.join(ROOT_DIR, "src", "components", "ui", "ConnectionBanner.tsx");
      const content = fs.readFileSync(bannerPath, "utf-8");

      assert.ok(content.includes("Connection lost"));
      assert.ok(content.includes("Trying to reconnect..."));
      assert.ok(content.includes("✓ Reconnected"));
    });
  });

  // -------------------------------------------------------------
  // R12.46 - R12.48: AI Error Resilience & Rate Limit Grace
  // -------------------------------------------------------------
  describe("R12.46 - R12.48: AI Error Resilience & Rate Limit Grace", () => {
    it("confirms AI coaching services contain graceful fallbacks on API rate limits or failures", () => {
      const llmServicePath = path.join(ROOT_DIR, "server", "src", "services", "llm.ts");
      const content = fs.readFileSync(llmServicePath, "utf-8");

      assert.ok(content.includes("Analysis temporarily unavailable. Your game is safe."));
      assert.ok(content.includes("fallbackExplanations"));
    });
  });

  // -------------------------------------------------------------
  // R12.64 - R12.65: Free Product Integrity & Dev Marker Suppression
  // -------------------------------------------------------------
  describe("R12.64 - R12.65: Free Product Integrity & Dev Marker Suppression", () => {
    it("verifies devIndicators disabled in next.config.ts and CSS suppresses N button", () => {
      const nextConfigPath = path.join(ROOT_DIR, "next.config.ts");
      const cssPath = path.join(ROOT_DIR, "src", "app", "globals.css");

      const nextConfig = fs.readFileSync(nextConfigPath, "utf-8");
      const css = fs.readFileSync(cssPath, "utf-8");

      assert.ok(nextConfig.includes("devIndicators: false"), "next.config.ts must disable devIndicators");
      assert.ok(css.includes("data-nextjs-dev-tools-button"), "globals.css must hide dev tools button");
    });
  });
});
