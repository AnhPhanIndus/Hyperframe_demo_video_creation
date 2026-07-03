---
name: DxFactory × AI Agent — Use Cases (Futuristic)
source: https://dxfac.com/
mood: futuristic, immersive, high-energy tech
format: 1920x1080 landscape, 60s
language: Vietnamese (with standard EN product terms: AI Agent, OEE, MTTR, drill-down, RCA)
---

# DxFACTORY × AI AGENT — Brand Cheat Sheet

A 60-second futuristic product film introducing **two AI-Agent use cases** of the
DxFACTORY (New Ocean Group) Industry-4.0 manufacturing platform. Built on the
shared "Data Drift" visual language: weightless thin type, particle fields, light
traces, deep space-black with cyan/violet energy — and real product screenshots
shown inside glowing device frames.

The two use cases:
1. **DxFactory Operations Intelligence** — automate reports & drill-down; "ask your
   factory data" in plain language across MES / CMMS / Excel.
2. **AI Maintenance Assistant (CMMS RCA)** — real-time root-cause analysis,
   continuous learning, expert-knowledge preservation.

## Colors

| Token        | Hex       | Use                                        |
| ------------ | --------- | ------------------------------------------ |
| bg-deep      | `#05070d` | Base background (deep space black)         |
| bg-panel     | `#0c1426` | Cards / module chips / device frame        |
| ink          | `#eaf2ff` | Primary text                               |
| muted        | `#9fb6df` | Secondary text (passes AA on bg-deep)      |
| cyan         | `#22d3ee` | Primary accent — highlights, glow          |
| cyan-deep    | `#06b6d4` | Accent gradient stop                       |
| violet       | `#a78bfa` | Secondary accent                           |
| violet-deep  | `#7c3aed` | Accent gradient stop / glow                |
| line         | `rgba(34,211,238,0.22)` | Hairlines, grid, chip borders   |

Accent gradient (titles, key numbers): `linear-gradient(100deg, #22d3ee, #a78bfa)`.

## Typography

- **Headline / title:** `Inter`, weight 200–700; large display 700 with cyan→violet
  gradient clip; tight letter-spacing on big type.
- **Eyebrow / labels:** `Inter` 600, UPPERCASE, `letter-spacing: 0.32em`, cyan.
- **Codes / metrics tags (UC-01, MTTR…):** `JetBrains Mono` 700 — technical feel.
- Body min 24px, data labels min 18px, headlines 64px+.
- `font-variant-numeric: tabular-nums` on stat numbers.

## Motion

- Energy: **high**. Entrances 0.4–0.9s. Eases: `expo.out`, `power3.out`,
  `back.out(1.6)` — vary at least 3 per scene.
- Transition: **blur crossfade** (4–6px blur, slight scale shift, ~0.4s,
  `power2.inOut`). Staggered pop on label chips and stats.
- Device frames: screenshots float in with a slow parallax drift + cyan rim glow.
- Ambient: persistent particle field + drifting cyan/violet glow + perspective data
  grid floor. All finite-repeat, fully seekable. No `repeat: -1`.

## Do's

- Radial glows on dark (never full-screen linear gradients — H.264 banding).
- Soft radial scrim behind dense text; keep living background subtle.
- Real screenshots are the heroes of each use-case scene; labels call out the
  highlight, never bury the image.

## Don'ts

- No `#333` / `#3b82f6` / Roboto. No web-UI opacity on accents.
- No exit animations except the final scene. No jump cuts — always transition.
- No invented colors outside the palette above.
