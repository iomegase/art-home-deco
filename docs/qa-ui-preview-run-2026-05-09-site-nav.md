# QA UI Preview Run — 2026-05-09 — `site-nav`

Reference checklist: `docs/qa-ui-preview.md`

## Scope

- [x] Screens covered: navigation (header/sidebar/mobile menu)
- [ ] Screens covered: dashboard home
- [ ] Screens covered: admin list pages (tables)
- [ ] Screens covered: admin detail/edit forms
- [ ] Screens covered: empty/error/loading states

## Fixed Preview Breakpoints

- [ ] Mobile: `390x844`
- [ ] Tablet: `768x1024`
- [ ] Desktop: `1280x800`
- [ ] Large desktop: `1536x960`

## Pass 1: Structure And UX

- [x] Primary actions are obvious on first scan
- [x] Secondary actions do not visually compete with primary actions
- [x] Information hierarchy is clear (title > section > field/help text)
- [ ] Navigation state is clear (current page/section visibly active)
- [ ] No horizontal scroll appears unexpectedly

## Pass 2: Visual Polish

- [x] Spacing rhythm is consistent (no random gaps)
- [x] Typography scale is consistent (titles, labels, body, meta)
- [x] Borders and dividers are subtle and consistent
- [ ] No overlap, clipping, or truncation issues

## Accessibility (WCAG AA Target)

- [x] Focus ring is visible and consistent on interactive elements
- [ ] Text contrast meets AA for normal text
- [ ] Full keyboard navigation works (Tab/Shift+Tab/Enter/Space/Escape)

## Reduced Motion

- [ ] With `prefers-reduced-motion`, non-essential animations are removed
- [ ] Essential transitions remain functional and fast

## Real-State Validation

- [x] Default state checked
- [ ] Mobile open/close behavior checked on real viewport
- [ ] Long labels checked

## Before/After Snapshot Review

- [ ] Before screenshots captured for touched areas
- [ ] After screenshots captured at same viewport and scroll position
- [ ] Visual diff reviewed only for intended changes

## Technical Sanity

- [x] `npm run lint -- src/components/layout/site-nav.tsx` passed
- [ ] No console errors on touched screens
- [x] Existing business logic untouched

## Validation Decision

- [ ] Ready to validate
- [x] Blocked (manual visual/browser checks pending)

### Blockers

- [ ] Validate 4 breakpoints in browser and confirm no overlap/menu clipping
- [ ] Validate keyboard navigation and focus order in mobile menu
- [ ] Validate reduced-motion behavior
