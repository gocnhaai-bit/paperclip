# Warm Workspace P0+P1: baseline audit và semantic token redesign

Ngày: 2026-09-13. Branch: `claude/warm-workspace`. Commit: `526bcaf4b`.

## What happened

Thực thi 2 phase đầu của handoff `docs/[GPT]-paperclip-redesign-handoff/` (plan 8 phase P0–P8, session này scope P0+P1 theo duyệt của Sếp).

**P0 — Baseline:** branch mới từ HEAD `0bf841018`, bảo toàn 3 file uncommitted của session trước; toolchain homebrew Node 25.8.2 + pnpm 9.15.4 (node mặc định của máy là v22, thiếu yêu cầu >=24.11.0); route inventory 232 route lines từ `ui/src/App.tsx` (2 layout modes, 7 variant `.production.tsx`); baseline checks xanh (token-gates, ui typecheck, 44 sidebar tests). Artifacts: `plans/260913-2016-warm-workspace-p0-p1/{plan,PROGRESS,ROUTE-COVERAGE,INTEGRATION-ADR}.md`.

**P1 — Tokens & shell:** `DESIGN.md` v0.4 ghi redesign được phép (rút ràng buộc "no visual redesign" của đợt simplification); semantic tokens `ui/src/index.css` light+dark chuyển sang palette Warm Workspace (ivory `#FAF8F4` / sage `#506F5B` / navy `#172334`; dark charcoal ấm `#23211D` / sage nhạt `#9DB8A4`). Shell không cần sửa cấu trúc — đã token-driven hoàn toàn. Browser verify trên dev isolated (`--data-dir ./tmp/paperclip-dev`, `PAPERCLIP_RUNNER_BINARY=/bin/true` vì máy không có cargo): dashboard light+dark, agents, settings, design-guide status system — screenshots trong plan dir.

## Decision

- Sage `#506F5B` cùng họ hue với SMIT green cũ (~150) → redesign là "muted hóa" brand, không phải đổi hue; feature doc branding cập nhật theo (ADR-004)
- Code review (subagent) phát hiện side effect: nâng sáng surface dark làm `--destructive` rớt 4.69→3.81:1 và 2 status glyph rớt sàn 3:1. Sếp duyệt hướng **nâng lightness giữ hue** → destructive `#ff5f5a`, in_progress `#4c94ec`, blocked `#ef6661` — độc lập sage, AA khôi phục
- Typography/spacing/radius không đổi token: Tailwind defaults đã khớp scale thiết kế; ghi nhận trong DESIGN.md v0.4
- Plans dir thay tiền tố `[GPT]` cho artifacts của session Claude (ADR-001)

## Sự cố

- `ui/node_modules` biến mất giữa session (nguyên nhân ngoài session này; trên máy đang có session agent ChatGPT/Codex khác chạy ở repo `paperclip-kpi-dashboard`) → khôi phục bằng `pnpm install`
- `ak` CLI không có trên máy → journal ghi tay theo convention
- agent-browser 0.37.1 thiếu lệnh `viewport`/`media` → mobile chưa verify (ghi công khai trong PROGRESS)

## Next steps

- P2: character vertical slice (Sofia) + asset contract — cần quyết định image tool
- P3: 4 trang trọng tâm (Dashboard/Agents/Tasks/Projects) theo ROUTE-COVERAGE.md
- Nợ công khai: light `--destructive` == `--destructive-foreground` (pre-existing, đỏ trên đỏ 1:1); chart tokens xám trung tính; 6 file `bg-white` (Run 4 debt)
- Full gate (`pnpm -r typecheck`, `test:run`, `build`, `build-storybook`) dành cho P7 (ADR-006)

## Addendum 2 — P4 audit (cùng ngày, không commit)

Sếp tiếp tục ra lệnh đi tiếp. P4 theo handoff là audit các route còn lại. Kết quả: 11 nhóm route browser-audited trên dev isolated — tất cả đã render đúng warm language nhờ P1 tokens + primitives sẵn có; **không cần sửa dòng code nào**. Quyết định quan trọng: 20 file có palette banner classes là Run 4 debt đã documented trong DESIGN.md — không mass-convert trong P4 (tránh scope creep). ROUTE-COVERAGE.md cập nhật trạng thái từng row chính xác (audited/chưa + lý do), tránh overclaim — ban đầu em suýt đánh dấu ✓ hàng loạt bằng sed, đã sửa lại từng row theo evidence thật. Chưa verify: auth (logged-out), plugin pages, experimental gates không data, agent detail cần agent thật, mobile.

## Addendum — P3 slice (cùng ngày, commit `571adccd7`)

Sếp ra lệnh tiếp tục sau P0+P1. P2 gác (asset sau), làm P3 theo `phase-p3-plan.md`. Scout cho thấy 4 nhóm trang đã primitive-driven ~80% — thay đổi thực chất: unify 2 banner ad-hoc của Dashboard sang `InlineBanner` (warning/danger), xóa orphan token `--gradient-extract-1`. Verify: 140/140 page tests, token-gates, typecheck; browser có dữ liệu thật (1 task, 1 project trong isolated DB) cho tasks list/detail + projects list/detail. Nợ mới ghi nhận: Agents.production.tsx parity (raw button/viewport queries), ghost-hover trên danger banner chưa chụp, Dashboard không có test file .tsx (nhưng có Dashboard.test.ts 4 tests — reviewer tìm thấy).
