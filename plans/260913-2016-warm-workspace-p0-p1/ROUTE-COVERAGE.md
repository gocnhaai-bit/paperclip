# Route Coverage — Paperclip UI (baseline P0)

## Final host continuation — 2026-09-15

847/847 encoded Warm Workspace browser checks PASS on the latest frozen Storybook build, one worker, with the current catalog/work-library additions. Gateway Apps & tools/client snippets/Edit Cancel are now covered 24/24; Routines date-window, trigger mutation failure, revision-restore rejection and audit-runs rerun are covered 16/16; Skill Studio run and explicit policy denial are covered 8/8. These are local typed fixtures and read-only denied writes, not OAuth/live/authenticated proof. UI typecheck, token gates, diff check and Storybook build pass; full repo typecheck/build remain blocked at the runner because `cargo` is unavailable. Native 200% zoom, A2 approved asset manifest, live mutations/OAuth and gated/experimental authenticated data remain unverified or blocked.

## Host read-recovery continuation — 2026-09-15

Native Apps Services retains cached connected-service rows after a failed background refetch, shows the actual error and exposes retry controls; the existing disconnect action is unchanged. Typed one-failure coverage passes12/12 at1440×900 and390×844 in light/dark, including service-row visibility after failure; the final selected Services/Studio recovery/detail rerun passes28/28. Skill Studio run-detail read failures now say the detail is unavailable rather than claiming “Run not found”; the owning unit suite passes94/94. UI typecheck, token gates, diff check and Storybook build pass. This closes only read-recovery behavior; OAuth/connect/mutation, full Studio run/policy/version routes and broader action/resize acceptance remain open. No live mutation or Agent Studio change.

## Saved Skill Studio refresh recovery — 2026-09-15

Native saved-editor Refresh file and Retry actions now expose a failed file refetch without blanking or discarding the cached editor draft. A typed one-failure fixture covers the real `SkillStudio` file pane at1440×900 and390×844 in light/dark:4/4 browser PASS; UI typecheck/token gates/diff/Storybook build PASS. This closes only refresh recovery; test-run/policy/version-error, native resize and broader Studio route/action acceptance remain open. No skill mutation or Agent Studio change.

## Apps populated gateway/profile follow-up — 2026-09-15

Tokens inherited. GatewayDetail Overview/Tokens/Activity/Advanced and ProfileDetail/edit wizard layouts reused-with-reason: existing native owners already preserve operational hierarchy, admin gates and all action contracts. Typed full-shell fixtures contain masked token metadata only and redacted audit summaries; no secret/token value or mutation.48/48 populated route checks PASS across four exact viewports/light-dark, including token/activity expansion, Advanced archive Cancel, profile detail→edit and edit→Cancel; complete catalog regression158/158 PASS on one frozen build. Gateway Apps & tools/client snippets/Edit and fuller profile step2/step3 interactions remain open; no create/connect/disconnect/issue/revoke/save submitted.
## Routines multi-state/history/scoped Audit follow-up — 2026-09-15

Tokens inherited; native configuration versus Audit split reused-with-reason. Typed samples now include failed/succeeded/skipped runs, two append-only revisions and routine/trigger/run activity.36/36 new browser checks PASS: production multi-status/source filters with Clear; invalid→valid cron validation and Cancel; streamlined Activity, version compare, Delivery next-fire preview; routine-scoped Audit Activity/Runs. Filter/cron matrix covers four exact viewports/light-dark; operational surfaces cover1440/390 light-dark. Full work-library85/85 and13/13 owner unit pass with UI gates/build. Date filter, trigger update/delete/enable, restore rejection and full error matrices remain open; no mutation/run.

Tokens inherited. Services connected metadata/Disconnect Cancel, gateway empty/New Cancel and profile new/Cancel24/24 browser PASS four sizes/themes. Services/NewGateway focus repaired; ProfileWizard footer clears mobile nav using existing token (pointer regression failed before). Native layouts reused except footer placement. Typed weekly schedule and failed dispatch record render on production Routine sections16/16 PASS, including status selection/Escape/focus. One failed row does not prove multi-status filtering; no execution/create/connect/disconnect/token operation. Full populated gateway/profile actions and streamlined routine-scoped Audit remain open.

Latest combined Apps/Catalogs+Work-library159/159 browser PASS on frozen build;31/31 owning unit and UI gates/build PASS. Scoped focus/footer source review passed,6106 exited. This does not certify the remaining nested routes or actions.

