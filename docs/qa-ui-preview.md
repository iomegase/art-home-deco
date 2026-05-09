# QA UI Preview Checklist (Dashboard + Admin)

Use this checklist before validating any UI update.

## Scope

- [ ] Screens covered: dashboard home
- [ ] Screens covered: admin list pages (tables)
- [ ] Screens covered: admin detail/edit forms
- [ ] Screens covered: navigation (header/sidebar/mobile menu)
- [ ] Screens covered: empty/error/loading states

## Fixed Preview Breakpoints

- [ ] Mobile: `390x844`
- [ ] Tablet: `768x1024`
- [ ] Desktop: `1280x800`
- [ ] Large desktop: `1536x960`

## Pass 1: Structure And UX

- [ ] Primary actions are obvious on first scan
- [ ] Secondary actions do not visually compete with primary actions
- [ ] Information hierarchy is clear (title > section > field/help text)
- [ ] Forms have clear labels, helper text, and validation message placement
- [ ] Tables are readable (column labels, row spacing, sorting/filter controls)
- [ ] Navigation state is clear (current page/section visibly active)
- [ ] No horizontal scroll appears unexpectedly

## Pass 2: Visual Polish

- [ ] Spacing rhythm is consistent (no random gaps)
- [ ] Typography scale is consistent (titles, labels, body, meta)
- [ ] Borders and dividers are subtle and consistent
- [ ] Icons align with text baselines and button sizes
- [ ] Card/panel paddings are consistent across similar components
- [ ] No overlap, clipping, or truncation issues

## Accessibility (WCAG AA Target)

- [ ] Text contrast meets AA for normal text
- [ ] Contrast is sufficient for secondary text and placeholders
- [ ] Focus ring is visible and consistent on all interactive elements
- [ ] Full keyboard navigation works (Tab/Shift+Tab/Enter/Space/Escape)
- [ ] Form errors are explicit and associated with the right field
- [ ] Interactive elements have clear labels (including icon-only buttons)

## Reduced Motion

- [ ] With `prefers-reduced-motion`, non-essential animations are removed
- [ ] Essential transitions remain functional and fast
- [ ] No motion-dependent information is required to understand state changes

## Real-State Validation

- [ ] Loading state checked
- [ ] Empty state checked
- [ ] Error state checked
- [ ] Long text content checked (titles, names, descriptions)
- [ ] Large numeric values checked (prices, totals, counters)
- [ ] Dense data checked (many rows / long tables)

## Before/After Snapshot Review

- [ ] Before screenshots captured for touched areas
- [ ] After screenshots captured at same viewport and scroll position
- [ ] Visual diff reviewed only for intended changes
- [ ] No unintended regression found outside touched scope

## Technical Sanity

- [ ] `npm run lint` passed
- [ ] No console errors on touched screens
- [ ] No runtime UI warnings affecting interaction
- [ ] Existing business flows remain operational (no logic changes)

## Validation Decision

- [ ] Ready to validate
- [ ] Blocked (list blockers below)

### Blockers

- [ ] Blocker 1:
- [ ] Blocker 2:
- [ ] Blocker 3:
