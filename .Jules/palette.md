## 2026-03-31 - Contextual Action Button Accessibility in Job Cards
**Learning:** Icon/short-label action buttons in repeated card lists (e.g. Save, Skip, Apply) lack contextual meaning for screen readers unless associated with card metadata.
**Action:** Always include job title and company in `aria-label`s for card-level actions and add explicit `type="button"` with `focus-visible` ring styles.