## Task native history, long properties and denied action — 2026-09-15

Tokens/layout inherited; full-shell owners reused-with-reason. Native attachment navigation→browser Back restores the task and plan panel; mobile long properties stay inside viewport with Escape/focus return; keyboard More menu plus fixture-denied Hide produces truthful error and optimistic rollback. Task-links30/30 and124/124 owner unit PASS with UI gates. Native browser 200% remains unverified: Playwright Chromium ignored macOS zoom shortcut (`innerWidth` unchanged), and no CSS/page-scale substitute is claimed. Wider permission/state/action matrix remains open; no live mutation.


Tokens inherited; native Environment and PluginSettings layouts reused-with-reason. Environment list/default, SSH edit→Cancel, Daytona capability-derived create form and ready-plugin worker/job/webhook/log/health are now visible across four exact viewports/light-dark. Rejected dashboard/health/log reads previously disappeared; production owner now shows distinct alerts while preserving cached diagnostics.32/32 new checks and full Settings139/139 PASS;44/44 owner unit plus UI gates/build PASS. No environment probe/default/save/delete or plugin mutation. Invites/provider/personal-secret/proposal and deeper custom-image capability branches remain open.


105/105 Settings browser PASS on frozen build after PluginSettings/config-null and environment-list fixes; separate environment create→Cancel2/2 PASS, no creation.43/43 owning unit and UI gates/build pass. Corrected mobile PluginSettings navigation test to use actual Page section select; prior17/17 tab claim was premature due masked shell exit (see PROGRESS correction). Agent Studio plugin integration remains deferred. No full533-suite claim after these new patches.

## PluginSettings host — continuation

Agent Studio integration deferred by Sếp until host completion; no plugin source/runtime changed. Native PluginSettings detail503/config403 now truthful alerts, config first-load failure does not expose blank editable form; cached draft retention verified in9/9 owning unit. Browser9/9 error checks pass at four sizes/themes plus detail failure; tab inspection running. Tokens inherited, configuration/status layout reused to retain existing controls. Health/dashboard/logs and real config mutations remain unverified.

## Environments list — continuation

Tokens inherited; existing default/list/form structure reused. Failed list reads no longer look like an available empty list; loading/error announced, Default disabled until data available.16/16 browser checks pass across four sizes/themes; no provider probe, default change, credential entry or environment creation. Populated/edit/create/config capability variants remain open.

## Consolidated checkpoint — 2026-09-15 02:31

533/533 encoded Warm Workspace browser checks PASS in5.1m on the same frozen build after Studio resize/cache/restore and AdapterManager errors;111/111 scoped unit and UI gates/build PASS. No full-repo green or exhaustive action/route claim. Selected file plus file/input drafts survive1800→390→1800. Managers retain native layout; Plugin install Cancel and Adapter install/local-path Cancel verified without mutation. HEAD54ace1dca,31 tracked dirty files;6106 exited. Remaining families stay open.

## Resize draft and manager settings — 2026-09-15 02:08

Studio tokens/layout retained; draft ownership moved to persistent shell to preserve selected file and file/input edits across1800→390→1800.86/86 catalogs browser pass before subsequent restore-error/cache follow-up;26/26 Studio unit and UI gates/build pass after follow-up. Mocked rejected restore now reports policy denial, no version created. Plugin Manager real gated empty/loading/error and install Cancel/focus verified in combined Settings/Catalogs run (see PROGRESS). AdapterManager list error reproduced and repaired;9/9 browser PASS for initial503 and install-dialog local-path inspection/Cancel/focus across four sizes/themes. Tokens inherited; manager list/form structure reused to retain lifecycle controls. Populated external plugins/adapters, enable/disable/reload/removal, PluginSettings and full management permissions remain unverified. No install/enable/disable/reload, live save/run or plugin source change.

## Studio history/input and responsive follow-up — 2026-09-15

Tokens inherited; header now wraps and tabs use the editor container's900px threshold, fixing pointer-inaccessible Version history at390 and a40px collapsed Input pane at1280 (available width737px). Run/version failures no longer claim empty; saved-input failures announced without unmounting draft.22/22 Studio unit pass; policy+surface suites42/42 at their preceding checkpoint, including denied save retains draft and explains policy using mocked API. Earlier85/85 catalogs pass covers histories/header before container change; Final container/input browser85/85 PASS;43/43 Studio/policy unit PASS plus UI gates/UI build/Storybook build. Tests include saved-input edit/Revert and tab retention, visible histories errors and pointer opening at390. Scoped source review found no defect. Historical505 combined run predates this follow-up. Native resize draft preservation and full execution workflow remain open.

