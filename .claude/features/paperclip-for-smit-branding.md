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

`Pages/Warm Workspace/Task Detail Chat Shell` and `Task Detail Classic` now mount IssueDetail inside the actual streamlined Layout; `Task Detail Production Chat Shell` and `Task Detail Production Classic` mount Layout.production. Breadcrumbs, sidebar, mobile navigation and properties panel/sheet are owned by those production components, not a clipping preview wrapper. Scoped fixtures include 18 comments, a plan and attachment-backed work product; API mutations are rejected and the previous fetch handler is restored on unmount. Additional scenarios cover Inbox provenance, comment/plan deep links and empty/loading/error states. Non-Inbox stories explicitly set `from=issues` so the real navigation-memory cache cannot carry Inbox provenance across previews. These are read-only preview fixtures, not live E2E.

Full-shell verification exposed an inaccessible Properties entry on directly opened mobile streamlined-chat tasks: the old guard hid the existing mobile copy/properties buttons even though the replacement Inbox toolbar only exists for Inbox-originated navigation. The existing mobile buttons now remain available outside Inbox; Inbox retains its toolbar without duplicate controls. The mobile sheet remembers the element focused on entry and restores it on close when still mounted, preserving keyboard navigation without a SheetTrigger. IssueDetail's eight-way classic/streamlined/mobile regression matrix now also opens the mobile sheet and checks no task update is sent; browser scope and outstanding acceptance remain in PROGRESS.

The desktop properties panel now keeps its divider inside the fixed-width content wrapper (classic) or the existing SidePanelFrame (resizable), rather than on the outer width-owning aside. The previous border-box aside reserved one pixel while its child still consumed the full declared width, causing a reproducible one-pixel content overhang on initial display and restore. Declared widths, storage keys, resize handlers and maximize/collapse behavior remain unchanged; maximize removes the frame divider. Verification is tracked separately in PROGRESS.

Collapsed desktop properties panels are now inert and hidden from assistive technology in both classic and resizable variants; the resizable SidePanelFrame also receives the actual visible state. This preserves mounted content and the width animation while preventing closed-panel controls from receiving keyboard focus. The inner frame stays opacity100 so only the outer aside owns the existing fade; wiring open state must not make the inner frame disappear immediately. Browser reproduction before the fix reached Maximize with the aside already at width0; regression explicitly checks that focus is rejected and the same plan link still reopens the panel.

The task Storybook wrapper forwards native hash-only anchor clicks into its MemoryRouter. Without this preview adapter, clicking the plan changed the iframe URL but left the page's router hash unchanged; the old clipping-only visibility assertion masked failed reopening. The production router is unchanged.

An explicitly labeled Preview history scenario provides a second read-only sample task and MemoryRouter back/forward controls to verify task switching without a live server. These preview controls are not application UI and do not prove native browser-history integration.

Additional full-shell long-content stories exercise unbroken task titles, comment bodies and attachment filenames in classic/chat modes. They are stress fixtures only; long-property and complete action/navigation coverage is tracked separately rather than inferred from their presence.

Task preview attachment content is served by the same exact-route read-only middleware in the Storybook dev config and local static-preview server (`scripts/storybook-warm-workspace-attachment.mjs`), using a shared local JSON sample. Browser navigation now has a real response instead of depending on window.fetch interception; `download=1` returns attachment disposition, and unsupported methods receive 403. The story uses a GUID attachment ID and validates work-product metadata with the shared schema, including the required download query. This does not change production attachment endpoints. A running Storybook dev process needs its normal config restart to load new middleware; static verification does not require stopping another session's process.

GoalDetail now exposes the existing GoalProperties through a mobile SheetTrigger/Sheet; desktop panel behavior is retained. The same mutation handler and owner/parent links are reused, the sheet closes on task-independent goal route changes, and the primitive owns Escape/focus return. This restores access to properties below the desktop breakpoint, where the old toggle and shared panel were both hidden.

Goals previews in `Pages/Warm Workspace/Goals` mount actual Goals/GoalDetail under Layout/Layout.production, with existing company-scoped goal samples and scoped read-only responses for populated/empty/loading/error. List/detail routing is real within the fixture router; unrelated destinations are labeled preview navigation. These are not GoalTree-only demos. Browser coverage and any retained layout rationale are recorded separately in the route checkpoint; preview presence is not route acceptance.

