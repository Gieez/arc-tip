# Design Direction: ArcTip

## Project
ArcTip: Native USDC Tipping and Micro-Payment Link on Circle's Arc Layer 1.

## Purpose
Enable any creator, developer, or freelancer to generate a personal payment link, receive non-custodial native USDC tips on Arc with zero token approvals, sub-second settlement, and sub-cent fees.

## Audience
Web3 creators, open-source maintainers, freelancers, and hackathon judges evaluating Arc Layer 1 capabilities.

## Brand Character
Precise, tactile, fintech-grade, minimal, robust, transparent.

## Visual Concept
Tactile Digital Payment Slip / Institutional Terminal. High-contrast dark surfaces with crisp monetary readouts and mechanical feedback. Every interaction feels fast and definitive.

## Art Direction
Technical Swiss-Fintech. Matte obsidian slate backgrounds, crisp micro-borders, clean typography, monospace numeric readouts, zero generic AI slop, zero purple blob gradients.

## Typography
- Display / Headings: Modern geometric sans with tight tracking (`Inter`, `system-ui`).
- Numerics / Hashes / Addresses: Tabular monospace (`JetBrains Mono`, `ui-monospace`).
- Text Treatment: High-contrast headings, muted labels, clear currency units.

## Color System
- Canvas Background: `#0B0E14` (Deepest Obsidian)
- Card Surface: `#121722` (Subtle elevation)
- Card Surface Hover: `#182030`
- Border Base: `#1E2638`
- Border Active / Focus: `#2775CA` (Circle Brand Blue)
- Accent Primary: `#00D2FF` (Electric Arc Cyan)
- Accent Green: `#10B981` (Settlement confirmation)
- Text Primary: `#F8FAFC`
- Text Muted: `#94A3B8`
- Error: `#EF4444`

## Composition & Layout
- Focused card architecture with immediate actionability.
- No endless decorative marketing filler. Direct utility first.
- Adaptive split on desktop: Left panel (Creator Profile & Payment Slip), Right panel (Live Arc Network Status & On-Chain Feed).
- Single-column flow on mobile with sticky quick-action bar.

## Shape Language
- Consistent radius scale: `rounded-xl` (12px) for cards, `rounded-lg` (8px) for inputs and chips.
- 1px hairline borders (`border border-[#1E2638]`).
- Subtle inner glows instead of heavy blurred drop shadows.

## Motion
- Fast, tactile transitions (150ms - 200ms ease-out).
- Scale tap effects on payment buttons (`active:scale-95`).
- Live pulse indicator on network status.
- Respect `prefers-reduced-motion`.

## Forbidden Patterns
- No floating purple/pink neon gradient blobs.
- No generic 3-card SaaS pricing grids.
- No decorative 3D balls or meaningless glassmorphism.
- Zero em-dashes used as stylistic filler.