## Consolidated regression — 2026-09-15

505/505 encoded Warm Workspace browser checks PASS in4.5m on one frozen build after Studio/AppDetail continuation, plus82/82 owning unit tests and UI typecheck/token/diff/UI build/Storybook build. Not a sum of historical runs. This closes the missing combined regression evidence at this checkpoint, not all route/action/native-zoom acceptance.6106 exited, HEAD54ace1dca unchanged; all edits local/uncommitted. Full release gates and remaining route variants below stay open.

## Saved host Skill Studio — 2026-09-15

Tokens inherited; desktop three-pane/mobile tabs reused to preserve the native editor workflow. Typed saved detail/file/input/version preview now mounted in both real layouts. Mobile tab-switch draft loss reproduced and repaired by retaining hidden Skill/Input panels (Runs unchanged).15/15 owning tests and16/16 browser checks pass for file navigation, draft/discard and mobile tab retention; cached refetch failure retention is unit-tested. Initial file-read failure and version/fork focus repairs now pass20/20 owning unit and49/49 combined catalog browser checks. Version diff/Escape/focus spans both layouts/four sizes/themes; fork Cancel4/4 desktop/mobile light/dark. Remaining full test-run/policy/version-error and breakpoint-resize behavior are not certified. Not complete fork/test/policy/run/version acceptance; no real skill mutation or Agent Studio change.

## Apps detail and entry — 2026-09-15

Tokens inherited; connection error/review/connect layout reused with actual native owners, preserving action/permission flow. AppDetail initial and cached read-error tests pass58/58; UI gates/build pass. Browser4/4 connection-error→Back to connectors,8/8 AppsReview empty/error and8/8 AppsConnect search/no-match recovery pass on the same static build. No OAuth, connection creation or approvals executed. Populated detail, services/permissions/review actions, gateways and advanced profiles remain unverified.

## InstanceAccess — 2026-09-15

Tokens inherited; existing user directory/detail form reused to preserve the permission workflow. Actual gated route with typed metadata verifies search, current membership and no horizontal body overflow across four viewports/light-dark; loading/empty/403/503 tested at390-dark.12/12 browser PASS, owning unit/UI gates/build pass. No promotion/membership save; hidden/company-fetch-error and mutation outcomes unverified.

## Latest Settings/Catalogs verification — 2026-09-15

70/70 combined browser checks PASS on frozen static build: Members states/hidden gate/Edit+Remove Cancel focus; Secrets metadata states/search/Retry; Company/Profile; Experimental read-only controls; catalog entries; actual host Skill Studio create/cancel and truthful detail error. UI gates/build pass as logged. Not full Settings/Skill Studio/permissions acceptance; no mutation or plugin change.

## Members/Secrets follow-up — 2026-09-15

CompanyAccess now returns focus to the clicked Edit/Remove opener on close (connected targets only), proven by failing then passing browser checks. Members31/31 checks pass across four viewports/themes plus empty/loading/error/forbidden and actual hidden-page redirect;9 owning unit tests and UI gates pass. Secrets actual gated metadata preview covers search/no-match, loading/empty/error and Retry recovery; combined Settings37/37 PASS after cleanup, UI gates/static build pass. No member/secret data mutation; Agent Studio remains outside host scope.

## Host Skill Studio follow-up — 2026-09-15

Actual SkillStudio landing/new routes mounted separately from CompanySkills wildcard, matching App.tsx.4/4 desktop/mobile checks in both layouts verify empty Create disabled and Cancel returns to actual landing. UI gates/static build pass. SkillStudio detail-read failure no longer claims missing skill;13/13 unit and29/29 catalog browser pass. No skill created/tested; saved editor/fork/test workflows remain open. This is not the Agent Studio plugin.

## Evening continuation validation — 2026-09-14

After54ace1dca, local changes repair failed-read feedback in both Inbox modes, Decisions/queues, Artifacts and Approvals list; add real Audit Runs/Budgets/Timeline sibling navigation and RoutineDetail variants; fix routine dialog Cancel focus and mobile Run/Pause/Resume accessible names. Latest changed-family221/221 browser checks pass on fixed static build, one worker; targeted owning tests/UI typecheck/token/build gates pass as recorded in PROGRESS. No commit/push/deploy. Full route/action/permission/native-zoom and asset acceptance remain incomplete.

