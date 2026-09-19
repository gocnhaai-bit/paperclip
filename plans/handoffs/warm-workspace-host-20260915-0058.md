# Warm Workspace host — continuation 2026-09-15

## Mission and current status

Tiếp tục THỰC THI phần còn thiếu Warm Workspace host theo kế hoạch đã duyệt. Không làm lại P0/P1 hoặc chỉ lập kế hoạch/thêm preview rồi dừng. Trạng thái vẫn PARTIAL; ưu tiên hoàn thiện workflow và kiểm chứng thật trên những route còn thiếu.

**Quyết định mới nhất của Sếp:** Agent Studio là plugin và đang được Sếp triển khai RIÊNG tại `/Users/dominium/Projects/paperclip-agent-studio/`. Session kế tiếp chỉ làm host `/Users/dominium/Projects/paperclip`. Không sửa plugin, không nhận scope office/nhân vật của Agent Studio. **Skill Studio** (`/skills/studio/*`) là editor kỹ năng native trong host, khác Agent Studio.

## Scope and guardrails

- Tiếng Việt, gọi người dùng Sếp, xưng Em. Dùng AskUserQuestion khi có quyết định thật sự cần Sếp; không hỏi lại thiết kế đã chốt.
- Giữ Inter, icon, palette/tokens Warm Workspace, API/schema/permission/default flags/routes và nghiệp vụ. Không rewrite file lớn hoặc primitive V2.
- Không tạo/chạy agent/task/routine thật, không approve/reject/save dữ liệu thật, không đọc/nhập/xuất giá trị bí mật. Chỉ fixture read-only hoặc test cô lập.
- Không DB live/copy DB/migration, Docker rebuild/deploy/restart live. Quyền commit/push cũ đã dùng cho54ace1dca, KHÔNG tự commit/push mới.
- Plans/handoff vẫn local/untracked, không stage. Không reset/stash/revert/overwrite thay đổi có sẵn.
- Đọc feature doc trước sửa, cập nhật feature doc + PROGRESS + ROUTE-COVERAGE sau mỗi phần. Giữ lịch sử, thêm đính chính thay vì xóa bằng chứng cũ.
- Không sửa `/Users/dominium/Projects/paperclip-agent-studio/`, KPI hoặc process3122. Chỉ tiêu thụ shared asset khi artifact manifest/version/checksum đã được duyệt; A2 vẫn blocked, không tạo placeholder để nghiệm thu.

## Current state

Đã probe trực tiếp lúc capture:
- Repo `/Users/dominium/Projects/paperclip`, branch `claude/warm-workspace`.
- HEAD `54ace1dca6d42d984f27f89439a7134a9d5bc959`, commit đã push trước đó. **Không phải working tree sạch nữa.**
-26 tracked modified files, tất cả continuation UI/fixtures/tests/docs; không có staged entries trong git status.
- Production dirty: `ui/src/pages/{Approvals,Artifacts,CompanyAccess,DecisionQueuePage,Inbox,LegacyInbox,SkillStudio,WhatNeedsMe}.tsx`; `ui/src/components/{AgentActionButtons,RoutineRunVariablesDialog}.tsx`; tests Inbox/AgentActionButtons.
- Preview dirty: `[GPT]-warm-workspace-{audit,catalogs,inbox,routines,settings}.stories.tsx`, `decisions-desk.stories.tsx`; browser specs approvals/audit/catalogs/decisions/inbox/settings/work-library; branding feature doc.
- Untracked: `doc/plans/[GPT]-2026-09-14-warm-workspace-remediation.md`, `docs/[GPT]-paperclip-redesign-handoff/`, `plans/`.
- Dirty patches sau54ace1dca CHƯA commit/push. Fresh clone không có chúng hoặc local plans. Tiếp tục trên máy/check-out này.
- Toolchain đã dùng: `PATH=/opt/homebrew/bin:$PATH`, Node25.8.2/pnpm9.15.4. Kiểm lại vì shell có thể chọn Node22.
- Lần kiểm cuối static6106 không có listener; browser test do Playwright quản lý đã đóng. Không dùng CDP cũ.6006 trước PID56694,3122 trước PID41988: cần xác minh trước dùng, không tự restart/kill.

## Decisions and rationale

- Token inherited không bằng layout acceptance; screenshot hay số lượng test không chứng minh mọi nested route/action.
- Giữ cached content khi background refetch fail để không mất draft/hàng cũ; hiện lỗi, không tuyên bố rỗng/thành công. Đừng áp audit trừu tượng yêu cầu unmount editor trên mọi lỗi.
- Dùng existing Sheet/Dialog primitives. Khi không có Trigger, lưu opener còn connected để trả focus; không đổi handler submit/permission.
- Preview full-shell phải để Layout thật sở hữu geometry; không wrapper overflow che lỗi. Metadata fixture typed + endpoint chính xác; catch-all fake success bị cấm.
- Native hash-only link trong Storybook MemoryRouter cần adapter riêng; history fixture không chứng minh native browser back/forward. CSS zoom/page scale không phải native zoom200%.
- Classic Task desktop dùng main scroll, mobile document; chat desktop thread riêng. Đừng mô tả sai.

## Work performed

Kế thừa commit54ace1dca và handoff cũ; **không làm lại**:
- Panel border-box1px overhang + collapsed inert/focus; mobile Goal Properties; ApprovalDetail load errors; safe local attachment navigation/download; task deep-link/long-content previews.

Dirty patches mới cần giữ:
1. Inbox/LegacyInbox: capture read errors, alert, không “Inbox zero” khi lỗi; cached rows còn; Blocked own handler giữ nguyên. Regressions ban đầu fail rồi pass, cached refresh covered.
2. WhatNeedsMe/DecisionQueuePage/Artifacts/Approvals list: failed read không kèm success-empty copy, thêm alert; cached nonempty data giữ nguyên.
3. RoutineRunVariablesDialog: capture opening focus, restore connected element on close. RunButton/PauseResumeButton: aria-label từ label/hành động cho icon-only mobile.
4. CompanyAccess: Edit/Remove capture clicked button, onCloseAutoFocus restore connected opener. Last-owner guard giữ nguyên.
5. SkillStudio: lỗi load detail hiện error message thay “Skill not found”; cached editor vẫn mount kèm alert khi refetch lỗi. Chưa có behavioral cached-draft test sâu.
6. Audit preview mở sibling Activity/Costs/Budgets/Runs/Timeline thật. Typed local succeeded/failed runs, status filter, dedicated states; Timeline chỉ global sample/control check.
7. Routine preview mở RoutineDetail/.production; typed detail, empty runs/revisions; History/back, Edit/Cancel, Run dialog/Cancel không submit.
8. Settings preview mở CompanyAccess gate/state503/403/hidden, Secrets metadata states/Retry, Experimental gate; existing Company/Profile giữ lại.
9. Catalog preview mở host SkillStudio landing/new/error; không nhầm CompanySkills wildcard với SkillStudio.

Feature doc và local checkpoints đã cập nhật. Một số đoạn lịch sử nói pending được bổ sung follow-up pass ở dưới; đọc theo thời gian, không xóa lịch sử.

## Verification

