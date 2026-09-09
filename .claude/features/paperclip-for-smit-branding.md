# Paperclip for SMIT branding

## Status

Implemented on branch `custom/brand` after Sếp approved `paperclip-for-smit-brand-preview.html` on 2026-09-10. Pending independent review, runtime visual verification and commit.

## Contract

- Display name: `Paperclip for SMIT`.
- Keep the Paperclip mark geometry; recolor it through the SMIT brand token.
- Use SMIT green only for primary actions, keyboard focus, active selection and the brand mark.
- Keep status colors semantically independent from brand green.
- Preserve core layout, fonts, routes, navigation structure, auth, permissions and behavior.
- Keep KPI Dashboard navigation plugin-owned; do not add a core route.

## Ownership

- `ui/index.html`: base browser and mobile app title.
- `ui/public/site.webmanifest`: PWA name and short name.
- `ui/src/context/BreadcrumbContext.tsx`: document title suffix.
- `ui/src/components/AnimatedPaperclipIcon.tsx`: loading mark color.
- `ui/public/favicon.svg`, raster favicon variants and PWA/touch icons: retain the Paperclip geometry and apply the approved SMIT color consistently across every icon target referenced by `ui/index.html` and `site.webmanifest`.
- `ui/src/index.css`: the only global semantic token source.

## Visual tokens

Light: primary/ring/brand mark use SMIT green; active sidebar uses a pale green surface and dark green foreground. Dark: use a lighter green foreground with a deep green selected surface. Exact implementation values use OKLCH and must pass contrast checks.

## Verification

- Focused title, loading icon and PWA tests.
- `pnpm check:token-gates`.
- UI typecheck/build and relevant tests.
- Desktop/mobile, light/dark, keyboard focus and no-overflow checks.
- Reverting the branding commit must restore stock Paperclip while the external KPI plugin remains installed.