## Inbox read-error follow-up — 2026-09-14

Both Inbox modes now show query failures instead of claiming an empty inbox; cached rows remain. Tokens/layout inherited, behavior repair only. Regression before patch2fail; after patch Inbox+Blocked38/38 and full-shell Inbox73/73 pass, including Mine failures at1440/390 light/dark. UI typecheck/token gates/diff/static build pass. Independent review pending; full Inbox permissions/actions/filter acceptance remains open.

## Decisions and Audit follow-up — 2026-09-14

Decisions/queue failed feeds no longer show successful empty-state copy; cached rows retained. Focused3/3 and browser28/28 pass; UI gates/static build pass. Audit Activity/Costs/Budgets sibling navigation and dedicated budget states pass. Runs actual owner added with typed local samples: status filter reduces two rows to the failed row, Clear restores both; empty/loading/error verified. Expanded Audit50/50 browser PASS, UI typecheck/token/diff/static build pass. Timeline, routine-scoped runs and mutating actions remain unverified. Tokens/layout retained; actions and remaining nested variants not certified.

## Artifacts behavior follow-up — 2026-09-14

Failed reads no longer also claim empty library; alert semantics added, cached cards retained. Library25/25 browser pass plus stack drilldown2/2 at1440/390 using keyboard Enter and preserving search on return. One-task fixture only, not parent-stack or pagination/media acceptance. UI typecheck/token/static build/diff pass.

## Approval list read-error follow-up — 2026-09-14

Reproduced failed query incorrectly showing no pending approvals. Alert/empty suppression patch passes34/34 full-shell approval checks; cached cards and handlers retained. UI typecheck/token/diff/static build pass. This is read-error repair, not approval mutation acceptance.

## Routine detail follow-up — 2026-09-14

Actual RoutineDetail and production variant mounted;4/4 desktop/mobile checks pass, with streamlined History/back and Edit/Cancel navigation. Typed local detail, empty run/revision history; no save/run/trigger mutation. UI typecheck/token/static build/diff pass. Production interactions, full data states and populated trigger/history remain unverified. Follow-up fixes shared RoutineRunVariablesDialog focus restoration and RunButton mobile accessible name;30/30 unit and33/33 library browser pass, including cancel focus on desktop/mobile. Scoped read-only source review found no concrete defect.

## Latest bounded validation — 2026-09-14

Final consolidated new browser suite381/381 PASS in3.2m on the fixed static build after the Routines correction and onboarding-step check. This verifies only the encoded assertions, not full nested-route/action acceptance.

New Warm Workspace browser suite365/365 passed on a fixed static build. Follow-up Routines24/24 adds stronger visible-title checks and the real production owner after a delegated draft mismatch; Onboarding8/8 checks only the existing real wizard's create-agent step without Next. Search9/9, Company/Profile Settings16/16 and Apps/Skills entry24/24 are included in the365 run. UI typecheck/token gates/UI build/Storybook build pass; full repo typecheck/build still fail because cargo is absent. Full test run failed in server stage:9 tests failed/10513 passed/73 skipped,4 test files failed; later stages not certified. Native zoom, nested settings/apps/skills/routines/audit, complete actions/permissions/data-state variants, and enabled experimental pages are NOT closed by these numbers. Assets A2 remain blocked.

## Artifacts / Routines / Auth partial route evidence — 2026-09-14

Artifacts and Routines have actual full-shell previews;16/16 streamlined populated checks pass at four sizes/themes, including Artifacts no-match and matching-title search after explicitly choosing flat grouping. Keep existing library grid and routine grouping; no claim for full routine detail, pagination, parent-stack fidelity or production states. Auth/NotFound40/40 checks pass for actual logged-out form toggle and four error scopes/layouts across sizes/themes; form layout reused because it prioritizes credentials on mobile and keeps illustration secondary on desktop. Not authenticated backend E2E, OAuth/invites/claims/onboarding remain open. Apps/Skills/Settings/Search/gated routes are still incomplete.

## Approvals / Inbox / Audit route preview evidence — 2026-09-14