Bằng chứng theo từng source checkpoint, KHÔNG cộng thành một full-suite pass:
- Commit54ace1dca:381/381 browser,165 focused unit+1 middleware; UI gates/build pass — bằng chứng trước dirty continuation.
- Dirty lượt chiều: owning49/49 unit, routine action/dialog30/30 (sau aria names có suite15/15), changed-family browser221/221 ở build lúc đó.
- Members:9/9 unit; CompanyAccess+sidebar16/16; Members/Company/Profile31/31 gồm focus Edit/Remove, forbidden/hidden/error/loading/empty.
- Secrets states/search/Retry đưa Settings lên37/37. Chỉ metadata local, không secret values.
- SkillStudio13/13 unit, catalog29/29 browser; create/cancel cả layout desktop/mobile + initial503 distinction.
- Experimental4/4 read-only controls desktop/mobile light/dark.
- **Mới nhất Settings/Catalogs70/70 PASS**,37.8s, fixed static build/1worker (`/tmp/warm-night-settings-final.log`). Không có full381+ continuation combined run cuối.
- UI typecheck/token gates/diff check/Storybook build pass sau từng phần; latest UI build pass sau CompanyAccess/SkillStudio production patches.

Commands:
```sh
export PATH=/opt/homebrew/bin:$PATH
pnpm --filter @paperclipai/ui typecheck
pnpm check:token-gates
pnpm build-storybook
pnpm exec playwright test --config tests/storybook-visual/playwright.config.ts 'warm-workspace-.*\.spec\.ts' --workers=1 --retries=0 --max-failures=1 --reporter=list
```
Không chạy `pnpm test:storybook-visual` mặc định vì nó download external pixel baseline. Không update/publish baseline. Không build/HMR trong khi browser matrix chạy; không hai suites cùng6106/tab. Storage tách case, persistence case riêng.

Full gates kế thừa còn đỏ:
- `pnpm -r typecheck`, `pnpm build`: missing cargo tại paperclip-runner. Không cài Rust/sửa runner để ép xanh.
- Full `pnpm test:run` trước đó dừng lỗi sau server stage1572s:4 files failed,607 passed,3 skipped;9 tests failed,10513 passed,73 skipped. Missing cargo, env model-default mismatch, CLI guidance allowlist, workspace provision fixtures/config. Không baseline độc lập, không gọi chắc pre-existing; stage sau không certified. Không rerun toàn repo sau mọi patch.
- Raw `/tmp/warm-final-repo-tests.log` có synthetic sensitive-looking strings; chỉ trích tổng kết, không publish raw.

Review: scoped source reviewers xác nhận fixes; vài reviewers từng đưa nhận xét sai (cache retention/focus) đã rút sau evidence. Không coi review nhỏ là audit toàn dirty diff. Reviewer từng vi phạm read-only chạy build/kill controller server; các lượt nhiễu đã loại bỏ và rerun độc lập. Giao reviewer đúng source+diff, chỉ Read bounded, tuyệt đối không server/build/kill. Worktree clean không có nghĩa primary dirty patch không tồn tại.

## Open risks and blockers

**Việc chưa làm không tự biến thành blocker.** Scope vẫn còn:
- Task: đủ long property values, classic/production deep-link/action/state variants, menu/drawer, native200% zoom, native history, permission matrix.
- Apps: connection details, connect/OAuth, review, gateways, advanced tools/profiles. Chỉ Browse entry/search có evidence.
- Host Skill Studio: saved populated editor, files/tree, draft retention on failed refresh, fork/test/version/policy denial. New-form/error checks chưa đủ.
- Routines: populated triggers/history, production interactions, scoped audit runs/activity, config validation; no real run.
- Audit: proper date/range/server filter fidelity, pagination, routine scope and full variants. Samples không chứng minh aggregation.
- Settings: InstanceAccess, environments, PluginManager/PluginSettings, AdapterManager, remaining members invites/proposals/personal secret/provider branches; hiện mới selected routes.
- Auth: invite/claim/CLI/OAuth callbacks, complete onboarding; chưa authenticated backend E2E.
- Enabled experimental Cases/Pipelines/StatusCards/workspaces/board-chat: gate-preserving preview/state coverage chưa đủ.
- Final visual hierarchy review/light-dark/full states và review toàn actual dirty diff; tránh chỉ thêm smoke/story số lượng.
- A2 blocked: plugin đang làm riêng, host chỉ nhận artifact approved. Không sửa repo Agent Studio.
- Full release gates đỏ như trên, chưa Docker deployment.

