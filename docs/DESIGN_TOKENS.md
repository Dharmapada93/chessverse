# ChessVerse Design Tokens Reference

All design tokens are centrally managed in [`src/styles/tokens.css`](file:///c:/Users/dharm/chessverse/src/styles/tokens.css) and exposed globally across the application.

---

## 1. Spacing Scale

Based on an 8-point structural system with 4px half-step refinements:

| Token | Value | Recommended Usage |
| :--- | :--- | :--- |
| `--space-1` | 4px | Micro-adjustments, compact icon offsets |
| `--space-2` | 8px | Button inline gaps, badge margins |
| `--space-3` | 12px | Compact padding, input vertical padding |
| `--space-4` | 16px | Standard button padding, list item gaps |
| `--space-5` | 20px | Compact card interior padding |
| `--space-6` | 24px | Standard card padding, modal content gap |
| `--space-7` | 32px | Page margins, major grid gaps |
| `--space-8` | 40px | Section headers spacing |
| `--space-9` | 48px | Primary view section gaps |
| `--space-10` | 64px | Landing page hero vertical breathing room |
| `--space-11` | 80px | Major page transitions and footer offsets |

---

## 2. Border Radius Scale

Restrained curve hierarchy to maintain crisp architectural structure:

| Token | Value | Recommended Usage |
| :--- | :--- | :--- |
| `--radius-sm` | 8px | Small badges, mini swatches, piece tiles |
| `--radius-md` | 12px | Standard buttons, inputs, chessboard container |
| `--radius-lg` | 16px | Cards, navigation bars, dropdowns, panels |
| `--radius-pill`| 999px | Status tags, avatars, pill action buttons |

---

## 3. Shadows & Elevation

Shadows are utilized exclusively for physical depth hierarchy (dropdowns, modals, floating overlays):

| Token | Definition | Usage |
| :--- | :--- | :--- |
| `--shadow-sm` | `0 1px 2px rgba(0,0,0,0.25)` | Elevated buttons, subtle borders |
| `--shadow-md` | `0 4px 12px rgba(0,0,0,0.35)` | Dropdowns, popovers, hovering cards |
| `--shadow-lg` | `0 12px 32px rgba(0,0,0,0.45)` | Floating control bars, toasts |
| `--shadow-modal` | `0 24px 64px rgba(0,0,0,0.65)` | Dialog overlays, modals, confirmation sheets |

---

## 4. Motion & Micro-Interactions

| Token | Duration | Purpose |
| :--- | :--- | :--- |
| `--duration-fast` | 120ms | Button clicks, toggles, hover feedback |
| `--duration-normal`| 240ms | Drawer slides, modal entrance, navigation transitions |
| `--duration-slow` | 350ms | Screen cross-fades, layout reorganizations |
| `--duration-chess`| 200ms | Authoritative piece moves, square highlights |

All transitions respect `@media (prefers-reduced-motion: reduce)` by collapsing duration to instantaneous execution.