- Approvals: actual list/detail previews, both detail layouts and linked-task branch. Browser33/33 PASS for populated content, raw request expansion, no overflow at four sizes/themes and503 error distinction. Fixed dropped load error in ApprovalDetail. Layout reused: request context/actions followed by comments; full nested states/actions remain unverified.
- Inbox: actual Inbox mode switch, five streamlined tabs and three legacy tabs. Browser65/65 PASS for populated task links/no horizontal overflow across four sizes/themes and blocked error. Personal membership and complete tab/search behavior not certified by these assertions; layout retained pending deeper review.
- Audit/Costs: actual streamlined CompanyActivity/AuditHub and production CompanyActivity/Costs. Browser38/38 PASS for visible populated content/no overflow across sizes/themes and six streamlined states. Existing audit filter/table and cost summary/breakdown structures retained; no financial math/action acceptance inferred from sample data. Runs/Budgets/Timeline and production data-state variants remain unverified.

## Decisions full-shell continuation — 2026-09-14

Actual WhatNeedsMe/DecisionQueuePage now have full-shell preview scenarios in the existing decisions-desk story file, including desk production layout and three data states. Tokens inherited; triage grouping/queue rail reused, visual review pending. UI typecheck/token gates/static build pass;27/27 browser passed across full-shell desk/production-desk/queue with four viewports/themes and Group Popover/Escape/focus, plus three390-dark states. Date filtering/action correctness and complete variant states remain open. Prior page-only evidence remains distinct.

## Goals actual-route evidence — 2026-09-14

Tokens inherited; layout reused because GoalTree communicates hierarchy and GoalDetail separates description, child goals/projects and properties. New full-shell Goals stories mount actual pages in both layouts. Browser38/38 passed list→detail→Projects navigation and no horizontal overflow across four sizes/themes, plus six390-dark data-state checks. Mobile lacked access to properties; patch adds existing Sheet/GoalProperties. Post-patch38/38 PASS includes keyboard open, visible owner link, Escape and focus return in both layouts/themes; targeted2 tests/typecheck/token gates/static build pass. No live mutations or full-family completion claim.

## Panel sizing evidence — 2026-09-14, HEAD 89df5e578 + local patch

Task detail tokens inherited; layout reused with divider ownership corrected. Browser reproduced inner right1441 at viewport1440 due to an outer border plus full-width child; the patch moves the divider into the existing frame/wrapper. Re-measured right1440 on initial/restore and correct maximize; 53 focused tests, UI typecheck/token gates/diff check pass. Panel static browser regression32/32 PASS (four modes × light/dark × exact four viewports), including resizable persistence/maximize/restore and mobile sheet focus. Link regression5/5 PASS: automatic comment positioning at1440/390 light/dark plus actual work-product click/local content/native download with exact bytes/checksum. Fixed fixture GUID/download contract and exact-route serving, not production attachment behavior. Expanded long-content/link matrix pending. This does not close attachment, navigation, long-text, native zoom or route-family acceptance. Historical overhang evidence below is retained.

## Continuation evidence — 2026-09-14, HEAD 70ab6d79e

| Surface | Tokens | Layout disposition | Behavior/browser evidence | Remaining |
|---|---|---|---|---|
| Task detail | inherited | Reused actual Layout/Layout.production + classic/chat sections; fixed missing direct-mobile Properties entry and sheet focus return | Four full-shell populated stories added, plus Inbox/deep-link/data-state scenarios. IssueDetail/Layout/PropertiesPanel 156/156, UI typecheck/token gates/UI build/Storybook build pass. Browser 32/32 full-shell combinations (four modes × light/dark × four requested viewports): no body overflow, chat desktop thread scroll without competing main scroll, mobile document scroll and Properties/Escape/focus return. Six 390-dark state/provenance/deep-link-target checks pass | Native zoom, automatic comment-anchor position, attachment opening/download, long-text stress and full action matrix; panel inner content still extends 1px beyond its declared width. See latest PROGRESS; fixture-only, not live acceptance |
| Decisions queue | inherited | Reused: heading/queue navigation/filter controls and urgency groups already separate operational priorities | Real `DecisionQueuePage` story `pages-decisions-desk--queue-page`: 390 light/dark, 1440 dark no body overflow; Group opens, Escape closes at 390 light | Filtering correctness, mutations, live/authenticated data, full states matrix |
| Inbox blocked | inherited | Existing component retained; corrected preview query-key mismatch | Loaded component story: 8 rows at 390 light/1440 dark, no overflow; search scenario: PAP-420 only at 390 dark; 17 focused tests pass | Actual Inbox route, action/navigation E2E, full states/variants remain unverified |
| Routines/Search/Artifacts/Goals component previews | inherited | Not concluded from component-only demos | Source distinction identified in corresponding Storybook stories | Actual route wrappers, variants and data-state coverage |