ApprovalDetail now renders its load-query error as an alert before the missing-record fallback, retaining cached detail content on background-refetch failure. Previously any503 load failure appeared as “Approval not found”; a fixture browser regression reproduces that distinction. Approval/reject/comment handlers and permission semantics are unchanged.

Approvals list read failures also suppress the “No pending approvals” empty state and announce the load error, while retaining cached cards and existing actions.

Approvals full-shell previews mount real Approvals/ApprovalDetail routes under both layouts, using existing approval samples plus local comments/linked-task data. Pending and revision-requested detail branches, populated/empty/loading/error states are exposed without approving/rejecting live records. Mutations fail403. Browser validation, filtering fidelity and layout disposition remain checkpointed separately.

Audit Timeline now has a populated sibling-route preview using the existing global timeline sample. This supports layout/control checks, not live aggregation or date-range correctness.

The Audit preview additionally mounts AuditHub's Runs route with contract-typed local succeeded/failed run samples and dedicated loading/empty/error states. Agent filtering is scoped in the fixture; status filtering uses the actual AuditRuns component. No run is created or invoked.

The Audit preview now mounts Activity, Costs and Budgets together as actual sibling routes, so switching AuditHub tabs no longer falls into a navigation placeholder. Dedicated Budgets states reuse the existing budget policy contract; no policy edits or incident resolutions are performed.

Decisions desk and queue load failures now use an alert and do not render “all caught up” or “queue is empty” when the feed failed. Cached nonempty content remains visible; successful empty feeds retain their normal empty states. No decision handlers or query contracts changed.

Decisions Desk adds full-shell read-only route scenarios for WhatNeedsMe and DecisionQueuePage using the existing attention/queue samples. They expose populated/empty/loading/error and production-layout desk previews, reject mutations, and filter queue membership locally. These extend rather than relabel the prior page-only and card demos; full filtering/action/variant coverage remains separately tracked.

Inbox read failures in both streamlined and legacy modes now surface an alert and suppress the misleading empty-state message. The active task query, shared issue context, approvals, join requests, run history, visible company alerts and active search supplement contribute to the error state; cached rows remain rendered. BlockedInboxView retains its own query/error handling. Existing unauthorized join-request handling and all mutation/permission contracts are unchanged.

Inbox full-shell stories mount the actual Inbox mode switch and five streamlined tabs plus selected legacy tabs. Scoped sample issues support title/identifier search and status filtering; this is not proof of server-side personal-inbox membership. Existing agents/projects are reused rather than replaced with empty identities. Blocked attention is supplied explicitly; unknown scoped reads fail501 and mutations403. Audit/Costs also adds actual page-owner previews in both layouts with four states; finance Date fields were corrected after primary-tree typecheck rejected the delegated draft. Nested runs/budgets/timeline remain outside that initial preview slice.

The shared RunButton now derives its accessible name from the existing label prop, so mobile's icon-only rendering remains named. PauseResumeButton likewise retains explicit Pause/Resume names when its text is hidden. No action or visible layout changes.

The shared RoutineRunVariablesDialog captures its opening focus and restores it on close if still connected, since its callers open it without a DialogTrigger. Browser reproduction on RoutineDetail showed Cancel dropping focus; the fix is shared by routine list/detail and execution-workspace callers without changing submit behavior.

Routine detail previews additionally expose a typed weekly schedule trigger and a failed dispatch-history record in both page variants. They are local metadata fixtures only; no schedule, routine or run is created in the host.

Routine list previews now also mount actual RoutineDetail/RoutineDetail.production with typed detail responses, empty runs/revisions and local description. List-to-detail navigation and configuration inspection stay read-only; no trigger is created or routine run invoked.

Routines' primary-tree follow-up explicitly imports the production page, matches folders by pathname (query parsed separately), and uses full typed RoutineListItem samples with no run history. A visible routine-title assertion replaces the earlier generic first-link check, which could pass without proving populated routine content.

Artifacts load failures now announce an alert without also claiming the library/stack is empty. Cached artifact cards remain rendered after background failures; successful empty states are unchanged.

Artifacts now has actual full-shell route previews using existing document samples and the locally served text attachment, with query/type and single-task stack filtering. Routines previews mount both Routines and Routines.production explicitly; the delegated draft's wrong folder endpoint and missing production owner were corrected before integration. Both families expose loading/empty/error rather than relabeling component demos; browser results remain separate.

Auth/NotFound previews mount actual AuthPage outside the company shell, and board/global/invalid-prefix NotFound pages in their corresponding scope. Logged-out auth uses a null session with authenticated/private health; sign-up is reached through the real form toggle, not a fake mode prop. All API mutations remain blocked. These previews do not qualify live authentication or callbacks.

