---
name: Tailwind v4 CSS-variable theme placeholders
description: Why a Tailwind v4 (@theme inline) app can look totally unstyled with no console errors
---

If a Tailwind v4 app (using `@theme inline` + CSS custom properties in `index.css`, not `tailwind.config.js`) renders with default browser styling — buttons/inputs look "disabled" or unstyled, no visible colors — check whether the HSL-triplet CSS vars in `:root`/`.dark` were left as literal placeholder strings (e.g. `--primary: red;`) instead of real `H S% L%` values. Invalid CSS custom property values fail silently: no build error, no console warning, the browser just ignores the declaration and falls back to initial/inherited styles.

**Why:** Scaffolded/boilerplate theme files sometimes ship with placeholder color values that look like valid CSS keywords (`red`, `blue`) and don't throw anywhere, so the bug presents as "the whole design system is broken" rather than a clear error.

**How to apply:** When a Tailwind v4 CSS-var-based theme looks unstyled, read `index.css` and check every `--color-name: H S% L%;` line actually has a numeric HSL triplet — not a placeholder keyword — before investigating component-level styling issues.