Full typecheck/build are blocked by missing `cargo` in runner scripts. This is not full redesign/release acceptance. Existing historical coverage below is retained, not promoted to U2/U3 completion.

**Project detail verification, 2026-09-14:** real ProjectDetail in the new local Storybook route preview rendered populated overview/tasks, navigated to Configuration via Edit project details, and returned to Tasks via mobile Page section. No body overflow in selected 390/768/1280/1440 viewports across light/dark. This is fixture-based evidence; mutations, live filtering, summary state and full workspace/budget/plugin-tab coverage remain unverified.

**Agent overview takeover, 2026-09-14:** latest run/tasks/audit now precede the information aside. Real-component Storybook checks cover populated overview at selected desktop/mobile/tablet sizes, light/dark and basic keyboard/menu interaction; detail run/config routes and live actions are not covered by this slice. AgentOverview 1/1 and six detail suites 141/141 passed; see PROGRESS for exact limits.

**2026-09-14 continuation:** Agents streamlined cards/list and Projects cards/list now implemented, with populated Storybook desktop/mobile checks. Project detail overview restructured and unit-tested; populated browser detail remains unverified. Tasks retains existing list/board and fixes company-scoped placeholder data. See the newest `PROGRESS.md` entry for exact verification. Historical P4 checks below do not imply full redesign or live acceptance.

Nguồn: `ui/src/App.tsx` @ HEAD `0bf841018` (branch `claude/warm-workspace`). Ngày lập: 2026-09-13.

**Trạng thái audit (cập nhật sau P3/P4, 2026-09-13):**
- P3 (commit `571adccd7`): Dashboard/Agents/Tasks/Projects — browser-verified light+dark với dữ liệu thật (isolated DB); Dashboard banners unified sang InlineBanner
- P4: audit 11 nhóm route trên dev isolated — tất cả render đúng warm language, không phát hiện vỡ layout/contrast. Evidence: `screenshots/p4-*.png`
- Chưa verify: auth pages (cần logged-out state), plugin pages (KPI không cài trong isolated), mobile/tablet viewport (tool thiếu), các trang cần agent thật (AgentDetail config, run logs), pipelines/cases/status-cards (experimental gates, không data)

## Cơ chế render chung

- **Hai layout mode** qua flag `useStreamlinedUiEnabled`: `Layout.tsx` (streamlined) vs `Layout.production.tsx`. Cả hai mount dưới `:companyPrefix`.
- **Page variants `.production.tsx`** (render khi flag tắt): `Agents`, `Routines`, `RoutineDetail`, `CompanySkills`, `audit/CompanyActivity`, `Costs`, `OrgChart` — lazy qua `ProductionSurface`. Khi sửa một trang phải kiểm tra cả hai variant.
- **Gates**: `HiddenSettingsPageGate` (theo `pageKey`, có thể ẩn trang settings), `CloudManagedPageGate`, `CloudAccessGate`, `IsolatedWorkspacesRouteGate`, experimental gates (Pipelines/Cases/StatusCards/ChatConnectors/ConferenceRoomChat), `import.meta.env.DEV`.
- **Unprefixed redirects**: mọi route board không có `:companyPrefix` redirect qua `UnprefixedBoardRedirect`/`LegacySettingsRedirect` — không phải trang riêng.
- Agent filter tabs: `all | active | paused | error | builtin`.

## Bảng coverage theo nhóm (bảng 5.3 plan gốc)