Search's existing story family now additionally mounts the actual Search route in Layout for results/empty/loading/error, reusing the existing search response examples. Local term filtering is supported; operator syntax, permissions, date/type facets and live ranking are not certified by this preview.

CompanyAccess edit/remove dialogs now remember the clicked opening button and return focus on close when it is still connected. This fixes the reproduced edit-cancel focus loss without changing membership mutations or removal guards.

Members previews now mount actual CompanyAccess under the existing company.members gate, with typed local membership data and populated/empty/loading/error/forbidden responses. A hidden-page scenario uses the real health.hiddenSettings contract to exercise the redirect rather than bypassing the gate. Editing may be opened and cancelled locally; all API mutations remain blocked. Agent Studio stays plugin-owned and is distinct from the host's Skill Studio.

Secrets previews mount the actual gated page with existing sample metadata only; user-secret definitions, personal entries and proposals are explicitly empty fixtures. No secret value is read, entered, saved or exported. Loading/empty/error scenarios apply to the company metadata list; a transient-failure scenario exercises the actual Retry action returning the existing metadata sample.

Environments list reads now announce loading/errors and disable the Default selector while the list is loading or failed, preventing changes based on an incomplete option list. Cached rows and existing environment actions remain mounted; no default flag, provider or execution behavior changed.

Native PluginSettings previews use a typed disabled sample manifest with no worker loaded. They exercise Configuration/Status navigation, detail503 and config403 at the real host route; no plugin integration, configuration save or secret value is involved.

PluginSettings configuration read failures do not expose an empty editable form; cached configuration remains mounted with an alert, including a successful null response (no saved config yet) followed by a locally entered draft. This prevents an unavailable saved configuration from appearing to be a new blank configuration.

PluginSettings detail reads now announce failure instead of silently redirecting to the manager; cached detail remains mounted with an alert. This is host management UI only, not integration with the Agent Studio plugin, which remains deferred until host completion.

AdapterManager now announces adapter-list read failures rather than silently rendering empty sections; cached adapter rows remain visible with an alert after background failure. Install/toggle/reload/remove behavior is unchanged. Nine browser checks verify initial503 and install-dialog local-path inspection/Cancel/focus at four sizes/themes, without selecting a filesystem path or installing anything.

Plugin Manager preview mounts the native instance.plugins gate and actual page with isolated empty/loading/error responses. Install dialog is inspected and cancelled only; no package installation, plugin enable/disable, runtime or Agent Studio source changes. Browser checks pass for install Cancel/focus across four viewports/themes and loading/error. AdapterManager gated populated/loading/error previews are being added with existing local adapter metadata; no external registry or runtime action is invoked.

InstanceAccess previews now mount the actual instance.access gate with typed sample users/membership metadata, search filtering and empty/loading/403/503 states. No admin promotion or organization-access save is submitted;12/12 browser checks pass for the encoded search/content/state assertions.

The actual Experimental settings page is also previewed behind its existing gate with read-only local flags. Inspecting its controls does not enable any experimental feature in a real instance.

CompanySettings and ProfileSettings now have read-only full-shell previews, retaining the actual HiddenSettingsPageGate for profile. Only the selected populated routes are represented; other settings/gates and saving remain unverified.

Rejected version restores now use the existing mutation-error feedback, including policy-denial remediation, rather than failing silently. The restore write sequence and server authorization remain unchanged; regression uses a mocked denied first file write and asserts no version creation.

File selection, file draft/baseline and saved-input draft are owned by StudioShell, so switching between tabs and desktop panels on resize no longer discards edits. File loading initializes a clean draft only; a dirty draft survives remount/refetch. The shell is keyed by company/skill to prevent carrying drafts into another skill. Successful file saves also update that file's query cache, so a later responsive remount reads the saved content rather than an older cached copy. No storage or mutation API added.

Studio selects tabs below its existing900px threshold using the actual container width via ResizeObserver, not the browser width. At1280px with sidebars, the available editor width was about737px; the three-pane minimum sizes forced Input down to40px and hid its filename/editor. The container-based decision keeps all three workflows reachable without changing desktop pane sizing/storage.

The saved Studio header wraps its existing controls when space is constrained. A390px pointer test reproduced Version history outside the viewport; keyboard-only opening had not proved pointer access. No controls are removed or renamed.

Saved-input query failures also announce an inline alert while retaining the mounted input editor and cached input list. No test-input or run mutation contract changes.

