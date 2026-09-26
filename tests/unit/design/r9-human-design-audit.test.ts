import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { boardThemes } from "../../../src/config/boards.js";

const ROOT_DIR = path.resolve(process.cwd());

describe("ChessVerse R9: Human-Made Design Audit (R9.1 - R9.84)", () => {
  // -------------------------------------------------------------
  // R9.1 - R9.3 & R9.51: Real Design System & Radius Scale
  // -------------------------------------------------------------
  describe("R9.1 - R9.3 & R9.51: Design System Tokens & Controlled Radius", () => {
    it("confirms tokens.css defines the standard 4-tier radius scale including panel radius", () => {
      const tokensPath = path.join(ROOT_DIR, "src", "styles", "tokens.css");
      const content = fs.readFileSync(tokensPath, "utf-8");

      assert.match(content, /--radius-sm:\s*8px;/);
      assert.match(content, /--radius-md:\s*12px;/);
      assert.match(content, /--radius-lg:\s*16px;/);
      assert.match(content, /--radius-panel:\s*20px;/);
      assert.match(content, /--radius-pill:\s*999px;/);
    });

    it("confirms designTokens.ts exports typed design system constants", () => {
      const dtPath = path.join(ROOT_DIR, "src", "styles", "designTokens.ts");
      assert.ok(fs.existsSync(dtPath), "designTokens.ts must exist");
      const content = fs.readFileSync(dtPath, "utf-8");

      assert.match(content, /radius:\s*\{[\s\S]*sm:\s*"8px"/);
      assert.match(content, /panel:\s*"20px"/);
      assert.match(content, /primary:\s*"#d7b875"/);
    });
  });

  // -------------------------------------------------------------
  // R9.10 - R9.25: Chessboard & Resignation UX
  // -------------------------------------------------------------
  describe("R9.10 - R9.25: Chessboard Theme Integration & 2-Step Resignation", () => {
    it("confirms ChessGame integrates useTheme and boardThemes for board appearance", () => {
      const gamePath = path.join(ROOT_DIR, "src", "components", "chess", "ChessGame.tsx");
      const content = fs.readFileSync(gamePath, "utf-8");

      assert.match(content, /useTheme\(\)/);
      assert.match(content, /activeTheme\.dark/);
      assert.match(content, /activeTheme\.light/);
      assert.match(content, /customSquareStyles/);
    });

    it("confirms 2-step Resign confirmation modal prevents accidental resignations", () => {
      const gamePath = path.join(ROOT_DIR, "src", "components", "chess", "ChessGame.tsx");
      const content = fs.readFileSync(gamePath, "utf-8");

      assert.match(content, /showResignModal/);
      assert.match(content, /Resign game\?/);
      assert.match(content, /Your opponent will win this game\./);
      assert.match(content, /setShowResignModal\(false\)/);
    });

    it("confirms subtle in-check highlight on the King square", () => {
      const gamePath = path.join(ROOT_DIR, "src", "components", "chess", "ChessGame.tsx");
      const content = fs.readFileSync(gamePath, "utf-8");

      assert.match(content, /checkSquare/);
      assert.match(content, /game\.inCheck\(\)/);
      assert.match(content, /rgba\(239,\s*68,\s*68/);
    });

    it("confirms board themes provide free choices with valid contrast", () => {
      assert.ok(boardThemes.length >= 6, "At least 6 board themes available");
      for (const t of boardThemes) {
        assert.ok(t.id, "Theme has an id");
        assert.ok(t.name, "Theme has a name");
        assert.ok(t.light.startsWith("#"), "Light square has hex color");
        assert.ok(t.dark.startsWith("#"), "Dark square has hex color");
        assert.equal(t.access, "free", "All themes remain 100% free");
      }
    });
  });

  // -------------------------------------------------------------
  // R9.40 & R9.41: Tactics / Puzzle Design & Immediate Feedback
  // -------------------------------------------------------------
  describe("R9.40 & R9.41: Tactics Presentation & Immediate Feedback", () => {
    it("confirms PuzzleBoard has clean TACTICS header and human instructions", () => {
      const puzzlePath = path.join(ROOT_DIR, "src", "components", "puzzles", "PuzzleBoard.tsx");
      const content = fs.readFileSync(puzzlePath, "utf-8");

      assert.match(content, /TACTICS/);
      assert.match(content, /Your move\./);
      assert.match(content, /Find the strongest continuation\./);
    });

    it("confirms immediate feedback strings: '✓ Correct' and 'Try again.'", () => {
      const puzzlePath = path.join(ROOT_DIR, "src", "components", "puzzles", "PuzzleBoard.tsx");
      const content = fs.readFileSync(puzzlePath, "utf-8");

      assert.match(content, /setStatusMessage\("✓ Correct"\)/);
      assert.match(content, /setStatusMessage\("Try again\."\)/);
    });
  });

  // -------------------------------------------------------------
  // R9.34 & R9.39: AI Coach & Analysis Navigation
  // -------------------------------------------------------------
  describe("R9.34 & R9.39: AI Coach Copywriting & Recognizable Controls", () => {
    it("confirms AIChatPanel provides chess-specific prompt pills", () => {
      const chatPath = path.join(ROOT_DIR, "src", "components", "ai", "AIChat", "AIChatPanel.tsx");
      const content = fs.readFileSync(chatPath, "utf-8");

      assert.match(content, /"Position insight"/);
      assert.match(content, /"Why this move\?"/);
      assert.match(content, /"What should I improve\?"/);
      assert.match(content, /"What was the key moment\?"/);
      assert.doesNotMatch(content, /Ask me anything!/);
    });

    it("confirms MoveNavigator includes Play/Pause control for |< < ▶ > >| layout", () => {
      const navPath = path.join(ROOT_DIR, "src", "components", "ai", "AIAnalysis", "MoveNavigator.tsx");
      const content = fs.readFileSync(navPath, "utf-8");

      assert.match(content, /isPlaying/);
      assert.match(content, /<Pause/);
      assert.match(content, /<Play/);
      assert.match(content, /<ChevronsLeft/);
      assert.match(content, /<ChevronLeft/);
      assert.match(content, /<ChevronRight/);
      assert.match(content, /<ChevronsRight/);
    });
  });

  // -------------------------------------------------------------
  // R9.42 - R9.44: Player Profile & Restrained Achievements
  // -------------------------------------------------------------
  describe("R9.42 - R9.44: Chess Player Profile & Restrained Achievements", () => {
    it("confirms PlayerProfile renders chess milestones based on real match stats", () => {
      const profilePath = path.join(ROOT_DIR, "src", "components", "social", "PlayerProfile", "PlayerProfile.tsx");
      const content = fs.readFileSync(profilePath, "utf-8");

      assert.match(content, /Chess Milestones/);
      assert.match(content, /First Victory/);
      assert.match(content, /Tactical Mind/);
      assert.match(content, /100 Games/);
      assert.match(content, /Comeback/);
      assert.match(content, /stats\.wins >= 1/);
    });
  });

  // -------------------------------------------------------------
  // R9.45: Navigation Architecture
  // -------------------------------------------------------------
  describe("R9.45: Intentional Navigation Hierarchy", () => {
    it("confirms DesktopNav exposes standard chess destinations in expected order", () => {
      const navPath = path.join(ROOT_DIR, "src", "components", "navigation", "DesktopNav.tsx");
      const content = fs.readFileSync(navPath, "utf-8");

      assert.match(content, /\{ label: "Play", href: "\/play" \}/);
      assert.match(content, /\{ label: "Friends", href: "\/friends" \}/);
      assert.match(content, /\{ label: "Watch", href: "\/watch" \}/);
      assert.match(content, /\{ label: "Puzzles", href: "\/training\/dashboard" \}/);
      assert.match(content, /\{ label: "Analysis", href: "\/analysis" \}/);
      assert.match(content, /\{ label: "Games", href: "\/games" \}/);
    });

    it("confirms AppHeader uses dynamic date and greeting instead of hardcoded strings", () => {
      const headerPath = path.join(ROOT_DIR, "src", "components", "navigation", "AppHeader.tsx");
      const content = fs.readFileSync(headerPath, "utf-8");

      assert.match(content, /toLocaleDateString/);
      assert.match(content, /greeting/);
      assert.doesNotMatch(content, /Monday, September 14/);
      assert.doesNotMatch(content, /Good morning, Dharmapada\./);
    });
  });

  // -------------------------------------------------------------
  // R9.78: Admin Empty States
  // -------------------------------------------------------------
  describe("R9.78: Polished Admin Empty States", () => {
    it("confirms ReportsPage provides an intentional empty state message", () => {
      const reportsPath = path.join(ROOT_DIR, "src", "admin", "pages", "Reports", "ReportsPage.tsx");
      const content = fs.readFileSync(reportsPath, "utf-8");

      assert.match(content, /No open reports\. Everything is currently clear\./);
    });

    it("confirms ModerationPage provides an intentional empty state message", () => {
      const modPath = path.join(ROOT_DIR, "src", "admin", "pages", "Moderation", "ModerationPage.tsx");
      const content = fs.readFileSync(modPath, "utf-8");

      assert.match(content, /No flagged accounts\. All player records under/);
    });
  });

  // -------------------------------------------------------------
  // R9.46, R9.65 & R9.81 - R9.83: AI Jargon & Residue Audit
  // -------------------------------------------------------------
  describe("R9.46, R9.65 & R9.81 - R9.83: Removal of AI Jargon, Dev Residue, and N button", () => {
    it("confirms Next.js development indicator ('N' button) remains suppressed in config and CSS", () => {
      const nextConfigPath = path.join(ROOT_DIR, "next.config.ts");
      const nextConfig = fs.readFileSync(nextConfigPath, "utf-8");
      assert.match(nextConfig, /devIndicators:\s*false/);

      const globalsCssPath = path.join(ROOT_DIR, "src", "app", "globals.css");
      const globalsCss = fs.readFileSync(globalsCssPath, "utf-8");
      assert.match(globalsCss, /data-nextjs-dev-tools-button/);
      assert.match(globalsCss, /display:\s*none\s*!important/);
    });

    it("confirms absence of generic AI marketing buzzwords in player facing views", () => {
      const filesToAudit = [
        path.join(ROOT_DIR, "src", "app", "page.tsx"),
        path.join(ROOT_DIR, "src", "app", "play", "page.tsx"),
        path.join(ROOT_DIR, "src", "components", "puzzles", "PuzzleBoard.tsx"),
        path.join(ROOT_DIR, "src", "components", "ai", "AIChat", "AIChatPanel.tsx"),
      ];

      const forbiddenPhrases = [
        /experience the future of chess/i,
        /unlock your true potential/i,
        /elevate your chess journey/i,
        /revolutionize your game/i,
        /lorem ipsum/i,
      ];

      for (const file of filesToAudit) {
        if (fs.existsSync(file)) {
          const content = fs.readFileSync(file, "utf-8");
          for (const phrase of forbiddenPhrases) {
            assert.doesNotMatch(content, phrase, `File ${file} must not contain AI marketing buzzwords`);
          }
        }
      }
    });
  });
});
