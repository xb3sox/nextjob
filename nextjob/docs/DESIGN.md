---
version: "alpha"
name: "NextJob Design System"
description: "Trustworthy, evidence-first interface for career verification and application"
omitted: []
colors:
  primary: "#10b981"
  primaryHover: "#059669"
  primaryMuted: "#10b9811a"
  secondary: "#06b6d4"
  secondaryMuted: "#06b6d41a"
  surface: "#0f172a"
  surfaceElevated: "#1e293b"
  surfaceOverlay: "#0f172acc"
  textPrimary: "#f8fafc"
  textSecondary: "#94a3b8"
  textMuted: "#64748b"
  border: "#1e293b"
  borderStrong: "#334155"
  success: "#22c55e"
  successMuted: "#22c55e1a"
  warning: "#f59e0b"
  warningMuted: "#f59e0b1a"
  error: "#ef4444"
  errorMuted: "#ef44441a"
  info: "#3b82f6"
  infoMuted: "#3b82f61a"
typography:
  display:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "2rem"
    fontWeight: "700"
    lineHeight: "1.2"
    letterSpacing: "-0.02em"
  heading1:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "1.5rem"
    fontWeight: "600"
    lineHeight: "1.3"
    letterSpacing: "-0.01em"
  heading2:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: "600"
    lineHeight: "1.4"
  body:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: "400"
    lineHeight: "1.6"
  caption:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: "500"
    lineHeight: "1.4"
  mono:
    fontFamily: "JetBrains Mono, monospace"
    fontSize: "0.8125rem"
    fontWeight: "400"
    lineHeight: "1.5"
    fontFeature: "tnum"
rounded:
  sm: "6px"
  md: "8px"
  lg: "12px"
  xl: "16px"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
  2xl: "48px"
components:
  buttonPrimary:
    backgroundColor: "{colors.primary}"
    textColor: "#ffffff"
    rounded: "{rounded.md}"
    padding: "{spacing.sm} {spacing.md}"
    typography: "{typography.body}"
  buttonPrimaryHover:
    backgroundColor: "{colors.primaryHover}"
    textColor: "#ffffff"
    rounded: "{rounded.md}"
    padding: "{spacing.sm} {spacing.md}"
  buttonSecondary:
    backgroundColor: "transparent"
    textColor: "{colors.textPrimary}"
    rounded: "{rounded.md}"
    padding: "{spacing.sm} {spacing.md}"
    border: "1px solid {colors.borderStrong}"
  buttonSecondaryHover:
    backgroundColor: "{colors.surfaceElevated}"
    textColor: "{colors.textPrimary}"
    rounded: "{rounded.md}"
  card:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.lg}"
    padding: "{spacing.lg}"
    border: "1px solid {colors.border}"
  badgeVerified:
    backgroundColor: "{colors.successMuted}"
    textColor: "{colors.success}"
    rounded: "{rounded.full}"
    padding: "{spacing.xs} {spacing.sm}"
    typography: "{typography.caption}"
  badgeWarning:
    backgroundColor: "{colors.warningMuted}"
    textColor: "{colors.warning}"
    rounded: "{rounded.full}"
    padding: "{spacing.xs} {spacing.sm}"
    typography: "{typography.caption}"
  badgeError:
    backgroundColor: "{colors.errorMuted}"
    textColor: "{colors.error}"
    rounded: "{rounded.full}"
    padding: "{spacing.xs} {spacing.sm}"
    typography: "{typography.caption}"
  inputField:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.textPrimary}"
    rounded: "{rounded.md}"
    padding: "{spacing.sm} {spacing.md}"
    border: "1px solid {colors.border}"
  inputFieldFocus:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.textPrimary}"
    rounded: "{rounded.md}"
    padding: "{spacing.sm} {spacing.md}"
    border: "1px solid {colors.primary}"
  jobCard:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.lg}"
    padding: "{spacing.lg}"
    border: "1px solid {colors.border}"
  jobCardHover:
    backgroundColor: "{colors.surfaceElevated}"
    rounded: "{rounded.lg}"
    border: "1px solid {colors.borderStrong}"
  approvalDialog:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.xl}"
    padding: "{spacing.xl}"
    border: "1px solid {colors.borderStrong}"
---

# NextJob Design System

## Overview