Studio run and version histories announce read failures without claiming there are no runs/versions. Cached rows remain visible; history selection, restore and run actions are unchanged. The container/header/error follow-up passes85/85 catalog browser checks on one frozen build, including saved-input editing/Revert, file draft retention across tabs and pointer-accessible version history. Denied file saves retain drafts and explain policy in isolated unit tests; no live mutation is performed.

The Studio version-history sheet and Edit-a-copy dialog capture their opening focus and restore the connected opener on close. Browser verification reproduced Escape losing focus; restoration does not alter version selection or restore handlers.

Confirmed file switches clear the discarded file draft before loading the next path, including when that read fails; cancelled switches retain the draft. Skill file reads also announce failures inline. Until a file has loaded, its editor is not rendered and Save is disabled, so loading/failure cannot look like an editable blank file or expose the previous file's draft under a new path. Cached file content and its local draft stay mounted after a failed background refresh.

Mobile Skill Studio now keeps the Skill and Input tab panels mounted but hidden while inactive, preserving local editor drafts when switching tabs. Runs retains its existing mount/poll lifecycle. A focused regression reproduced a lost skill draft before this change; full-shell saved-editor fixtures now use typed detail/file/input/version contracts. Browser verification covers file navigation, draft/discard, mobile tab retention, version diff/Escape/focus and read-only fork Cancel/focus;49/49 combined catalog checks and20/20 Studio/fork unit tests pass at this checkpoint. No skill is saved or run.

SkillStudio now preserves the server read-error message rather than labeling every failed request “Skill not found.” Cached editor content remains mounted on background failure, with an alert; creation/test/permission contracts are unchanged.

Host Skill Studio landing/new and saved-editor routes mount the actual SkillStudio component inside both layout variants. This is unrelated to the external Agent Studio plugin. Creation/testing APIs remain blocked; saved detail, files, input and version reads use local typed fixtures.

The profile wizard's fixed action bar clears the mobile navigation using the existing bottom-nav offset token below md; desktop remains bottom-aligned. Browser pointer clicks reproduced Cancel being intercepted by navigation at390px. No wizard save/permission behavior changes.

Native Advanced profiles and new-profile wizard now mount behind their existing admin gate with a typed local board-access fixture. Cancel stays in fixture routes; no profile is saved or assigned. Detailed profile/tool permissions are not inferred from this entry coverage.

New gateway dialog now captures/restores its connected opener on close; the dialog primitive focuses the first input instead of a competing native autoFocus. Cancel focus loss was reproduced in the actual GatewaysList preview.

Services disconnect confirmation now restores its connected opening control on Cancel/close. A pointer-driven browser regression reproduced lost focus; no disconnect handler or authorization change.

Apps Services previews now mount actual AppDetail/ServicesPanel with typed local connected-service metadata, empty/error responses and a disconnect-confirmation Cancel check. No service is connected/disconnected. Gateway empty/error entry previews use actual GatewaysList. These extend host coverage, not Agent Studio integration.

Apps previews also mount actual AppDetail error, AppsReview empty/error and AppsConnect entry under the host layout. Browser checks cover error→Back to connectors, review failure versus empty, and connect-form search/no-match recovery without choosing OAuth or submitting connection data. Populated connection metadata with configuration-denied capabilities is also verified across four sizes/themes; tool catalog/grants are empty, so populated actions/services remain unverified.

AppDetail connection read failures now announce the error instead of claiming the app is missing. Cached connection content stays rendered with an alert on background failure; connection, OAuth and permission handlers are unchanged.

Catalog previews mount real Browse and both CompanySkills variants under the corresponding full shell. Skills reuse the existing agent-settings library sample; unrepresented skill detail endpoints fail501. Apps reuse the global gallery sample. This slice represents catalog entry pages only, not connection/OAuth/gateway or Skill Studio detail acceptance.

The blocked-Inbox Storybook preview now seeds the exact `live-descendant-summary` query key consumed by `BlockedInboxView`. The existing Storybook query client uses infinite freshness, so the scoped seed is retained without changing global API fixtures. Loaded and search scenarios show the intended attention rows again; this is component-preview evidence, not full Inbox-route or live filtering acceptance.

`Pages/Warm Workspace/Project Detail Page` mounts the actual project route with existing sample project/task data and the required plugin-launcher provider. It supports local layout and tab-navigation checks, not live project actions or proof of server-side project filtering. The project overview from the previous continuation is retained rather than reimplemented.
