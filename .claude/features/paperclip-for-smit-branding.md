# Paperclip for SMIT branding

## Status

Implemented and runtime-verified on branch `custom/brand` after Sếp approved the `Paperclip for SMIT` direction on 2026-09-10. Original core branding commit: `6c2223fb79b0babad705a549e473ddc804151c74`; after the Phase 7 rebase onto upstream `0d8bbf7cf4fb90597e1b352c7626a78e5c196992`, the equivalent branding commit is `e9aeeeb9a` and the branch tip is `e73a790df`.

Verification completed:

- focused branding tests, UI typecheck, production build and token gates pass;
- all changed foreground/background pairs meet WCAG AA in light and dark modes;
- Sếp confirmed the host-aligned KPI Dashboard at desktop and 390px mobile widths in light and dark modes;
- Phase 7 fast-forwarded `master` by 23 commits, rebased this branch without conflict, applied 17 upstream database migrations from a verified external backup, and rebuilt the runtime;
- the Phase 7 rollback drill booted stock `master`, retained the plugin/data/persistence marker and live KPI availability, then restored this branch;
- local and remote health report `authenticated/private`, `bootstrapStatus=ready`, and branded commit `e73a790df35d6fc599f92f1d7647e9a2d15b18cc`;
- runtime ends healthy on `custom/brand` with the external KPI plugin ready and the browser title ending in `Paperclip for SMIT`.

## Contract

- Display name: `Paperclip for SMIT`.
- Keep the Paperclip mark geometry; recolor it through the SMIT brand token.
- Use the brand green (Warm Workspace sage since 2026-09-13, see Visual tokens) only for primary actions, keyboard focus, active selection and the brand mark.
- Keep status colors semantically independent from brand green.
- Preserve fonts, routes, navigation structure, auth, permissions and behavior. The user-approved Warm Workspace work may restructure page layouts under DESIGN.md.
- Keep KPI Dashboard navigation plugin-owned; do not add a core route.

## Ownership

- `ui/index.html`: base browser and mobile app title.
- `ui/public/site.webmanifest`: PWA name and short name.
- `ui/src/context/BreadcrumbContext.tsx`: document title suffix.
- `ui/src/components/AnimatedPaperclipIcon.tsx`: loading mark color.
- `ui/public/favicon.svg`, raster favicon variants and PWA/touch icons: retain the Paperclip geometry and apply the approved SMIT color consistently across every icon target referenced by `ui/index.html` and `site.webmanifest`.
- `ui/src/index.css`: the only global semantic token source.

## Visual tokens

**2026-09-13 update (Warm Workspace redesign, user-approved):** the brand green values below were retuned from the saturated SMIT green to the muted Warm Workspace sage — same hue family (~150), lower chroma. All other branding contracts above (display name, mark geometry, status independence, layout/routes) are unchanged.

Light: canvas warm ivory `#FAF8F4`, surface white, sidebar warm cream `#F5F2EB`, text navy `#172334`, secondary text `#586170`; primary/ring/brand mark use sage `#506F5B` (`oklch(0.511 0.048 156)`); active sidebar uses sage selected surface `#E4EBDD` with dark sage foreground `#2E4A38`. Dark: warm charcoal `#23211D`, lifted surfaces `#2B2924`, sidebar `#272520`; primary is light sage `#9DB8A4` with navy foreground; selected surface deep sage `#3A4A3F` with `#CFE0D3` foreground. All values live as OKLCH in `ui/src/index.css`; every pair changed in this run was contrast-verified >= 4.5:1 (text) in both modes on 2026-09-13, and the dependent dark pairs (destructive, in_progress/in_queue/blocked status glyphs) were lightness-retuned the same day to keep AA on the lightened dark surfaces (hues unchanged, still sage-independent).

## Verification

- Focused title, loading icon and PWA tests.
- `pnpm check:token-gates`.
- UI typecheck/build and relevant tests.
- Desktop/mobile, light/dark, keyboard focus and no-overflow checks.
- Reverting the branding commit must restore stock Paperclip while the external KPI plugin remains installed.

## Warm Workspace cards continuation — 2026-09-14

The streamlined Agents route now defaults to cards and retains list/org views; Projects adds cards/list with source-backed metadata; Project detail separates overview and properties. Initials are a temporary neutral avatar fallback, not an approved A2 asset. All new visual classes use the existing token system. Storybook fixture previews and scoped UI verification are recorded in `plans/260913-2016-warm-workspace-p0-p1/PROGRESS.md`; they do not supersede the distinction between local checks and live deployment.

Agent overview now places the latest run, recent tasks and scoped audit links before the identity/runtime/capabilities/skills information in DOM order. At desktop widths the information is a secondary column; on smaller screens it follows the work. Local summary rows and skill badges allow long unbroken values to wrap within that column; model/session values retain truncation. This reuses the existing sections and handlers without changing queries, permissions or execution behavior. It does not replace the current fallback artwork or complete the remaining detail-page and release acceptance work.

The existing `chat-comments.stories.tsx` timeline/chat matrix explicitly uses one shrinkable grid column below its desktop split breakpoint. This prevents the preview wrapper from forcing a wide chat/composer at mobile sizes; it is a Storybook verification fix, not a change to the production task-chat shell.

`Pages/Warm Workspace/Project Detail Page` mounts the actual project route with existing sample project/task data and the required plugin-launcher provider. It supports local layout and tab-navigation checks, not live project actions or proof of server-side project filtering. The project overview from the previous continuation is retained rather than reimplemented.
