# ChessVerse Color System

A sophisticated neutral foundation with a single distinctive, burnished warm-gold accent used with restraint.

---

## 1. Dark Mode Depth Architecture (Default)

Dark mode in ChessVerse is structured around physical layer elevation rather than flat black:

```
┌────────────────────────────────────────────────────────┐
│ Layer 1: Background (#0D0F12)                          │
│   ┌────────────────────────────────────────────────┐   │
│   │ Layer 2: Surface (#15181D)                     │   │
│   │   ┌────────────────────────────────────────┐   │   │
│   │   │ Layer 3: Surface Elevated (#1C2026)    │   │   │
│   │   │   ┌────────────────────────────────┐   │   │   │
│   │   │   │ Layer 4: Modal (#222730)       │   │   │   │
│   │   │   │   ┌────────────────────────┐   │   │   │   │
│   │   │   │   │ Layer 5: Tooltip       │   │   │   │   │
│   │   │   │   │ (#2C323D)              │   │   │   │   │
│   │   │   │   └────────────────────────┘   │   │   │   │
│   │   │   └────────────────────────────────┘   │   │   │
│   │   └────────────────────────────────────────┘   │   │
│   └────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────┘
```

| Role | Token | Hex / Value | Contrast Ratio against Text |
| :--- | :--- | :--- | :--- |
| **Background** | `--color-bg` | `#0D0F12` | 17.5:1 (AAA) |
| **Surface** | `--color-surface` | `#15181D` | 15.2:1 (AAA) |
| **Elevated Surface** | `--color-surface-elevated` | `#1C2026` | 13.6:1 (AAA) |
| **Hover Surface** | `--color-surface-hover` | `#232830` | 11.8:1 (AAA) |
| **Primary Text** | `--color-text` | `#F4F5F7` | N/A |
| **Secondary Text** | `--color-text-secondary` | `#A8ADB7` | 6.8:1 (AA) |
| **Muted Text** | `--color-text-muted` | `#717784` | 4.6:1 (AA) |
| **Border** | `--color-border` | `#2A2F37` | Structural delimiter |
| **Brand Accent** | `--color-primary` | `#D7B875` | Burnished Gold |
| **Accent Hover** | `--color-primary-hover` | `#C4A45E` | Deep Gold |

---

## 2. Light Mode Foundation

Light mode is a tailored warm-stone palette rather than an aggressive pure-white inversion:

| Role | Token | Value |
| :--- | :--- | :--- |
| **Background** | `--color-bg` | `#F5F5F2` (Warm Alabaster) |
| **Surface** | `--color-surface` | `#FFFFFF` (Pure White) |
| **Elevated** | `--color-surface-elevated` | `#FAFAF8` (Off-white) |
| **Text** | `--color-text` | `#17191C` (Deep Charcoal) |
| **Secondary Text** | `--color-text-secondary` | `#626872` (Slate Grey) |
| **Border** | `--color-border` | `#E3E5E8` |

---

## 3. Chessboard Color Language

The chessboard is the primary visual instrument. Colors are calibrated for zero eye-strain during multi-hour matches:

| Square / State | Token | Default Value | Notes |
| :--- | :--- | :--- | :--- |
| **Light Squares** | `--chess-light` | `#EADECA` | Warm ivory tone |
| **Dark Squares** | `--chess-dark` | `#4A5058` | Deep wood / charcoal slate |
| **Selected Square**| `--chess-selected` | `rgba(215, 184, 117, 0.50)` | Gold boundary glow |
| **Last Move** | `--chess-last-move` | `rgba(215, 184, 117, 0.28)` | Subtle history trail |
| **Legal Move Dot** | `--chess-legal-move` | `rgba(215, 184, 117, 0.35)` | Clean circular dot |
| **Check Alert** | `--chess-check` | `rgba(239, 68, 68, 0.65)` | Clear warning red |
| **Checkmate** | `--chess-checkmate` | `rgba(220, 38, 38, 0.85)` | Terminal state indicator |

### Prohibited Board Styles
- ❌ No radioactive neons or hyper-saturated purples
- ❌ No low-contrast squares that obscure black piece silhouettes
- ❌ No distracting animated textures or glitter effects on squares
