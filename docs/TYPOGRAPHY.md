# ChessVerse Typography System

The typography system establishes clear hierarchy, effortless readability, and technical precision.

---

## 1. Font Families

### Primary UI Font: Inter
- **Family**: `Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`
- **Source**: `next/font/google`
- **Application**: All interface labels, navigation, headings, body text, buttons, and alerts.
- **Weights**:
  - Regular (`400`): Explanatory body text and captions.
  - Medium (`500`): Interactive buttons, tabs, metadata values.
  - Semi-Bold (`600`): Section headers, active nav items, player usernames.
  - Bold (`700`): Display titles and key milestones.

### Technical & Chess Notation Font: High-Precision Monospace
- **Family**: `ui-monospace, SFMono-Regular, "JetBrains Mono", Menlo, Consolas, monospace`
- **Application**:
  - Chess move notation (SAN / UCI): `1. e4 e5 2. Nf3 Nc6`
  - Clocks and countdown timers: `04:59.2`
  - Numeric ratings and performance stats: `1842 (+12)`
  - FEN strings and engine evaluations: `+1.45`, `M3`

---

## 2. Type Scale

Fluid responsive scales adapt smoothly across mobile, tablet, and desktop viewports:

| Level | Size (Desktop) | Responsive Scale | Line Height | Tracking | Weight |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Display** | 48px | `clamp(2.5rem, 4vw, 3rem)` | 1.1 | `-0.03em` | Bold |
| **H1** | 40px | `clamp(2rem, 3vw, 2.5rem)` | 1.15 | `-0.025em`| Bold |
| **H2** | 32px | `clamp(1.5rem, 2.5vw, 2rem)`| 1.2 | `-0.02em` | Semi-Bold |
| **H3** | 24px | `clamp(1.25rem, 2vw, 1.5rem)`| 1.25 | `-0.015em`| Semi-Bold |
| **H4** | 20px | `1.25rem` | 1.3 | `-0.01em` | Medium / Semi-Bold |
| **Body Large**| 18px | `1.125rem` | 1.5 | `0` | Regular / Medium |
| **Body** | 16px | `1.0rem` | 1.5 | `0` | Regular |
| **Small** | 14px | `0.875rem` | 1.45 | `0.005em` | Regular / Medium |
| **Caption** | 12px | `0.75rem` | 1.4 | `0.01em` | Medium |

---

## 3. Typographic Principles
1. **Never use generic browser fonts** (e.g. standard Times or unstyled Arial).
2. **Tabular Figures for Clocks**: Clock displays use monospace tabular numerals to prevent jitter as seconds tick down.
3. **Restrained Emphasis**: Use font weight (`500` vs `600`) and color opacity (`--color-text` vs `--color-text-secondary`) rather than aggressive uppercase or colored text everywhere.
