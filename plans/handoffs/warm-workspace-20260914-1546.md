# Warm Workspace — continuation contract, 2026-09-14

## Mission and current status

Tiếp tục và hoàn thành phần còn thiếu của Warm Workspace tại `/Users/dominium/Projects/paperclip`, nhánh `claude/warm-workspace`. Đây là THỰC THI kế hoạch đã duyệt, không chỉ khảo sát/lập kế hoạch. Không làm lại P0/P1 hay hỏi lại palette/layout đã chốt. Làm patch nhỏ → kiểm chứng → cập nhật checkpoint → tiếp tục. Không dừng ở việc thêm story hoặc test hẹp rồi gọi toàn bộ redesign hoàn thành.

Trạng thái: **PARTIAL, chưa nghiệm thu toàn bộ**. Đã commit/push phần thực thi đến `54ace1dca`; các route lồng, đủ hành động/quyền/trạng thái, native zoom, A2 và full gates vẫn mở. Những phần thiếu UI độc lập chưa được làm xong không được gọi là blocker môi trường.

## Scope and guardrails

- Luôn trả lời tiếng Việt, gọi người dùng “Sếp”, xưng “Em”. Nếu có quyết định thật sự cần người dùng, dùng AskUserQuestion với ưu/nhược điểm dễ hiểu.
- Giữ Inter, icon và tokens Warm Workspace. Không mass-recolor để gọi là redesign, không tạo primitive V2, không rewrite IssueDetail hàng nghìn dòng.
- Giữ API/schema/routes/permissions/default flags và nghiệp vụ. Không sửa runner/server để ép tests xanh, không cài Rust tự động.
- Không tạo agent/task/run thật, không approve/reject/save dữ liệu thật; chỉ thao tác read-only fixture/local tests. Không copy DB live, migration, deploy hoặc restart môi trường làm việc thật.
- Không sửa Agent Studio/KPI source hoặc tự tạo bộ nhân vật khác. A2 chỉ tích hợp khi có artifact được duyệt với manifest/version/checksum xác minh.
- Quyền commit/push trước đó chỉ áp dụng lần đã hoàn tất. KHÔNG commit/push mới nếu chưa có yêu cầu riêng; không merge/deploy/publish/download/update baseline bên ngoài.
- Giữ plans/handoff local/untracked, không tự đưa vào Git. Đọc feature doc trước sửa và cập nhật ngay sau mỗi phần; giữ lịch sử checkpoint, thêm bằng chứng/đính chính thay vì xóa lịch sử.

## Current state

Xác minh trực tiếp lúc capture:

- Repo root `/Users/dominium/Projects/paperclip`.
- Branch `claude/warm-workspace`.
- HEAD `54ace1dca6d42d984f27f89439a7134a9d5bc959`.
- Tracked/staged tree sạch. Untracked:
  - `doc/plans/[GPT]-2026-09-14-warm-workspace-remediation.md`
  - `docs/[GPT]-paperclip-redesign-handoff/`
  - `plans/`
- Commit đã push và remote tip được xác minh ở bước commit: `54ace1dca — fix(ui): harden warm workspace panels and add route regression previews` (36 files). Remote không được fetch lại trong lúc capture này.
- Parent `89df5e578` là commit HTTP adapter của phiên server; không thuộc UI. UI trước đó `efe4974c9`.
- Handoff/checkpoint chỉ có trên máy này, fresh clone không có. Không reset/stash/revert để ép workspace giống mô tả; kiểm tra trạng thái thực mỗi lần.
- Toolchain trước: `PATH=/opt/homebrew/bin:$PATH`, Node25.8.2, pnpm9.15.4. Shell mặc định có thể chọn Node22, cần xác minh.
- Lần kiểm cuối: Storybook6006 PID56694 cwd `paperclip/ui`;3122 PID41988 thuộc Agent Studio. Không tự restart/kill hai process này. Browser riêng đã đóng; static6106 và full-test process đã kết thúc. Không tái dùng CDP57253 hoặc CDP cũ.