## Exact next actions

**First safe step**: Git status/branch/HEAD/staged+unstaged diff/log; đọc PROGRESS/ROUTE-COVERAGE và diff primary. Bảo toàn26 modified files và local plans. Không reset/stash để khớp commit.

1. Tiếp tục host, không replan P0/P1. Kế thừa patch đã làm; không sửa Agent Studio tại `/Users/dominium/Projects/paperclip-agent-studio/` vì Sếp đang triển khai riêng.
2. Bắt đầu **saved Skill Studio editor**: đọc CompanySkillDetail/file/test-input contracts và actual `SkillStudio.tsx`; mở mẫu typed đã lưu, test chỉnh draft local/cancel/file nav và failed refresh giữ draft, không Create/Run/Save thật. Nếu phát hiện lỗi phải có regression trước/sau. Không chỉ thêm tên story.
3. Tiếp tục Apps detail/connect form (không external OAuth), hoặc InstanceAccess/PluginManager states theo route owner; rồi lần lượt các mục còn mở. Thứ tự dựa dependency, không mở rộng đồng thời hàng chục file.
4. Kiểm hidden/error/empty/loading và navigation/actions có ý nghĩa. Existing layout có thể giữ nếu ghi rõ lý do, không đổi màu hàng loạt gọi redesign. Giữ component/route/permissions.
5. Mỗi patch test hẹp → UI typecheck → token → diff; browser4viewports1440×900/1280×800/768×1024/390×844,light/dark, keyboard/Escape/focus, reduced-motion. Giữ source static trong matrix.
6. Update feature doc+PROGRESS+ROUTE-COVERAGE ngay mỗi phần, phân loại token/layout/behavior/unverified. Nếu review có abstract concern trái source/tests thì không tự undo quyết định đã xác minh.
7. Review actual dirty diff với quyền hợp lệ; subagent bounded, không hàng trăm reads hoặc cài deps ngoài scope. Controller sở hữu lifecycle browser/static server.
8. Trước bàn giao full, full gates đúng scope và report trung thực. Không commit/push/Docker nếu chưa yêu cầu riêng. Khi cần chuyển session lưu checkpoint mới nêu dirty files và command/log chính xác; không nói xong toàn bộ khi chưa xong.

## Source pointers

Đọc theo thứ tự:
1. `plans/260913-2016-warm-workspace-p0-p1/PROGRESS.md`
2. `plans/260913-2016-warm-workspace-p0-p1/ROUTE-COVERAGE.md`
3. `.claude/features/paperclip-for-smit-branding.md`
4. `/Users/dominium/.claude/plans/snuggly-wondering-volcano.md`
5. `doc/plans/[GPT]-2026-09-14-warm-workspace-remediation.md`
6. `AGENTS.md`, `DESIGN.md`, `docs/[GPT]-paperclip-redesign-handoff/` + references.
7. `plans/handoffs/warm-workspace-20260914-1546.md` — lịch sử tại clean54ace1dca, **Current state cũ bị handoff mới này thay thế**.
8. `plans/reports/continuation-260914-warm-workspace-validation.md` — kết quả trước dirty continuation, không phải report cuối hiện tại.
9. `ui/src/App.tsx`, `ui/src/pages/SkillStudio.tsx`, `ui/src/api/companySkills.ts`, `ui/storybook/stories/[GPT]-warm-workspace-catalogs.stories.tsx`, `tests/storybook-visual/warm-workspace-catalogs.spec.ts`.

Logs gần nhất (có thể mất, kiểm nội dung trước dùng): `/tmp/warm-night-settings-final.log`, `/tmp/warm-studio-error-{tests,browser}.log`, `/tmp/warm-members-complete-browser.log`, `/tmp/warm-secrets-retry-browser.log`, `/tmp/warm-evening-final-browser.log`, `/tmp/warm-night-ui-build.log`.
