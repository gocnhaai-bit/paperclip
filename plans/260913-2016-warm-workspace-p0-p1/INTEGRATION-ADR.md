# INTEGRATION-ADR — Warm Workspace P0/P1

Ngày: 2026-09-13. Session: Claude (kimi-k3), branch `claude/warm-workspace`.
Nguồn yêu cầu: `docs/[GPT]-paperclip-redesign-handoff/` (plan gốc dự kiến Codex/Luna thực hiện).

## ADR-001: Vị trí artifacts và tiền tố tên file

Plan gốc quy định tài liệu mới dùng tiền tố `[GPT]`. Session này do Claude thực hiện và
convention của workspace là plans → `plans/`, docs → `docs/`.

**Quyết định:** artifacts P0–P1 (plan, PROGRESS, ROUTE-COVERAGE, ADR này) nằm trong
`plans/260913-2016-warm-workspace-p0-p1/`, không dùng tiền tố `[GPT]`. Handoff gốc giữ
nguyên tại `docs/[GPT]-paperclip-redesign-handoff/`.

## ADR-002: Toolchain

Repo yêu cầu Node >=24.11.0 (ui engine). Máy có `~/.local/bin/node` v22.22.3 (không đạt)
và homebrew node v25.8.2 (đạt). pnpm chưa cài sẵn.

**Quyết định:** dùng homebrew node 25.8.2 + `pnpm@9.15.4` (cài global qua npm, đúng
`packageManager` pin). Mọi lệnh pnpm trong session chạy với `PATH=/opt/homebrew/bin:$PATH`.

## ADR-003: Baseline trước khi sửa (P0.5)

| Check | Kết quả |
|---|---|
| `pnpm check:token-gates` | PASS |
| `pnpm --filter @paperclipai/ui typecheck` | PASS |
| vitest `Sidebar.test.tsx` + `CompanySettingsSidebar.test.tsx` (2 file đang có uncommitted changes) | PASS |

**Quyết định:** mọi fail xuất hiện sau P1 được coi là lỗi mới do session này, không phải
baseline — trừ khi evidence chứng minh ngược lại.

## ADR-004: Quan hệ palette Warm Workspace với branding "Paperclip for SMIT"

Feature `.claude/features/paperclip-for-smit-branding.md` (Sếp duyệt 2026-09-10) đặt
SMIT green cho primary/focus/active selection. Plan Warm Workspace (Sếp chốt 2026-09-13,
mới hơn) đặt sage `#506F5B` cho cùng vai trò.

Bằng chứng token @ HEAD:
- Light `--primary`: `oklch(0.5117 0.129 148.93)` — xanh lá bão hòa vừa (SMIT green)
- Sage `#506F5B`: cùng vùng hue (~145–150) nhưng chroma thấp hơn nhiều → **cùng họ màu,
  Warm Workspace là bản muted/ấm của brand green**, không phải đổi hue.
- `--sidebar-accent` light đã là pale green `oklch(0.9499 0.0215 154.12)` — cấu trúc
  selected surface của branding trùng với ý đồ plan (`selected #E4EBDD`).

**Quyết định:** P1 cập nhật giá trị token theo palette Warm Workspace (kèm kiểm contrast)
và **cập nhật feature file branding** để ghi palette mới thay thế giá trị SMIT green cũ
(rule bắt buộc: feature file phải khớp code). Contract khác của branding (tên hiển thị
"Paperclip for SMIT", mark geometry, status colors độc lập, giữ layout/routes) không đổi.

## ADR-005: Bảo toàn uncommitted changes của session trước

3 file modified trước session này: `primary-sidebar-styles.ts` (đổi surface sang
`bg-sidebar` opaque cho mobile drawer), `Sidebar.test.tsx`, `CompanySettingsSidebar.test.tsx`
(2 file test cập nhật theo đổi surface).

**Quyết định:** giữ nguyên trong working tree; P1 xây tiếp trên intent đó (`bg-sidebar`
là semantic token — palette mới chỉ đổi giá trị token, không đổi class). Khi commit, stage
chọn lọc theo hunk; không gom thay đổi của session trước vào commit của session này.
Ghi chú: nếu P1 sửa cùng hunk với thay đổi chưa commit, báo Sếp trước khi commit.

## ADR-006: Phạm vi validation session P0+P1

Plan gốc yêu cầu full gate (`typecheck -r`, `test:run`, `build`, `build-storybook`) ở
bàn giao hoàn chỉnh (P7). Session này chỉ P0+P1.

**Quyết định:** check hẹp theo vùng sửa: token-gates + ui typecheck + test các file
sidebar/shell liên quan. Full gate ghi là việc của P7, không claim "xong toàn bộ" ở P1.

## ADR-007: Browser check

Dev isolated: `pnpm dev --data-dir ./tmp/paperclip-dev` (PGlite embedded, không đụng data
thật; AGENTS.md xác nhận data thật ở `paperclip-data` không dùng cho test).

**Quyết định:** P1 browser check là best-effort qua dev isolated + agent-browser; trước
khi start kiểm tra port 3100 đã có process nào không (tránh duplicate dev server). Nếu
không start được thì ghi "chưa verify browser" vào PROGRESS, không tự đánh dấu pass.