## Decisions and rationale

- Kế thừa thiết kế đã duyệt; ưu tiên hierarchy vận hành: việc gì xảy ra, cần xử lý gì, hành động tiếp theo. Giữ layout hiện có nếu có lý do cụ thể và kiểm chứng; không rewrite để tạo diff.
- Actual-page/full-shell preview dùng component thật + providers/router thật và dữ liệu mẫu có nhãn. Không đồng nhất với live E2E hoặc nghiệm thu pixel.
- Task classic: desktop main scroll, mobile document scroll. Chat desktop: thread scroll riêng. Không mô tả classic thành thread-only.
- Panel sizing fix: outer aside border-box width434 trước có border1 và child434, nên right1441 tại viewport1440. Border chuyển vào frame/wrapper trong; không thêm overflow wrapper để che lỗi.
- Panel collapsed dùng inert/aria-hidden. SidePanelFrame nhận open state nhưng opacity100 để outer aside tiếp tục sở hữu fade.
- Mobile GoalDetail dùng SheetTrigger/Sheet và GoalProperties sẵn có; Radix tự restore focus. Không thêm ref/focus workaround khi browser đã chứng minh đúng.
- ApprovalDetail lỗi tải hiện alert, giữ cached content nếu refetch nền fail.
- Native hash-only links cần adapter trong Storybook MemoryRouter; production router không đổi. History test dùng MemoryRouter, chưa phải native browser back/forward.
- Scoped window.fetch không chặn browser navigation/download. Exact-route middleware local phục vụ attachment mẫu cho Storybook dev/static; không catch-all success. Dev6006 cũ có thể chưa nạp middleware mới vì config cần restart, ưu tiên static build để không động vào process người khác.

## Work performed

Đọc diff `54ace1dca` trước chỉnh tiếp; không làm lại:

1. `PropertiesPanel.tsx` + test: border-box overhang, inert/aria-hidden/open và giữ fade.
2. `GoalDetail.tsx`: mobile properties sheet, reset khi goalId đổi, handlers desktop giữ nguyên.
3. `ApprovalDetail.tsx`: loadError phân biệt missing, giữ cached detail.
4. Task stories trong `ui/storybook/stories/[GPT]-warm-workspace.stories.tsx`:
   - Bốn classic/chat × streamlined/production full shells.
   -18 comments, plan, attachment/work product typed; attachment GUID và metadata được shared schema validate.
   - Inbox provenance, comment/plan link, loading/empty/error, long content, second-task/router-history.
   - Mutations403. Default `?from=issues` tránh sessionStorage provenance lây giữa scenarios.
5. Local attachment: `scripts/storybook-warm-workspace-attachment.mjs`, `.test.mjs`, JSON sample, tích hợp `serve-storybook-static.mjs` và Storybook main.
6. Actual route previews mới: `[GPT]-warm-workspace-{goals,approvals,inbox,audit,artifacts,routines,auth,catalogs,settings}.stories.tsx`; full-shell mở rộng trong `decisions-desk.stories.tsx`, `search.stories.tsx`.
7. Durable browser tests: `tests/storybook-visual/warm-workspace-*.spec.ts`, cách chạy trong README cùng folder.

Không có secrets thật trong artifact này. Không copy raw logs vì full tests có thể in chuỗi nhạy cảm giả dùng cho test.

## Verification

Bằng chứng kế thừa, không tự nâng thành full acceptance:

