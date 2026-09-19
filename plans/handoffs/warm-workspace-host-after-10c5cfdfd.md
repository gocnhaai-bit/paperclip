# Warm Workspace host — continuation after 10c5cfdfd

## Resume contract

Continue implementing remaining host scope, not a new P0/P1 plan. Vietnamese only, address user as Sếp and self as Em. User deferred Agent Studio plugin integration until host completion. Do not edit `/Users/dominium/Projects/paperclip-agent-studio`, its runtime/assets/config. Native Skill Studio is different; its latest fixes are inherited, do not redo them.

## Workspace

- Primary: `/Users/dominium/Projects/paperclip`, branch `claude/warm-workspace`.
- Committed/pushed by explicit user request: `10c5cfdfd4ba5c59a68f6a60f89421b0b9a2e92f`, `fix(ui): preserve workspace drafts and harden route interactions`.
- Remote verified matches full SHA.38 scoped UI/tests/Storybook/feature-doc files committed.
- **Concurrent dirty file remains: `server/src/services/agents.ts`.** Not authored/reviewed/staged by this session; do not overwrite/reset/stash or include blindly in later commits.
- No staged changes. Local/untracked: `plans/`, `doc/plans/[GPT]-2026-09-14-warm-workspace-remediation.md`, `docs/[GPT]-paperclip-redesign-handoff/`. Keep these workspace-only.
- Toolchain: `PATH=/opt/homebrew/bin:$PATH`, Node25.8.2/pnpm9.15.4; verify again.
- Playwright static6106 exited, port checked clear. No live runtime restarted. Recheck6006/3122 owners before any reuse;3122 is plugin-owned.

## Read first

1. `plans/260913-2016-warm-workspace-p0-p1/PROGRESS.md` (newest checkpoint first)
2. `plans/260913-2016-warm-workspace-p0-p1/ROUTE-COVERAGE.md`
3. `.claude/features/paperclip-for-smit-branding.md`
4. `/Users/dominium/.claude/plans/snuggly-wondering-volcano.md`
5. `doc/plans/[GPT]-2026-09-14-warm-workspace-remediation.md`
6. `AGENTS.md`, `DESIGN.md`, redesign-handoff docs/references.

## Inherited work

- Inbox both modes/Decisions/queues/Artifacts/Approvals truthful read errors, no false success-empty, cached rows retained.
- Dialog focus and mobile Run/Pause/Resume names; Members last-owner behavior retained.
- Skill Studio detail/file/input/run/version errors; cached drafts retained; header wraps;900px tabs selected by actual container width. File selection/file draft/baseline/saved-input draft lifted to keyed StudioShell, preserving1800→390→1800 resize without cross-skill draft leak. Save updates file cache; rejected restore uses policy-aware error feedback.
- AppDetail errors keep cached content. PluginSettings initial detail/config failures truthful; successful null config counts as loaded so a local draft survives failed refresh. Environment list failure/loading disables default selector; AdapterManager announces read failure.
- Services disconnect Cancel and NewGateway Cancel restore focus. Services must capture opener before opening because native Cancel autoFocus precedes onOpenAutoFocus. NewGateway uses primitive first-input focus, no native autoFocus.
- ProfileWizard fixed footer clears mobile nav using existing `--sz-calc-14` below md.
- Actual full-shell previews expanded across Settings, catalog/Studio, Services, gateways, profile wizard, Audit and Routine detail variants. Routine production trigger/run sections use typed weekly schedule and failed dispatch metadata, no real run.

## Verification (do not sum across sources)

- Full encoded Warm Workspace browser **533/533 PASS** at earlier02:31 checkpoint, before final Settings and Apps/Routines patches.
- Later Settings **105/105 PASS** plus separate environment create→Cancel **2/2**,43 owner tests. This includes PluginSettings config failures/tab navigation and environment error/loading. Mobile uses Page section select, not tab buttons.
- Latest Apps/Catalogs+Work-library **159/159 PASS**, static build/one worker, `/tmp/warm-apps-routines-combined.log`.
- Latest scoped owner **31/31 PASS** (ProfileWizard, Services normalization/render, RoutineDetail), `/tmp/warm-apps-routines-unit.log`.
- UI typecheck/token/diff/UI build/Storybook build passed at final patch checkpoints. Scoped source reviews confirmed changes; not a whole-repo audit.
- No final full browser run after *all* final patches. No full repo gate rerun for commit/push.
- Full repo typecheck/build previously failed missing cargo in runner; full tests earlier9failed/10513passed/73skipped in server stage,4files failed. Not independently baselined; do not call all pre-existing. Do not install Rust/fix server to force green.
- Raw logs may contain synthetic credential-like test strings; report summaries only.

## Remaining work (not blockers)

1. Apps: populated gateway detail/tokens-metadata/activity/advanced; populated profile detail/wizard permissions; Services empty/error/Retry and other states. No external OAuth/connect, token creation, disconnect or profile save against live endpoints.
2. Routines: richer populated history/triggers/config validation and production interactions; streamlined routine-scoped Audit runs/activity. Current one failed sample only verifies visible row/status selection/Escape, not multistatus filtering.
3. Settings: complete environment create/edit/populated and capability branches, PluginSettings health/dashboard/log/error; invites/provider/personal-secret/proposal branches (metadata only).
4. Task: full action/permission/state/long-property/deep links; native browser zoom200% and native history. CSS zoom and MemoryRouter history are not native proof.
5. Auth/onboarding callbacks and enabled gated experimental routes.
6. Final full static browser matrix and scoped/full gates with honest limitations. A2 asset consumption only with approved manifest/version/checksum; plugin integration later.

## Working rules

Small patch → reproducing check → focused tests → UI typecheck/token/diff → frozen browser matrix → feature doc/PROGRESS/ROUTE-COVERAGE. Preserve Inter/icons/tokens/routes/API/schema/permissions/default flags. No primitive V2 or large rewrite. Use existing actual components and typed fixtures, reject unknown scoped reads/mutations instead of catch-all success. Clear storage per scenario, separate persistence case. One suite/server per6106, no HMR/build while browser matrix runs.

No DB copy/migration, secret values, real agent/task/run/routine creation, live approvals or saves. No Docker/deploy/restart. Commit/push authorization was consumed for10c5cfdfd; ask only if new publication requested. Track/stop only owned processes. Reviewers read exact primary dirty diff, no build/install/test/kill; clean worktree is not primary state.
