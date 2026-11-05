---
name: NextJob Design System
description: Editorial, high-contrast, verified career workspace
colors:
  primary: "#18181b"
  primary-foreground: "#ffffff"
  background: "#ffffff"
  foreground: "#09090b"
  muted: "#f4f4f5"
  muted-foreground: "#71717a"
  card: "#ffffff"
  card-foreground: "#09090b"
  border: "#e4e4e7"
  accent-success: "#10b981"
  accent-warning: "#f59e0b"
  accent-danger: "#ef4444"
typography:
  display:
    fontFamily: "var(--font-serif), Source Serif 4, Georgia, serif"
    fontSize: "1.75rem"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "-0.02em"
  sans:
    fontFamily: "var(--font-sans), Geist, -apple-system, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "normal"
  mono:
    fontFamily: "var(--font-mono), Geist Mono, monospace"
    fontSize: "0.75rem"
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: "normal"
rounded:
  sm: "6px"
  md: "8px"
  lg: "12px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-foreground}"
    rounded: "{rounded.md}"
    padding: "8px 16px"
  card-surface:
    backgroundColor: "{colors.card}"
    textColor: "{colors.card-foreground}"
    rounded: "{rounded.lg}"
    padding: "16px"
---

## Overview

NextJob employs a calm, high-contrast editorial design language termed "Ink & Paper". It prioritizes reading clarity, verifiable evidence, and actionability over decorative animations or analytics noise. Interfaces serve the candidate through dense, structured layouts, crisp typography, and semantic verification cues.

## Colors

The palette is built on restrained, high-contrast neutrals tinted subtly toward ink-slate with intentional semantic accents:

- **Ink / Text (`#09090b` / Dark: `#f4f4f5`)**: Deep, readable typography.
- **Paper / Surface (`#ffffff` / Dark: `#09090b`)**: High contrast, minimal visual noise.
- **Moss / Emerald (`#10b981`)**: Signals verified facts, authentic cryptographic receipts, and satisfied criteria.
- **Amber (`#f59e0b`)**: Signals pending human approvals, uncertain submissions, and disputed dates.
- **Rose / Red (`#ef4444`)**: Signals hard eligibility blockers, rejected claims, and validation errors.

## Typography

- **Sans (`Geist`)**: Used for all UI controls, data tables, metrics, navigation, and body copy.
- **Editorial Display (`Source Serif 4`)**: Used for document titles, CV headings, and editorial section intros.
- **Monospace (`Geist Mono`)**: Used for SHA-256 hashes, submission receipt codes, dates, and tabular numbers.
- **Arabic Typography**: Full native directionality (`dir="rtl"`) with natural line heights and aligned text flows.

## Elevation

- Flat, tactile borders (`1px solid {colors.border}`) define surface boundaries.
- Shadows are ultra-subtle (`shadow-xs` / `shadow-2xs`), avoiding floating card clichés.
- High-contrast modals and dialogs use clean borders with minimal backdrop dimming (`backdrop-blur-sm`).

## Components

- **Metric Cards**: Minimal horizontal rhythm, single key number, secondary status context. Never nested.
- **Evidence Pill**: Compact badge indicating claim verification state (`verified`, `pending_review`, `unverified`).
- **Cryptographic Receipt Inspector**: Monospaced fingerprint viewer displaying payload SHA-256 and proof verification.
- **Statement Review Row**: Interactive sentence-level diff allowing single-click accept, edit, or reject.

## Do's and Don'ts

### Do:

- Keep the primary action immediately apparent on every screen.
- Provide clear visual distinction between verified facts and proposed updates.
- Display exact reason codes when an opportunity is deemed ineligible.
- Support full keyboard navigation and accessible ARIA attributes across all interactive components.

### Don't:

- Never use decorative side-stripe colored borders on cards.
- Never use gradient text or floating glassmorphism as a default style.
- Never nest cards within cards.
- Never present automated actions as confirmed without verifying backend cryptographic receipts.
