# Warm Workspace — P0 (Baseline & Bản đồ) + P1 (Tokens & Shared Shell)

## Continuation status — 2026-09-14

P0/P1 remain complete as historically scoped. The approved wider continuation is **in progress**, not complete: see [PROGRESS](PROGRESS.md), [ROUTE-COVERAGE](ROUTE-COVERAGE.md), the approved `snuggly-wondering-volcano.md` plan and remediation handoff. This session fixed panel sizing/hidden focus, mobile goal properties and approval load errors; added actual-page/full-shell read-only previews and durable browser checks. UI gates pass; repository typecheck/build fail for missing cargo and full server tests finish with9 failures. AssetsA2 and comprehensive nested-route/action acceptance remain open. No commit/push/deployment authorized or performed.

Nguồn yêu cầu: `docs/[GPT]-paperclip-redesign-handoff/` (IMPLEMENTATION-PLAN đã chốt thiết kế).
Session scope do Sếp duyệt 2026-09-13: **chỉ P0 + P1**. P2–P8 (asset, trang trọng tâm, plugin Agent Studio) nằm ngoài session này; repo `paperclip-agent-studio` không đụng tới.

## Quyết định đã chốt (không hỏi lại)

- Palette khởi điểm: canvas `#FAF8F4`, surface `#FFFFFF`, sidebar `#F5F2EB`, text `#172334`, secondary `#586170`, sage `#506F5B`, selected `#E4EBDD`, border `#DADDD5` — khai báo ở token layer, điều chỉnh để đạt contrast
- Giữ nghiệp vụ/permissions/APIs/dữ liệu; giữ dark mode (semantic overrides, nền than ấm)
- Không tạo primitive V2 song song; sửa shared primitives hiện có
- Branch mới từ HEAD, bảo toàn 3 file uncommitted của session trước (không gom vào commit của mình)

## Baseline đã scout (2026-09-13)

- HEAD `0bf841018` trên `custom/brand`; uncommitted: `ui/src/components/primary-sidebar-styles.ts` (đổi surface sang token `bg-sidebar` — tương thích, P1 xây tiếp trên nó), `Sidebar.test.tsx`, `CompanySettingsSidebar.test.tsx`
- Token root: `ui/src/index.css` (Tailwind v4). SDK: `packages/plugins/sdk`
- Toolchain: repo yêu cầu Node >=24.11.0; `~/.local/bin/node` = v22 (tránh), homebrew node = v25.8.2 (dùng). pnpm chưa cài — lấy `pnpm@9.15.4` theo `packageManager` pin
- `.claude/features/paperclip-for-smit-branding.md` liên quan trực tiếp — phải đọc trước P1, cập nhật sau P1

## Phase P0 — Baseline và bản đồ

1. Tạo branch `claude/warm-workspace` từ HEAD (uncommitted changes đi theo working tree, giữ nguyên)
   - verify: `git branch --show-current` = branch mới, `git status` vẫn thấy 3 file modified
2. Toolchain: dùng homebrew node 25.8.2 + cài pnpm@9.15.4 (corepack của homebrew node hoặc `npm i -g pnpm@9.15.4`); kiểm `node_modules` hiện trạng, `pnpm install` nếu thiếu
   - verify: `pnpm --version` = 9.15.4 với homebrew node
3. Đọc tài liệu gốc: `AGENTS.md`, `DESIGN.md`, `doc/GOAL.md`, `doc/PRODUCT.md`, `doc/SPEC-implementation.md`, `doc/DEVELOPING.md`, `doc/DATABASE.md`, `.claude/features/README.md` + `paperclip-for-smit-branding.md`
4. Route inventory từ `ui/src/App.tsx` (nested, redirects, feature flags, plugin routes; chú ý file `.production.tsx` — kiểm import graph, không đoán theo tên file) → `ROUTE-COVERAGE.md`: mỗi route ghi file render thật, dữ liệu chính, actions, layout family, nhóm theo bảng 5.3 của plan gốc
   - verify: mọi route trong App.tsx có dòng tương ứng
