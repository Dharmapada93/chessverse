import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

import { boardThemes } from "../../../src/config/boards.js";
import { pieceSets } from "../../../src/config/pieces.js";
import { defaultNavItems } from "../../../src/components/navigation/DesktopNav.js";

describe("ChessVerse R2: Premium UI System Acceptance (R2.45)", () => {
  const rootDir = process.cwd();

  it("verifies all core UI primitive components exist and are properly structured (R2.1, R2.43)", () => {
    const requiredPrimitives = [
      "src/components/ui/Button.tsx",
      "src/components/ui/IconButton.tsx",
      "src/components/ui/Input.tsx",
      "src/components/ui/Search.tsx",
      "src/components/ui/Card.tsx",
      "src/components/ui/Avatar.tsx",
      "src/components/ui/Badge.tsx",
      "src/components/ui/Dialog.tsx",
      "src/components/ui/Toast.tsx",
      "src/components/ui/Tooltip.tsx",
      "src/components/ui/Tabs.tsx",
      "src/components/ui/Dropdown.tsx",
      "src/components/ui/Skeleton.tsx",
      "src/components/ui/EmptyState.tsx",
      "src/components/ui/ErrorState.tsx",
      "src/components/ui/LoadingOverlay.tsx",
      "src/components/ui/PageContainer.tsx",
      "src/components/ui/SectionHeader.tsx",
      "src/components/ui/ConnectionIndicator.tsx",
      "src/components/ui/Divider.tsx",
    ];

    for (const relPath of requiredPrimitives) {
      const fullPath = path.join(rootDir, relPath);
      assert.ok(fs.existsSync(fullPath), `UI Primitive '${relPath}' must exist`);
      const content = fs.readFileSync(fullPath, "utf8");
      assert.ok(content.length > 100, `UI Primitive '${relPath}' must not be empty`);
    }
  });

  it("verifies Button system supports all required variants, accessible focus, and loading states (R2.5, R2.6)", () => {
    const buttonPath = path.join(rootDir, "src/components/ui/Button.tsx");
    const content = fs.readFileSync(buttonPath, "utf8");

    // Variants
    assert.match(content, /"primary"/);
    assert.match(content, /"secondary"/);
    assert.match(content, /"ghost"/);
    assert.match(content, /"danger"/);
    assert.match(content, /"outline"/);
    assert.match(content, /"icon"/);

    // States
    assert.match(content, /isLoading/);
    assert.match(content, /disabled/);
    assert.match(content, /focus-visible:ring-2/);
    assert.match(content, /aria-busy/);
  });

  it("verifies Badge system supports all required status indicators (R2.12)", () => {
    const badgePath = path.join(rootDir, "src/components/ui/Badge.tsx");
    const content = fs.readFileSync(badgePath, "utf8");

    assert.match(content, /"live"/);
    assert.match(content, /"online"/);
    assert.match(content, /"offline"/);
    assert.match(content, /"draw"/);
    assert.match(content, /"win"/);
    assert.match(content, /"loss"/);
    assert.match(content, /"admin"/);
    assert.match(content, /"ai"/);
    assert.match(content, /"spectator"/);
  });

  it("verifies application shells and layouts exist and enforce game room hierarchy (R2.1, R2.2)", () => {
    const layouts = [
      "src/layouts/AppLayout.tsx",
      "src/layouts/GameLayout.tsx",
      "src/layouts/AdminLayout.tsx",
    ];

    for (const l of layouts) {
      const fullPath = path.join(rootDir, l);
      assert.ok(fs.existsSync(fullPath), `Layout '${l}' must exist`);
    }

    const gameLayout = fs.readFileSync(path.join(rootDir, "src/layouts/GameLayout.tsx"), "utf8");
    assert.match(gameLayout, /board/, "GameLayout must accept centered board");
    assert.match(gameLayout, /topPlayer/);
    assert.match(gameLayout, /bottomPlayer/);
    assert.match(gameLayout, /controls/);
    assert.match(gameLayout, /sidebar/);
  });

  it("verifies desktop navigation role-gating keeps admin link off standard user navigation (R2.3)", () => {
    // Default nav items must not contain Admin
    const hasAdminInDefault = defaultNavItems.some((item) => item.label.toLowerCase() === "admin");
    assert.strictEqual(hasAdminInDefault, false, "Default navigation must not expose Admin to standard users");
  });

  it("verifies game and admin UI primitives exist (R2.37, R2.38)", () => {
    const gameAndAdminPrimitives = [
      "src/components/game/GameCard.tsx",
      "src/components/game/PlayerInfo.tsx",
      "src/components/game/GameStatus.tsx",
      "src/components/game/GameControls.tsx",
      "src/components/game/SpectatorCount.tsx",
      "src/components/player/PlayerCard.tsx",
      "src/components/admin/AdminTable.tsx",
      "src/components/admin/StatCard.tsx",
      "src/components/admin/FilterBar.tsx",
      "src/components/admin/ActionMenu.tsx",
      "src/components/admin/AuditLog.tsx",
      "src/components/admin/ModerationDialog.tsx",
    ];

    for (const p of gameAndAdminPrimitives) {
      const fullPath = path.join(rootDir, p);
      assert.ok(fs.existsSync(fullPath), `Primitive '${p}' must exist`);
    }
  });

  it("verifies Free Theme Studio page exists and is 100% unlocked with zero commercial badges (R2.28)", () => {
    const themeStudioPath = path.join(rootDir, "src/app/theme-studio/page.tsx");
    assert.ok(fs.existsSync(themeStudioPath), "Theme Studio page must exist");

    const content = fs.readFileSync(themeStudioPath, "utf8");
    assert.doesNotMatch(content, /premium/i, "Theme studio must not contain commercial/premium badges");
    assert.doesNotMatch(content, /upgrade/i, "Theme studio must not prompt for upgrades");
    assert.doesNotMatch(content, /subscribe/i, "Theme studio must not prompt for subscriptions");

    // All boards and pieces must be free
    assert.strictEqual(boardThemes.every((b) => b.access === "free"), true);
    assert.strictEqual(pieceSets.every((p) => p.access === "free"), true);
  });
});