- Final consolidated **381/381 browser tests PASS**,3.2 phút, một worker, fixed static Storybook (`/tmp/warm-final-381-browser.log`).
-165 focused Vitest tests ở PropertiesPanel/SidePanelFrame/Layout/GoalDetail/IssueDetail +1 Node middleware test PASS, Node25 (`/tmp/warm-final-unit-node25.log`). GoalDetail unit chỉ kiểm toggle cũ; mobile được kiểm trong browser. ApprovalDetail chưa có unit file riêng, có browser regression.
- UI typecheck/token gates/diff check/UI build/Storybook build PASS.
- Task59 checks: panel4mode×2theme×4viewport, resize/maximize/restore/persistence, mobile focus; long title/comments/filename; comment tự định vị8 cases; same-plan reopen, switch task/router history, work-product open/native download exact47bytes + checksum.
- Goals38; Approvals33; Inbox65; Audit/Costs38; Decisions27; Auth/NotFound40; Catalog24; Search9; Settings16; Library24; Onboarding8. Phải đọc assertions, không suy ra mọi nested route từ tên/đếm test.
- Một số assertions chỉ kiểm có task link/field/nội dung/no overflow. Cần nâng kiểm chứng content thật nhìn thấy, filter correctness và actions; screenshot không tự chứng nhận acceptance.

Commands local (không tải pixel baseline):

```sh
export PATH=/opt/homebrew/bin:$PATH
pnpm --filter @paperclipai/ui typecheck
pnpm check:token-gates
pnpm build-storybook
pnpm exec playwright test --config tests/storybook-visual/playwright.config.ts 'warm-workspace-.*\.spec\.ts' --workers=1 --retries=0 --max-failures=1 --reporter=list
node --test scripts/storybook-warm-workspace-attachment.test.mjs
```

Không chạy build/HMR song song browser matrix; không chạy hai suite/server cùng6106. Native browser zoom200% chưa kiểm; CSS zoom/page-scale không được gọi native zoom.

Full gates:
- `pnpm -r typecheck` FAILED ở runner Rust: cargo command not found.
- `pnpm build` FAILED cùng lý do.
- `pnpm test:run` hoàn tất chặng server sau1572s, FAILED:4 files failed/607 passed/3 skipped;9 tests failed/10513 passed/73 skipped. Không gọi đây là kết quả toàn bộ stage sau.
- Nhóm lỗi: native-codex-runner missing cargo; claude-local-execute model mặc định bị env phiên ảnh hưởng; cli-invocation-safety guidance allowlist; workspace-runtime provision fixture/config invalid/missing. Chưa baseline độc lập nên không khẳng định mọi lỗi có sẵn. Không sửa server trong UI scope.
- Logs `/tmp/warm-final-repo-{types,build,tests}.log`; xem chọn lọc, không in secrets. File /tmp có thể mất; sự tồn tại không phải PASS.

## Open risks and blockers

1. **Task:** đủ action/permission/loading/empty/error theo mode; long property values; classic/production comment-link variants; native200%; native browser-history; menu/drawer/reduced-motion kiểm đầy đủ. Component tests/geometry không chứng minh mọi hành động.
2. **A — Inbox/Approvals/Decisions/Goals/Costs-Audit:** hoàn thiện filtering, nested queues/actions, source decisions, audit runs/budgets/timeline, production states. Inbox queries chính có khả năng nuốt read errors (source scout); cần tái hiện và sửa đúng owner. Goals properties mobile đã xong, đừng làm lại.
3. **B — Apps/Skills/Routines/Artifacts:** mới entry pages. Còn connect/detail/OAuth/gateways/tools, Skill Studio/detail/discovery, routine detail/history/triggers, artifact parent stacks/pagination/media/open-download đầy đủ.
4. **C — Settings/Auth/Onboarding/Search/Error/gates:** mới Company/Profile, logged-out form, NotFound, một wizard step và Search results/error. Còn members/secrets/plugins/adapters/environments/access, callbacks/invites/claims, complete onboarding, search facets/operators/persistence, enabled experimental pages.
5. **A2 BLOCKED:** không có shared soft-stylized artifact được duyệt. Không procedural placeholder như final; không chặn layout độc lập.
6. **Release blocked:** full gates đỏ như trên. Không cài Rust tự động hoặc sửa runner/server.
7. **Preview fidelity:** nhiều scoped fixtures rơi về global fixture; type-safe chưa đủ. Routines draft từng sai owner và regex query-in-pathname; controller sửa sau phát hiện first-link test quá yếu. Dùng actual title/content và owner, không tin report delegate.
8. **Review limits/process:** một reviewer đã vi phạm read-only, build primary/kill controller staticPID230 gây ERR_CONNECTION_REFUSED; reject overlapping runs và đã rerun độc lập. Người kế tiếp chỉ giao reviewer Read-only, không Bash/build/test/server/kill. Một delegate install deps ngoài scope, không import lockfiles. Review final source có hai follow-ups đã sửa; chưa review exhaustive mọi preview mới.

