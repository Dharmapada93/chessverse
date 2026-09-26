import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { FEATURES, isFeatureAvailable, FEATURE_METADATA } from "../../../src/config/features.js";
import { chessThemes } from "../../../src/config/themes.js";
import { defaultNavItems } from "../../../src/components/navigation/DesktopNav.js";
import { User } from "../../../server/src/models/User.js";

const ROOT_DIR = path.resolve(process.cwd());
const SERVER_DIR = path.resolve(ROOT_DIR, "server");

describe("ChessVerse R7: Free-Only Product Audit Acceptance (R7.1 - R7.84)", () => {
  // -------------------------------------------------------------
  // R7.5: Free Feature Matrix Definition
  // -------------------------------------------------------------
  describe("R7.5 & R7.6: Free Feature Matrix & Zero Feature Locks", () => {
    it("confirms FEATURES matrix has all player-facing capabilities enabled by default", () => {
      assert.equal(FEATURES.realtimeGames, true);
      assert.equal(FEATURES.friends, true);
      assert.equal(FEATURES.spectators, true);
      assert.equal(FEATURES.gameAnalysis, true);
      assert.equal(FEATURES.aiCoach, true);
      assert.equal(FEATURES.aiOpponent, true);
      assert.equal(FEATURES.puzzles, true);
      assert.equal(FEATURES.themes, true);
      assert.equal(FEATURES.tournaments, true);
    });

    it("verifies isFeatureAvailable() returns true for all capabilities", () => {
      const keys = Object.keys(FEATURES) as (keyof typeof FEATURES)[];
      for (const key of keys) {
        assert.equal(isFeatureAvailable(key), true, `Feature ${key} should be available`);
      }
    });

    it("verifies all feature metadata provides descriptions without pricing mentions", () => {
      for (const [key, meta] of Object.entries(FEATURE_METADATA)) {
        assert.ok(meta.title, `Feature ${key} must have title`);
        assert.ok(meta.description, `Feature ${key} must have description`);
        assert.doesNotMatch(meta.description.toLowerCase(), /price|subscription|\$|₹|upgrade/);
      }
    });
  });

  // -------------------------------------------------------------
  // R7.9 - R7.10: Board Themes & Customization
  // -------------------------------------------------------------
  describe("R7.9 & R7.10: Free Board Themes & Customization", () => {
    it("confirms all board themes are marked free with zero locked themes", () => {
      assert.ok(chessThemes.length >= 6, "At least 6 themes should be defined");
      for (const theme of chessThemes) {
        assert.equal(theme.access, "free", `Theme ${theme.name} must be accessible for free`);
        assert.ok(theme.board.light && theme.board.dark, `Theme ${theme.name} must define board squares`);
      }
    });
  });

  // -------------------------------------------------------------
  // R7.22 & R7.58: Dependency & Package Audit
  // -------------------------------------------------------------
  describe("R7.22 & R7.58: Package & Payment Dependency Audit", () => {
    it("confirms root package.json contains zero payment or subscription SDKs", () => {
      const pkgPath = path.join(ROOT_DIR, "package.json");
      const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
      const allDeps = {
        ...pkg.dependencies,
        ...pkg.devDependencies,
      };

      const forbidden = ["stripe", "razorpay", "paypal", "lemonsqueezy", "paddle", "braintree"];
      for (const dep of Object.keys(allDeps)) {
        for (const f of forbidden) {
          assert.equal(
            dep.toLowerCase().includes(f),
            false,
            `Root dependencies must not contain payment package: ${dep}`
          );
        }
      }
    });

    it("confirms server package.json contains zero payment or subscription SDKs", () => {
      const pkgPath = path.join(SERVER_DIR, "package.json");
      const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
      const allDeps = {
        ...pkg.dependencies,
        ...pkg.devDependencies,
      };

      const forbidden = ["stripe", "razorpay", "paypal", "lemonsqueezy", "paddle", "braintree"];
      for (const dep of Object.keys(allDeps)) {
        for (const f of forbidden) {
          assert.equal(
            dep.toLowerCase().includes(f),
            false,
            `Server dependencies must not contain payment package: ${dep}`
          );
        }
      }
    });
  });

  // -------------------------------------------------------------
  // R7.24 & R7.82: Database Models Audit
  // -------------------------------------------------------------
  describe("R7.24 & R7.82: Database Models Audit", () => {
    it("confirms no commercial or subscription models exist in server/src/models", () => {
      const modelsDir = path.join(SERVER_DIR, "src", "models");
      const files = fs.readdirSync(modelsDir);

      const forbiddenModels = [
        "subscription",
        "plan",
        "payment",
        "invoice",
        "billing",
        "transaction",
        "checkout",
      ];

      for (const file of files) {
        const base = path.basename(file, path.extname(file)).toLowerCase();
        for (const f of forbiddenModels) {
          assert.notEqual(
            base,
            f,
            `Model file ${file} should not represent commercial/billing entity`
          );
        }
      }
    });
  });

  // -------------------------------------------------------------
  // R7.25 & R7.26: User Model Cleanliness
  // -------------------------------------------------------------
  describe("R7.25 & R7.26: User Model Cleanliness", () => {
    it("verifies User schema focuses strictly on identity, rating, and role without plan attributes", () => {
      const schemaPaths = Object.keys(User.schema.paths);
      assert.ok(schemaPaths.includes("role"), "User must have role field");
      assert.ok(schemaPaths.includes("accountStatus"), "User must have accountStatus field");
      assert.ok(schemaPaths.includes("rating"), "User must have rating field");
      assert.ok(schemaPaths.includes("username"), "User must have username field");

      // Verify no commercial plan or tier fields exist on User schema
      assert.equal(schemaPaths.includes("plan"), false, "User must not have plan field");
      assert.equal(schemaPaths.includes("isPremium"), false, "User must not have isPremium field");
      assert.equal(schemaPaths.includes("subscription"), false, "User must not have subscription field");
      assert.equal(schemaPaths.includes("subscriptionTier"), false, "User must not have subscriptionTier field");
    });
  });

  // -------------------------------------------------------------
  // R7.2: Route Audit (No Pricing or Checkout Pages)
  // -------------------------------------------------------------
  describe("R7.2 & R7.59: Public Route Audit", () => {
    it("confirms no pricing, plans, checkout, or billing routes exist in src/app", () => {
      const appDir = path.join(ROOT_DIR, "src", "app");
      const forbiddenRoutes = ["pricing", "plans", "subscribe", "checkout", "billing", "upgrade"];

      for (const route of forbiddenRoutes) {
        const routePath = path.join(appDir, route);
        assert.equal(
          fs.existsSync(routePath),
          false,
          `Route /${route} must not exist in src/app`
        );
      }
    });

    it("confirms public /features route exists for free feature transparency (R7.43)", () => {
      const featuresPage = path.join(ROOT_DIR, "src", "app", "features", "page.tsx");
      assert.ok(fs.existsSync(featuresPage), "/features page must exist");
      const content = fs.readFileSync(featuresPage, "utf-8");
      assert.match(content, /100% Free/);
      assert.match(content, /No Subscriptions/);
    });
  });

  // -------------------------------------------------------------
  // R7.30 & R7.31: Navigation & CTA Audit
  // -------------------------------------------------------------
  describe("R7.30 & R7.31: Desktop Navigation & Homepage CTAs", () => {
    it("verifies DesktopNav contains zero commercial items", () => {
      for (const item of defaultNavItems) {
        assert.doesNotMatch(item.label.toLowerCase(), /pricing|pro|upgrade|subscribe|plan/);
      }
    });

    it("verifies DesktopNav includes standard free chess features", () => {
      const labels = defaultNavItems.map((item) => item.label);
      assert.ok(labels.includes("Play"));
      assert.ok(labels.includes("Watch"));
      assert.ok(labels.includes("Analysis"));
      assert.ok(labels.includes("Friends"));
      assert.ok(labels.includes("Features"));
    });
  });

  // -------------------------------------------------------------
  // R7.57: Environment Variables Audit
  // -------------------------------------------------------------
  describe("R7.57: Environment Template Audit", () => {
    it("confirms .env.example contains zero payment API keys", () => {
      const envPath = path.join(ROOT_DIR, ".env.example");
      const envContent = fs.readFileSync(envPath, "utf-8");

      assert.doesNotMatch(envContent, /STRIPE_/);
      assert.doesNotMatch(envContent, /RAZORPAY_/);
      assert.doesNotMatch(envContent, /PAYPAL_/);
      assert.doesNotMatch(envContent, /BILLING_/);
    });
  });

  // -------------------------------------------------------------
  // R7.69: Dev Overlay 'N' Button Removal
  // -------------------------------------------------------------
  describe("R7.69: Next.js Dev Overlay 'N' Button Suppression", () => {
    it("confirms global CSS suppresses all Next.js dev overlay indicator selectors", () => {
      const cssPath = path.join(ROOT_DIR, "src", "app", "globals.css");
      const css = fs.readFileSync(cssPath, "utf-8");

      assert.match(css, /\[data-nextjs-dev-tools-button\]/);
      assert.match(css, /#nextjs-dev-tools-button/);
      assert.match(css, /nextjs-portal/);
      assert.match(css, /display:\s*none\s*!important/);
    });
  });
});
