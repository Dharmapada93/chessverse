import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

import { boardThemes } from "../../../src/config/boards.js";
import { pieceSets } from "../../../src/config/pieces.js";
import { chessThemes } from "../../../src/config/themes.js";

describe("ChessVerse R1: Project Identity & Design System Acceptance (R1.30)", () => {
  const rootDir = process.cwd();

  it("verifies centralized design tokens file contains complete typography, color, and spacing scales (R1.25)", () => {
    const tokensPath = path.join(rootDir, "src/styles/tokens.css");
    assert.ok(fs.existsSync(tokensPath), "tokens.css must exist");

    const content = fs.readFileSync(tokensPath, "utf8");

    // Typography
    assert.match(content, /--text-display:/);
    assert.match(content, /--text-h1:/);
    assert.match(content, /--text-h2:/);
    assert.match(content, /--text-h3:/);
    assert.match(content, /--text-body:/);
    assert.match(content, /--text-caption:/);

    // Colors
    assert.match(content, /--color-bg:\s*#0D0F12/i);
    assert.match(content, /--color-surface:\s*#15181D/i);
    assert.match(content, /--color-surface-elevated:\s*#1C2026/i);
    assert.match(content, /--color-primary:\s*#D7B875/i);
    assert.match(content, /--color-text:\s*#F4F5F7/i);
    assert.match(content, /--color-border:\s*#2A2F37/i);

    // Chessboard tokens
    assert.match(content, /--chess-light:/);
    assert.match(content, /--chess-dark:/);
    assert.match(content, /--chess-selected:/);
    assert.match(content, /--chess-last-move:/);
    assert.match(content, /--chess-check:/);

    // Spacing
    assert.match(content, /--space-1:\s*4px/);
    assert.match(content, /--space-7:\s*32px/);
    assert.match(content, /--space-11:\s*80px/);

    // Radii
    assert.match(content, /--radius-sm:\s*8px/);
    assert.match(content, /--radius-md:\s*12px/);
    assert.match(content, /--radius-lg:\s*16px/);
    assert.match(content, /--radius-pill:\s*999px/);

    // Light mode definition
    assert.match(content, /\[data-theme="light"\]/);

    // Reduced motion
    assert.match(content, /@media\s*\(prefers-reduced-motion:\s*reduce\)/);
  });

  it("confirms 100% Free-Only product architecture with zero paid/premium badges (R1.29)", () => {
    // Boards
    for (const board of boardThemes) {
      assert.notStrictEqual(
        board.access,
        "premium",
        `Board '${board.name}' must not be locked behind a premium tier`
      );
      assert.strictEqual(board.access, "free");
    }

    // Pieces
    for (const piece of pieceSets) {
      assert.notStrictEqual(
        piece.access,
        "premium",
        `Piece set '${piece.name}' must not be locked behind a premium tier`
      );
      assert.strictEqual(piece.access, "free");
    }

    // Themes
    for (const theme of chessThemes) {
      assert.notStrictEqual(
        theme.access,
        "premium",
        `Theme '${theme.name}' must not be locked behind a premium tier`
      );
      assert.strictEqual(theme.access, "free");
    }
  });

  it("verifies permanent removal and suppression of Next.js 'N' dev indicator button (R1.28)", () => {
    const nextConfigPath = path.join(rootDir, "next.config.ts");
    const nextConfigContent = fs.readFileSync(nextConfigPath, "utf8");
    assert.match(
      nextConfigContent,
      /devIndicators:\s*false/,
      "next.config.ts must disable devIndicators to eliminate the floating N button"
    );

    const globalsCssPath = path.join(rootDir, "src/app/globals.css");
    const globalsCssContent = fs.readFileSync(globalsCssPath, "utf8");
    assert.match(
      globalsCssContent,
      /\[data-nextjs-dev-tools-button\][\s\S]*display:\s*none\s*!important/,
      "globals.css must suppress data-nextjs-dev-tools-button"
    );
  });

  it("verifies brand typography and metadata in root layout (R1.1, R1.2)", () => {
    const layoutPath = path.join(rootDir, "src/app/layout.tsx");
    const layoutContent = fs.readFileSync(layoutPath, "utf8");

    assert.match(layoutContent, /Inter/);
    assert.match(layoutContent, /Play\. Watch\. Improve\./);
    assert.match(layoutContent, /ChessVerse is a real-time multiplayer chess platform/);
  });

  it("verifies all 5 design system documentation artifacts exist and are complete (R1.26)", () => {
    const requiredDocs = [
      "docs/DESIGN_PHILOSOPHY.md",
      "docs/DESIGN_TOKENS.md",
      "docs/TYPOGRAPHY.md",
      "docs/COLOR_SYSTEM.md",
      "docs/BRAND_GUIDELINES.md",
    ];

    for (const doc of requiredDocs) {
      const fullPath = path.join(rootDir, doc);
      assert.ok(fs.existsSync(fullPath), `Documentation file '${doc}' must exist`);
      const content = fs.readFileSync(fullPath, "utf8");
      assert.ok(content.length > 300, `Documentation file '${doc}' must be substantive`);
    }
  });
});
