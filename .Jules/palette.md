## 2026-03-31 - Contextual Action Button Accessibility in Job Cards
**Learning:** Icon/short-label action buttons in repeated card lists (e.g. Save, Skip, Apply) lack contextual meaning for screen readers unless associated with card metadata.
**Action:** Always include job title and company in `aria-label`s for card-level actions and add explicit `type="button"` with `focus-visible` ring styles.

## 2026-04-01 - Inline Password Toggle Focus Ring and Icon Accessibility
**Learning:** Absolute-positioned password show/hide toggle buttons inside input fields are frequently missed in keyboard focus style passes, making tab navigation invisible on password controls.
**Action:** Always add explicit `focus-visible:ring-2 focus-visible:ring-moss/50 focus-visible:ring-offset-1 focus-visible:ring-offset-ink rounded p-1` styles to password toggle buttons and `aria-hidden="true"` to child Eye/EyeOff icons.