5. Baseline checks: `pnpm check:token-gates`, typecheck phạm vi ui, test 2 file Sidebar đang modified — ghi rõ lỗi baseline (nếu có) để phân biệt với lỗi mới ở P1
6. Token/component inventory: semantic tokens trong `ui/src/index.css` (light+dark), shared primitives (button/card/sidebar/header), nơi `primarySidebarStyles` được dùng
7. Tạo artifacts trong plan dir này: `PROGRESS.md`, `ROUTE-COVERAGE.md`, `INTEGRATION-ADR.md` (ghi: dùng plans/ thay tiền tố `[GPT]` vì session do Claude thực hiện; toolchain; baseline issues)

Exit: biết file nào thật sự render, baseline xanh/đỏ thế nào, working changes nào cần bảo toàn.

## Phase P1 — Tokens và shared shell

1. `DESIGN.md`: thêm mục ghi redesign Warm Workspace được người dùng cho phép (scope + nguồn quyết định), rút ràng buộc "zero visual change" của đợt simplification cũ khỏi phạm vi redesign; giữ quy tắc token/semantics/hierarchy. Không viết lại lịch sử tài liệu
2. `ui/src/index.css`: khai báo semantic tokens warm palette cho light theme + dark overrides (than ấm, surface tách rõ, sage đạt contrast). Tính contrast ratio của các cặp text/background chính, điều chỉnh hex nếu < 4.5:1, ghi kết quả vào PROGRESS
   - verify: `pnpm check:token-gates` pass
3. Typography/spacing/radius: map scale thiết kế (heading 28–32/20–24/16–18; body 14–16; metadata >=12; spacing 4/8/12/16/24/32; radius controls 8, cards 12) vào token layer hiện có — chỉ token, không inline CSS
4. Shared shell qua primitives hiện có: sidebar (surface ấm, vùng active/selected sage `#E4EBDD`, giữ intent `bg-sidebar` opaque), header, page rhythm, focus ring cùng hệ token. Giữ company selector, contextual sidebar, account menu, breadcrumb, search, shortcuts, deep links
   - verify: typecheck + test `Sidebar.test.tsx`, `CompanySettingsSidebar.test.tsx` pass (so với baseline bước P0.5)
5. Browser check best-effort: nếu dev server chạy được isolated thì chụp 3 trang khác nhóm (vd dashboard / agents / settings) light+dark qua agent-browser; nếu không chạy được thì ghi "chưa verify browser" vào PROGRESS, không tự đánh dấu pass
6. Cập nhật `.claude/features/paperclip-for-smit-branding.md` cho khớp code mới (bắt buộc theo workflow)

Exit (theo plan gốc): 3 trang khác nhóm nhận cùng visual language, token gate pass, không route mất, light/dark có semantic overrides.

## Validation

- Mỗi bước chạy check hẹp liên quan; cuối P1: `pnpm check:token-gates` + typecheck ui + test các file sidebar
- Không chạy full `pnpm test:run`/`build`/`build-storybook` ở session này (đó là gate bàn giao hoàn chỉnh của P7); ghi rõ điều này trong PROGRESS
- Không skip test đang fail; phân biệt lỗi baseline vs lỗi mới bằng evidence bước P0.5

## Rủi ro

- `pnpm install` có thể lâu/cần network → nếu node_modules đã đủ thì bỏ qua, ghi lại
- Dev server Paperclip có thể cần backend/DB → browser check là best-effort, không block P1
- Sidebar tests đang modified bởi session trước → chạy baseline trước khi sửa để không nhận lỗi oan

## Out of scope

- P2–P8; plugin repo; gen asset nhân vật; runtime/Docker/production; sửa 3 file uncommitted của session trước (chỉ bảo toàn)