| Nhóm | Routes (company-prefixed) | File render | Trạng thái audit |
|---|---|---|---|
| Dashboard/Overview, Live | `dashboard`, `dashboard/live`, `timeline` (streamlined: redirect `/activity/timeline`) | `Dashboard.tsx`, `DashboardLive.tsx`, `Timeline.tsx` | P3 browser ✓ (light+dark, real data) |
| Agents, Org, Agent detail, Run | `agents` → redirect `agents/all`; `agents/{all,active,paused,error,builtin}`; `agents/new`; `agents/:agentId[/:tab][/runs/:runId]`; `org` (streamlined: redirect `/agents/all`) | `Agents.tsx` + `.production`, `NewAgent.tsx`, `AgentDetail.tsx`, `OrgChart.production.tsx` | list ✓ P3; detail/run chưa (cần agent thật) |
| Tasks (Issues), detail | `issues`, `tasks` → redirect, `issues/all|active|backlog|done|recent` → redirect, `issues/:issueId`, `search` | `Issues.tsx`, `IssueDetail.tsx`, `Search.tsx` | list+detail ✓ P3, search ✓ P4 |
| My work / Inbox | `inbox` → redirect tab cuối; `inbox/{mine,recent,unread,blocked,all}`; `inbox/requests`; `inbox/new` → redirect | `Inbox.tsx`, `JoinRequestQueue.tsx` | inbox ✓ P4 (real row) |
| Projects/detail | `projects`; `projects/:projectId[/{overview,issues,issues/:filter,workspaces,configuration,budget}]`; `projects/:projectId/workspaces/:workspaceId` (IsolatedWorkspaces gate); `workspaces` (gate) | `Projects.tsx`, `ProjectDetail.tsx`, `ProjectWorkspaceDetail.tsx`, `Workspaces.tsx` | list+detail ✓ P3/P4 (real project); workspaces chưa (gate) |
| Goals/detail | `goals`, `goals/:goalId` | `Goals.tsx`, `GoalDetail.tsx` | list ✓ P4; detail chưa (không data) |
| Approvals, What needs me, queues | `approvals` → redirect pending; `approvals/{pending,all}`; `approvals/:approvalId`; `decisions`; `decisions/queues/:key` | `Approvals.tsx`, `ApprovalDetail.tsx`, `WhatNeedsMe.tsx`, `DecisionQueuePage.tsx` | ✓ P4 (empty states) |
| Costs/budgets | production: `costs`; streamlined: `activity/{costs,budgets}` qua `AuditHub`; legacy `costs`/`budgets`/`runs` → redirect | `Costs.production.tsx`, `audit/AuditHub.tsx` | ✓ P4 qua AuditHub (real activity rows) |
| Audit/activity | `activity` (+`.production`), streamlined thêm `activity/{runs,costs,budgets,timeline}`; legacy `audit/*` → redirect | `audit/CompanyActivity.tsx` + `.production`, `audit/AuditHub.tsx` | ✓ P4 |
| Apps, connections, gateways, tools | `apps` (Browse; `/apps/browse|connections|attention` → redirect); `apps/byo`; `apps/connect[*]` (policy-gated); `apps/chat/*` (experimental gate); `apps/review`; `apps/gateways[/:gatewayId[/:tab]]`; `apps/advanced[/:tab]` + `profiles/{new,:profileId[/edit]}`; `apps/app/:applicationId[/:tab]`; `apps/:connectionId[/:tab]`; `tools*` + `company/settings/tools*` → redirect | `apps/Browse.tsx`, `AppsConnect.tsx`, `apps/chat/*`, `AppsReview.tsx`, `apps/gateways/*`, `tools/AdvancedToolsRoute.tsx`, `tools/profiles/*`, `AppNotConnected.tsx`, `AppDetail.tsx` | Browse/search ✓; populated connection/services/permissions read-error+retry ✓; gateway Overview/Apps & tools/Tokens/Activity/Advanced/client snippets/Edit Cancel ✓; OAuth/connect/token/mutation/full permission capability branches unverified |
| Skills, catalogs | `skills/*` (streamlined: `CompanySkills`, production: variant); `skills/studio[/new|/:skillId]`; `skills/:skillId/studio` → legacy redirect | `CompanySkills.tsx` + `.production`, `SkillStudio.tsx` | list/studio saved/new/read-error/refresh/history/run-detail/run-denial/policy-denial ✓ local; live save/run/fork/version mutation and native resize/complete action matrix unverified |
| Routines | `routines`; `routines/:routineId[/:section]` (cả hai đều có variant) | `Routines.tsx` + `.production`, `RoutineDetail.tsx` + `.production` | list/detail, trigger/run filters/date/history/delivery/scoped Audit and denied mutation feedback ✓ local; live create/update/delete/run/restore and broader production/error matrix unverified |
| Pipelines (experimental gate) | `pipelines[/:pipelineId[/add|/settings]]`; `pipelines/:pipelineId/items/:caseId`; `.../cases/:caseId` → legacy redirect; `review-queue`; `learnings` | `Pipelines.tsx` (+`ReviewQueue`, `Learnings`, `PipelineItemDetail`), `PipelineSettings.tsx` | chưa (experimental gate, không data) |
| Cases (experimental gate) | `cases`, `cases/:caseIdentifier` | `Cases.tsx`, `CaseDetail.tsx` | chưa (experimental gate, không data) |
| Status cards (experimental gate) | `status[/:cardId]`; `status-cards*` → legacy redirect | `StatusCards.tsx` | chưa (experimental gate, không data) |
| Artifacts, board-chat | `artifacts` (2 mount: master-level + ConferenceRoomChatGate); `board-chat` (gate) | `Artifacts.tsx`, `BoardChat.tsx` | artifacts ✓ P4; board-chat chưa (gate) |
| Execution workspaces (gate) | `execution-workspaces/:workspaceId[/{services,configuration,runtime-logs,issues,routines}]` | `ExecutionWorkspaceDetail.tsx` | chưa (gate + cần workspace thật) |
| Company settings | `company/settings`; `.../members` + `.../access` (gate company.members); `.../invites` → redirect (gate); `.../secrets` (gate); `.../environments` → redirect instance; `company/export/*` (gate+lazy); `company/import` (Cloud+hidden gate); `company/settings/:settingsRoutePath/*` (plugin settings pages) | `CompanySettings.tsx`, `CompanyAccess.tsx`, `Secrets.tsx`, `CompanyExport.tsx`, `CompanyImport.tsx`, `CompanySettingsPluginPage.tsx` | settings/secrets/members ✓ P1+P4 |
| Instance settings | `.../instance/profile` (gate); `.../instance/environments[/new|/:id/edit]` (gate); `.../instance/access` (gate); `.../instance/experimental` (gate); `.../instance/plugins[/:pluginId]` (gate); `.../instance/adapters` (gate); `instance/settings/adapters`; legacy `.../instance[/{general,heartbeats}]` → redirect | `ProfileSettings.tsx`, `CompanyEnvironments.tsx`, `InstanceAccess.tsx`, `InstanceExperimentalSettings.tsx`, `PluginManager.tsx`, `PluginSettings.tsx`, `AdapterManager.tsx` | ✓ P4 (plugins/adapters/access/experimental/environments/profile) |
| Companies/onboarding | `companies`; `onboarding`; index → `CompanyRootRedirect` | `Companies.tsx`, `OnboardingRoutePage` (trong App.tsx) | onboarding wizard ✓ P1 (light+dark) |
| Auth (ngoài company prefix) | `auth`; `board-claim/:token`; `cli-auth/:id`; `invite/:token`; `oauth-handoff`; `chat-identity/confirm` (gate) | `Auth.tsx`, `BoardClaim.tsx`, `CliAuth.tsx`, `InviteLanding.tsx`, `apps/PaperclipCloudOAuthHandoff.tsx`, `apps/chat/ChatIdentityConfirm.tsx` | chưa (local_trusted auto-auth, cần authenticated mode) |
| Plugin pages | `plugins/:pluginId`; `:pluginRoutePath/*` (catch-all plugin UI) | `PluginPage.tsx` | chưa (không plugin nào trong isolated) |
| User profile | `u/:userSlug` | `UserProfile.tsx` | chưa |
| Not found | `*` board scope + `*` global scope | `NotFound.tsx` | ✓ P4 (board scope) |
| Design guide | `design-guide` | `DesignGuide.tsx` | ✓ P1 (dark status system) |
| Dev/UX-lab (DEV only) | `dev/task-chat-lab`; `tests/perf/long-thread`; `ux-lab/{bootstrap-setup,responsible-user-denial,cross-issue-collaboration}` | `TaskChatLab.tsx`, `IssueChatLongThreadPerf.tsx`, `*UxLab.tsx` | dev-only, không restyle |

## Ghi chú

- Route `company/settings/tools*` và `tools*` chỉ là redirect (PAP-10862) — không có trang riêng.
- `status-cards*` legacy redirect; `audit/*` legacy redirect trong streamlined mode.
- Plugin routes (`:pluginRoutePath/*`) là catch-all — KPI Dashboard và plugin tương lai (Agent Studio) mount ở đây. Redesign host phải đảm bảo plugin kế thừa tokens.
- File `.production.tsx` KHÔNG phải trang trùng — kiểm import graph trong App.tsx xác nhận chúng là variant được lazy-load theo flag.