## Exact next actions

**First safe step**: chạy git status/branch/HEAD/staged+unstaged diff/log tại primary; đọc checkpoint và diff54ace1dca. Bảo toàn concurrent changes. Xác minh Node/pnpm/ports, không dùng CDP cũ.

1. Đọc sources bên dưới; kế thừa plan, không lập lại P0/P1. Tách checklist token inherited / layout redesigned hoặc reused-with-reason / behavior verified / unverified.
2. Chốt Task còn mở bằng test hành vi thật và patch nhỏ. Các fix panel/focus/mobile đã commit không làm lại. Kiểm endpoint fixture trước khi kết luận lỗi app; kiểm auto-scroll không gọi scrollIntoView trong test.
3. Hoàn thiện nhómA trước, chọn missing behavior cụ thể (ưu tiên read errors Inbox và nested audit/decision states), tránh tiếp tục mở rộng chỉ bằng story smoke. Mount đúng App.tsx owner kể cả .production/redirect/gate.
4. Tiếp tục nhómB rồiC: fixture đáng tin và component thật, visual so concept, sửa hierarchy/layout nơi chưa đạt. Gated bật chỉ trong fixture, không default config/runtime. Không làm mọi disabled gate thành “đã verify feature”.
5. Mỗi patch: test hẹp → UI typecheck → token gates → diff check; build/browser khi cần. Bốn viewport1440×900,1280×800,768×1024,390×844,light/dark. Giữ source cố định; tách storage giữa cases, một case persistence riêng.
6. Cập nhật feature doc + PROGRESS + ROUTE-COVERAGE sau mỗi phần. Lịch sử phải giữ; bổ sung đính chính khi bằng chứng cũ thiếu.
7. Review đúng primary diff (không clean-worktree giả). Subagents chỉ phạm vi nhỏ/file ownership rõ; ~10–15 reads rồi kết luận/patch, không để scout hàng trăm calls. Không yêu cầu vượt guard; Git ở controller primary khi subagent worktree bị chặn.
8. Full gates trước full acceptance; phân loại kết quả thật, không ép xanh. Chỉ hỏi môi trường khi thật sự cần, vẫn làm UI độc lập. Không dừng sau một patch và nói xong hết. Nếu chưa làm xong, ghi rõ phần chưa thực hiện, không đánh tráo thành blocker.
9. Theo dõi mọi process tạo:command/PID/port/cwd; chỉ dừng process mình sở hữu. Port busy xác minh owner, không đổi port tự động để né. Không restart6006/3122 người khác.

## Source pointers

Đọc theo thứ tự:
1. `plans/260913-2016-warm-workspace-p0-p1/PROGRESS.md`
2. `plans/260913-2016-warm-workspace-p0-p1/ROUTE-COVERAGE.md`
3. `plans/reports/continuation-260914-warm-workspace-validation.md`
4. `/Users/dominium/.claude/plans/snuggly-wondering-volcano.md`
5. `doc/plans/[GPT]-2026-09-14-warm-workspace-remediation.md`
6. `AGENTS.md`, `DESIGN.md`, `.claude/features/paperclip-for-smit-branding.md`
7. `docs/[GPT]-paperclip-redesign-handoff/` và ảnh references (Tasks03, Projects04, Overview01, Agents08).
8. `ui/src/App.tsx`, owners theo coverage; `tests/storybook-visual/README.md` và tests mới.

Commit: `54ace1dca6d42d984f27f89439a7134a9d5bc959`, repository `https://github.com/gocnhaai-bit/paperclip`, branch `claude/warm-workspace`.
