---
name: DxFactory — Data Drift (Futuristic)
source: https://dxfac.com/
mood: futuristic, immersive, high-energy tech
format: 1920x1080 landscape, 20s
language: Vietnamese
---

# DxFACTORY — Brand Cheat Sheet

A 20-second futuristic product intro for **DxFACTORY** (New Ocean Group) — a
comprehensive Industry-4.0 manufacturing digital-transformation platform.
Visual language: "Data Drift" — weightless thin type, particle fields, light
traces, deep space-black with cyan/violet energy.

## Colors

| Token        | Hex       | Use                                        |
| ------------ | --------- | ------------------------------------------ |
| bg-deep      | `#05070d` | Base background (deep space black)         |
| bg-panel     | `#0c1426` | Cards / module chips                       |
| ink          | `#eaf2ff` | Primary text                               |
| muted        | `#9fb6df` | Secondary text (passes AA on bg-deep)      |
| cyan         | `#22d3ee` | Primary accent — highlights, glow          |
| cyan-deep    | `#06b6d4` | Accent gradient stop                       |
| violet       | `#a78bfa` | Secondary accent                           |
| violet-deep  | `#7c3aed` | Accent gradient stop / glow                |
| line         | `rgba(34,211,238,0.22)` | Hairlines, grid, chip borders   |

Accent gradient (titles, key numbers): `linear-gradient(100deg, #22d3ee, #a78bfa)`.

## Typography

- **Headline / title:** `Inter`, weight 200–700. Large display titles use 700
  with a cyan→violet gradient clip. Letter-spacing tight on big type.
- **Eyebrow / labels:** `Inter` 600, UPPERCASE, `letter-spacing: 0.32em`, cyan.
- **Module codes (DxAPS, DxMPM…):** `JetBrains Mono` 700 — gives them a
  technical, "system" feel.
- Body min 24px, data labels min 18px, headlines 64px+.
- `font-variant-numeric: tabular-nums` on stat numbers.

## Motion

- Energy: **high**. Entrances 0.4–0.9s. Eases: `expo.out`, `power3.out`,
  `back.out(1.6)` — vary at least 3 per scene.
- Transition: **blur crossfade** (high-energy variant — 4–6px blur, slight
  scale shift, ~0.35s, `power2.inOut`). One staggered/pop accent on the module
  grid and stats.
- Ambient: persistent particle field + slow drifting cyan/violet glow + a
  perspective "data grid" floor scrolling toward the viewer. All finite-repeat,
  fully seekable. No `repeat: -1`.

## Atmosphere

particle-field · light-traces · radial-glow · perspective grid · soft vignette

## Do's

- Radial glows on dark (never full-screen linear gradients — H.264 banding).
- Keep the living background subtle so text stays readable; add a soft radial
  scrim behind dense text.
- Thin, weightless type that floats in; numbers and module codes are the heroes.

## Don'ts

- No `#333` / `#3b82f6` / Roboto. No web-UI opacity on accents.
- No exit animations except the final scene. No jump cuts — always transition.
- No invented colors outside the palette above.