A trustworthy, evidence-first visual identity that communicates verification, control, and transparency. The system uses a dark surface palette with emerald as the primary action color to reinforce trust and successful verification states. Cyan provides informational accents. The emotional intent is calm confidence — the user should feel in control and informed, never rushed or overwhelmed.

Authored against the inspected draft specification. Validation tooling was not available at time of authoring.

## Colors

- **Primary ({colors.primary}):** Brand actions, verified states, success confirmations, primary CTAs. Used sparingly to maintain signal.
- **Secondary ({colors.secondary}):** Informational accents, links, capability dimensions, secondary actions.
- **Surface ({colors.surface}):** Page backgrounds, card containers. Dark to reduce eye strain during long sessions.
- **Text ({colors.textPrimary}, {colors.textSecondary}, {colors.textMuted}):** Three-level hierarchy for scanability.
- **Semantic ({colors.success}, {colors.warning}, {colors.error}):** Eligibility states, risk levels, submission status. Never used as sole indicator.
- **Muted variants:** Backgrounds for badges and inline indicators without visual dominance.

## Typography

- **Display:** Hero headlines, onboarding milestones. Tight letter-spacing for impact.
- **Heading1/Heading2:** Section titles, card headers. Clear hierarchy without excessive size difference.
- **Body:** Default reading text. 1.6 line-height for comfortable scanning of evidence and explanations.
- **Caption:** Labels, metadata, timestamps, status indicators.
- **Mono:** Claim IDs, receipt hashes, evidence references, technical values. Tabular numerals enabled.

## Layout

- **Grid:** 12-column responsive grid. Max-width 1280px centered. Content area max-width 896px for readability.
- **Spacing:** 8px base unit. Components use {spacing.md} internal padding. Sections use {spacing.xl} to {spacing.2xl} vertical rhythm.
- **Density:** Information-dense by default (job cards, tracker rows) with clear visual hierarchy. Approval dialogs use generous spacing for focus.
- **Responsive:** Mobile-first. Sidebar collapses to bottom nav on small screens. Tables become card stacks below 640px.
- **Alignment:** Left-aligned text for readability. Centered only for hero content and empty states.

## Elevation & Depth

- **Surface hierarchy:** Base ({colors.surface}) → Elevated ({colors.surfaceElevated}) → Overlay ({colors.surfaceOverlay}).
- **Borders:** 1px solid {colors.border} for cards. {colors.borderStrong} for hover and focus states. No borders for inline elements.
- **Shadows:** Minimal. Only used for modals and floating elements. `0 4px 12px rgba(0,0,0,0.3)` for overlays.
- **Overlays:** Backdrop blur on header and sidebar for depth without heaviness.

## Shapes

- **Radius scale:** {rounded.sm} for badges and small elements. {rounded.md} for buttons and inputs. {rounded.lg} for cards. {rounded.xl} for sections and dialogs. {rounded.full} for avatars and pills.
- **Containers:** Consistent rounded corners on all interactive surfaces. Sharp corners reserved for data tables and code blocks.
- **Icons:** 1.5px stroke weight. Lucide icon set. 16px default, 20px for section headers, 24px for page headers.

## Components

- **Buttons:** Primary (filled emerald) for main actions. Secondary (outlined) for destructive or cancel. Ghost for tertiary. All use {rounded.md} and consistent padding.
- **Cards:** {rounded.lg} with subtle border. Hover state elevates background to {colors.surfaceElevated}.
- **Badges:** Pill-shaped ({rounded.full}) with muted backgrounds. Verified = success, Warning = warning, Error/Ineligible = error.
- **Inputs:** {rounded.md} with border that transitions to primary on focus. Error state uses error border + message below.
- **Job cards:** Display fit score, eligibility badge, evidence coverage bar, and action buttons. Hover reveals additional details.
- **Approval dialogs:** Centered modal with {rounded.xl}. Clear question, proposed answer with evidence link, risk indicator, and action buttons.
- **Receipts:** Monospace hash display, timestamp, verification status badge. Expandable to show full field list.

## Do's and Don'ts

1. **Do** show evidence provenance inline for every claim — link to source, display verification status.
2. **Do** use color as reinforcement only — always pair with text labels or icons for accessibility.
3. **Do** make every consequential action explainable — show reason, source, and evidence before requesting approval.
4. **Don't** hide eligibility failures — display them prominently with clear reason and next steps.
5. **Don't** auto-fill sensitive fields — always present user-only input with clear explanation of why.
