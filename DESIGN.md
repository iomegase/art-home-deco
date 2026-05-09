# Design

## Visual Direction
Calm premium editorial UI with restrained visual noise, strong readability, and clear operational hierarchy.  
The system must support both public storefront storytelling and dense admin workflows without changing business behavior.

## Color System

### Core Neutrals
- `--color-bg`: `oklch(0.98 0.003 95)`
- `--color-surface`: `oklch(0.965 0.004 95)`
- `--color-card`: `oklch(0.99 0.002 95)`
- `--color-border`: `oklch(0.88 0.006 95)`
- `--color-text`: `oklch(0.2 0.01 95)`
- `--color-text-muted`: `oklch(0.5 0.01 95)`

### Accent And States
- `--color-accent`: `oklch(0.35 0.06 60)` (warm deep neutral accent)
- `--color-accent-contrast`: `oklch(0.98 0.002 95)`
- `--color-success`: `oklch(0.62 0.11 150)`
- `--color-warning`: `oklch(0.72 0.13 80)`
- `--color-danger`: `oklch(0.58 0.17 28)`
- `--color-focus`: `oklch(0.56 0.1 240)`

## Typography

### Intent
- Headlines: elegant, light-to-regular weight, generous scale for editorial pacing.
- Interface/body: neutral, high-legibility sans for forms, tables, and controls.

### Scale
- Display: `48-64px`, line-height `0.95-1.05`
- H1/H2: `32-44px`, line-height `1.05-1.15`
- H3/H4: `22-28px`, line-height `1.15-1.25`
- Body: `15-17px`, line-height `1.5-1.7`
- Meta/labels: `11-13px`, uppercase tracking `0.12em-0.18em`

### Rules
- Maximum comfortable text line length: `65-75ch`.
- Distinct contrast between heading/body/metadata levels.
- Avoid decorative font proliferation; use one display direction and one UI text direction.

## Spacing And Layout

### Spacing Rhythm
- Use a predictable spacing scale (4, 8, 12, 16, 24, 32, 48, 64).
- Alternate dense data zones with breathing zones for calm scanning.
- Keep consistent internal paddings for similar component families.

### Composition
- Prefer asymmetrical editorial composition for hero/overview sections.
- Prefer task-first structured layouts for admin screens (clear primary action zones).
- Avoid deep nested cards unless semantically required.

## Components

### Navigation
- Clear active state for current route.
- Mobile menu with large tap targets and sticky legal links at bottom.
- Header remains readable with stable spacing at all breakpoints.

### Buttons
- Primary: restrained filled or high-contrast neutral.
- Secondary: bordered neutral.
- All states must preserve AA contrast and visible focus ring.

### Forms
- Labels always visible.
- Inline error messages adjacent to fields.
- Consistent vertical rhythm between field groups.

### Tables And Data Blocks
- High legibility row spacing.
- Strong header/body contrast without heavy backgrounds.
- Keep filters and bulk actions obvious and reachable.

## Motion
- Motion is functional, subtle, and short.
- No layout-thrashing animations.
- Respect `prefers-reduced-motion: reduce`:
  - disable non-essential transitions/animations
  - keep only minimal functional state feedback

## Accessibility
- Target WCAG AA minimum across public and admin UI.
- Keyboard-first interaction support for all nav/forms/dialogs.
- Visible focus states on all interactive controls.
- Do not encode critical meaning by color alone.

## Content Tone In UI
- Concise, confident, helpful.
- No aggressive urgency wording.
- Keep microcopy practical for checkout/admin tasks.
