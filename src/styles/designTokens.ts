/**
 * ChessVerse Design System Tokens (R9: Human-Made Design Audit)
 * Centralized, typed programmatic definitions for typography, colors,
 * radius, spacing, motion, borders, and shadows.
 */

export const DESIGN_TOKENS = {
  // R9.4: Typography Scale
  typography: {
    fontSans: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontMono: 'ui-monospace, SFMono-Regular, "JetBrains Mono", Menlo, Monaco, Consolas, monospace',
    scale: {
      display: "clamp(2rem, 3.5vw, 2.75rem)", // 32-44px (no 100px marketing hero)
      heading: "clamp(1.5rem, 2.5vw, 2rem)",  // 24-32px
      section: "1.25rem",                     // 20px
      body: "1rem",                            // 16px
      small: "0.875rem",                       // 14px
      metadata: "0.75rem",                     // 12px
    },
  },

  // R9.51: Border Radius Scale
  radius: {
    sm: "8px",     // Buttons, chips, small inputs
    md: "12px",    // Cards, popovers, dropdowns
    lg: "16px",    // Modals, board containers
    panel: "20px", // Major section panels
    pill: "999px", // Status badges
  },

  // Spacing Scale
  spacing: {
    1: "4px",
    2: "8px",
    3: "12px",
    4: "16px",
    5: "20px",
    6: "24px",
    8: "32px",
    12: "48px",
  },

  // R14: Semantic Colors (Warm Ivory & Muted Gold Accent)
  colors: {
    light: {
      bg: "#F7F4EC",
      bgAlt: "#EFECE3",
      surface: "#FAF8F2",
      surfaceElevated: "#FFFFFF",
      surfaceHover: "#F3EFE6",
      border: "rgba(30, 30, 20, 0.10)",
      borderSubtle: "rgba(30, 30, 20, 0.06)",
      text: "#171A18",
      textSecondary: "#68706A",
      textMuted: "#8A948D",
    },
    dark: {
      bg: "#0a0a0a",
      surface: "#11110f",
      surfaceElevated: "#181816",
      surfaceHover: "#20201d",
      border: "#282a2e",
      borderSubtle: "#1c1e22",
      text: "#f4f1e9",
      textSecondary: "#a8adb7",
      textMuted: "#717784",
    },
    accent: {
      primary: "#d7b875",
      gold: "#B88A32",
      primaryHover: "#A07628",
      primaryMuted: "rgba(184, 138, 50, 0.15)",
      forest: "#285C4D",
      emerald: "#1F9D68",
    },
    status: {
      success: "#1F9D68",
      warning: "#d97706",
      danger: "#dc2626",
      info: "#2563eb",
    },
  },

  // R9.48: Standard Icon Sizes
  icons: {
    sm: 16,
    md: 18,
    lg: 20,
    xl: 24,
  },

  // R9.60 & R9.61: Motion Budget
  motion: {
    fast: "120ms",
    normal: "180ms",
    chess: "200ms",
    ease: "cubic-bezier(0.16, 1, 0.3, 1)",
  },
} as const;

export type DesignTokens = typeof DESIGN_TOKENS;
