import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { DEMO_USERS } from "../../../server/src/scripts/seedDemo.js";

const ROOT_DIR = path.resolve(__dirname, "../../..");

describe("ChessVerse R10: Resume & Portfolio Preparation Acceptance", () => {
  it("R10.1 - R10.20: README.md contains all mandatory portfolio sections", () => {
    const readmePath = path.join(ROOT_DIR, "README.md");
    assert.ok(fs.existsSync(readmePath), "README.md must exist in root");

    const content = fs.readFileSync(readmePath, "utf-8");

    const requiredHeadings = [
      "ChessVerse",
      "Project Overview",
      "Key Features",
      "Tech Stack",
      "Real-Time Architecture",
      "Multiplayer Gameplay",
      "Spectator Mode",
      "AI Features",
      "Admin Panel",
      "Authentication",
      "Reconnection Handling",
      "Performance",
      "Responsive Design",
      "Installation",
      "Environment Variables",
      "Running Locally",
      "Project Structure",
      "Future Improvements",
    ];

    for (const heading of requiredHeadings) {
      assert.ok(
        content.toLowerCase().includes(heading.toLowerCase()),
        `README.md must contain heading or section: "${heading}"`
      );
    }
  });

  it("R10.5 & R10.15: README.md documents the exact real-time move pipeline flow", () => {
    const readmePath = path.join(ROOT_DIR, "README.md");
    const content = fs.readFileSync(readmePath, "utf-8");

    const pipelineSteps = [
      "Player A",
      "WebSocket Server",
      "Authentication",
      "Chess Move Validation",
      "Game State Update",
      "Persistence",
      "Broadcast",
      "Player B",
      "Spectators",
    ];

    for (const step of pipelineSteps) {
      assert.ok(
        content.includes(step),
        `README real-time move pipeline must include step: "${step}"`
      );
    }
  });

  it("R10.5 & R10.16: README.md documents the exact reconnect handling protocol", () => {
    const readmePath = path.join(ROOT_DIR, "README.md");
    const content = fs.readFileSync(readmePath, "utf-8");

    const reconnectSteps = [
      "Disconnect",
      "Reconnect",
      "Authentication",
      "Request Latest Game State",
      "Synchronize",
      "Resume Game",
    ];

    for (const step of reconnectSteps) {
      assert.ok(
        content.toLowerCase().includes(step.toLowerCase()),
        `README reconnect protocol must include step: "${step}"`
      );
    }
  });

  it("R10.21 - R10.23: Environment & Git hygiene prevents secret leaks and tracks templates", () => {
    const rootGitignore = fs.readFileSync(path.join(ROOT_DIR, ".gitignore"), "utf-8");
    assert.ok(
      rootGitignore.includes("!.env.example"),
      "Root .gitignore must unignore .env.example with !.env.example"
    );

    const rootEnvExample = fs.readFileSync(path.join(ROOT_DIR, ".env.example"), "utf-8");
    const serverEnvExample = fs.readFileSync(
      path.join(ROOT_DIR, "server/.env.example"),
      "utf-8"
    );

    // Verify template files do not contain real keys or passwords
    const forbiddenPatterns = [
      "sk-proj-",
      "mongodb+srv://admin:",
      "postgres://",
      "AIzaSy",
      "eyJhbGciOi",
    ];

    for (const forbidden of forbiddenPatterns) {
      assert.ok(
        !rootEnvExample.includes(forbidden),
        `root .env.example must not contain live secret pattern: ${forbidden}`
      );
      assert.ok(
        !serverEnvExample.includes(forbidden),
        `server/.env.example must not contain live secret pattern: ${forbidden}`
      );
    }

    // Verify absence of payment variables
    const paymentKeywords = ["STRIPE", "RAZORPAY", "PAYPAL", "SUBSCRIPTION_PRICE"];
    for (const keyword of paymentKeywords) {
      assert.ok(
        !rootEnvExample.includes(keyword),
        `root .env.example must not contain commercial variable: ${keyword}`
      );
      assert.ok(
        !serverEnvExample.includes(keyword),
        `server/.env.example must not contain commercial variable: ${keyword}`
      );
    }
  });

  it("R10.28 & R10.29: Demo accounts are properly configured for fast recruiter verification", () => {
    assert.ok(Array.isArray(DEMO_USERS), "DEMO_USERS must be an array");
    assert.equal(DEMO_USERS.length, 4, "Must define 4 demo accounts");

    const player1 = DEMO_USERS.find((u) => u.username === "demo_player1");
    const player2 = DEMO_USERS.find((u) => u.username === "demo_player2");
    const spectator = DEMO_USERS.find((u) => u.username === "demo_spectator");
    const admin = DEMO_USERS.find((u) => u.username === "demo_admin");

    assert.ok(player1, "Must contain demo_player1");
    assert.ok(player2, "Must contain demo_player2");
    assert.ok(spectator, "Must contain demo_spectator");
    assert.ok(admin, "Must contain demo_admin");

    assert.equal(admin?.role, "admin", "demo_admin must have role: 'admin'");
    assert.equal(player1?.role, "user", "demo_player1 must have role: 'user'");
    assert.ok(
      (admin?.adminPermissions?.length ?? 0) > 0,
      "demo_admin must have adminPermissions populated"
    );
  });

  it("R10.30 - R10.39: Portfolio and Interview Guide provides system design deep-dives", () => {
    const guidePath = path.join(ROOT_DIR, "docs/PORTFOLIO_GUIDE.md");
    assert.ok(fs.existsSync(guidePath), "docs/PORTFOLIO_GUIDE.md must exist");

    const guideContent = fs.readFileSync(guidePath, "utf-8");

    assert.ok(
      guideContent.includes("Resume Ready Bullet Points"),
      "Guide must include resume ready bullet points"
    );
    assert.ok(
      guideContent.toLowerCase().includes("server-authoritative"),
      "Guide must explain server-authoritative rationale"
    );
    assert.ok(
      guideContent.includes("Web Worker"),
      "Guide must explain Stockfish Web Worker thread isolation"
    );
    assert.ok(
      guideContent.includes("30-second"),
      "Guide must explain the 30-second disconnect grace window"
    );
  });

  it("R10.4: Admin routes are strictly protected with server-authoritative middleware", () => {
    const adminRoutesPath = path.join(ROOT_DIR, "server/src/routes/admin.ts");
    const content = fs.readFileSync(adminRoutesPath, "utf-8");

    assert.ok(
      content.includes("router.use(requireAuth)"),
      "admin.ts must apply requireAuth middleware"
    );
    assert.ok(
      content.includes("router.use(requireAdmin)"),
      "admin.ts must apply requireAdmin middleware"
    );
  });

  it("R10 Cleanliness: No fake statistics, 100k claims, or paid plans exist in portfolio documentation", () => {
    const readmeContent = fs.readFileSync(path.join(ROOT_DIR, "README.md"), "utf-8");
    const portfolioContent = fs.readFileSync(
      path.join(ROOT_DIR, "docs/PORTFOLIO_GUIDE.md"),
      "utf-8"
    );

    const forbiddenClaims = [
      "100,000+ users",
      "100k users",
      "50,000 active players",
      "$9.99/month",
      "Pro Tier",
      "Premium Plan",
    ];

    for (const claim of forbiddenClaims) {
      assert.ok(
        !readmeContent.includes(claim),
        `README must not contain fake claim: ${claim}`
      );
      assert.ok(
        !portfolioContent.includes(claim),
        `Portfolio Guide must not contain fake claim: ${claim}`
      );
    }
  });
});
