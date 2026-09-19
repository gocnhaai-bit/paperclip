---
type: brainstorm
date: 2026-09-17
branch: claude/warm-workspace
status: accepted
---

# Nâng cấp fork lên upstream v2026.916.0

## Tóm tắt

Fork `gocnhaai-bit/paperclip` đang ở sau upstream 151 commit tính tới tag ổn định
`v2026.916.0`. Fork có 19 commit riêng (124 file). Chỉ 17 file chồng lấn — toàn bộ
là lớp UI Warm Workspace + branding. Hai plugin ngoài (KPI Dashboard, Agent Studio)
nằm ngoài repo và nối vào qua link file, nên nâng core không đụng mã nguồn của chúng.

Quyết định đã chốt với Sếp: **merge một lần lên tag `v2026.916.0`**, hoà thủ công
17 file để **giữ giao diện Warm Workspace đồng thời nhận tính năng mới của upstream**.

## Outcome

- Nhánh `claude/warm-workspace` chứa đủ 151 commit upstream tới `v2026.916.0`.
- Giao diện Warm Workspace + branding "Paperclip for SMIT" không đổi về mặt thị giác.
- KPI Dashboard và Agent Studio vẫn cài, vẫn chạy, vẫn thấy dữ liệu sau nâng cấp.
- 8 migration DB (0272–0279) đã áp, có sao lưu trước và đường lui đã diễn tập.

## Constraints

- **Chiến lược git:** merge `v2026.916.0` vào `claude/warm-workspace` (một lần giải
  xung đột), không rebase.
- **Mốc nâng:** tag ổn định `v2026.916.0`, không lấy đỉnh `master`.
- **Nguyên tắc hoà file:** giữ bố cục/token của mình, nhận thêm tính năng upstream.
  Không bỏ thay đổi upstream, không vứt bố cục của mình.
- **Hợp đồng branding** trong `.claude/features/paperclip-for-smit-branding.md` là
  ràng buộc: tên hiển thị, hình dấu kẹp giấy, sage chỉ dùng cho primary/focus/active/
  brand mark, màu trạng thái độc lập với sage, `ui/src/index.css` là nguồn token
  toàn cục duy nhất, điều hướng KPI do plugin sở hữu (không thêm route lõi).
- **DB:** bắt buộc sao lưu (`pnpm db:backup`) trước khi chạy migration.
- **Plugin SDK:** KPI ghim `@paperclipai/plugin-sdk@2026.831.1`; phải build lại và
  xác minh sau nâng cấp. Thay đổi SDK của upstream chỉ là bổ sung
  (`PluginEnvironmentTerminationReceipt` + `cancelActiveWork?`), không phá vỡ API.

## Non-goals

- Không nâng lên đỉnh `master` (9 commit sau tag) trong đợt này.
- Không đổi thiết kế Warm Workspace, không thêm tính năng UI mới.
- Không sửa mã nguồn KPI Dashboard hay Agent Studio, trừ khi build hỏng vì SDK.
- Không hoàn thành phần việc Warm Workspace còn dang dở (A2 asset, OAuth trực tiếp,
  kiểm thử backend đã xác thực).
- Không đụng nhánh `custom/brand` hay `master` ngoài việc tua nhanh (fast-forward).

## Acceptance criteria

1. `git log --oneline v2026.916.0..HEAD` chỉ còn 19 commit của mình (+1 commit merge).
2. `pnpm typecheck` và `pnpm build` xanh.
3. `pnpm check:token-gates` xanh; không có giá trị màu cứng mới ngoài `index.css`.
4. Bộ test UI đã có (bao gồm branding + Warm Workspace) xanh.
5. Ảnh chụp Storybook của 17 file chồng lấn khớp bản trước nâng cấp về bố cục/màu,
   khác biệt chỉ đến từ tính năng mới upstream cố ý nhận vào.
6. 8 migration chạy sạch trên bản khôi phục từ sao lưu.
7. Sau khi khởi động lại: tiêu đề trình duyệt kết thúc bằng "Paperclip for SMIT";
   KPI Dashboard và Agent Studio hiện trong trang Plugins và tải được dữ liệu.
8. Diễn tập đường lui: khôi phục nhánh trước merge + DB từ sao lưu thành công.

## Bằng chứng đã khảo sát

| Mục | Giá trị |
|---|---|
| Điểm tách chung | `0d8bbf7cf` (2026-09-10) |
| Commit upstream tới tag | 151 |
| Commit riêng của fork | 19 (124 file) |
| File chồng lấn | 17 |
| Migration mới | 0272 → 0279 (8 bản) |
| Thay đổi plugin SDK | chỉ bổ sung, không phá vỡ |
| Vị trí plugin | ngoài repo, link qua `~/.paperclip/plugins/package.json` |

### 17 file chồng lấn, xếp theo công sức hoà

**Nặng (upstream viết lại nhiều):**
- `ui/src/pages/IssueDetail.tsx` — upstream ±596 dòng, của mình ±22 dòng
- `ui/src/index.css` — upstream ±152, của mình ±130 (toàn bộ token sage nằm đây)
- `ui/src/pages/AgentDetail.tsx` — upstream ±88, của mình ±127
- `ui/src/pages/Dashboard.tsx` — upstream ±47, của mình ±120

**Trung bình:**
- `ui/src/pages/apps/AppDetail.tsx`, `ui/src/pages/Agents.tsx`,
  `ui/storybook/.storybook/preview.tsx`, `ui/storybook/stories/search.stories.tsx`

**Nhẹ (test/tài liệu/khoá gói):**
- `IssueDetail.test.tsx`, `AppDetail.test.tsx`, `Agents.test.tsx`,
  `Sidebar.test.tsx`, `CompanySettingsSidebar.test.tsx`,
  `primary-sidebar-styles.ts`, `BreadcrumbContext.tsx`, `DESIGN.md`,
  `pnpm-lock.yaml` (giải bằng cách chạy lại `pnpm install`, không sửa tay)

## Tiền lệ

Phase 7 (ghi trong `.claude/features/paperclip-for-smit-branding.md`) đã rebase 23
commit, áp 17 migration từ sao lưu đã kiểm chứng, và diễn tập đường lui thành công.
Đợt này quy mô ~6.5 lần lớn hơn nhưng dùng đúng quy trình đó, đổi rebase thành merge.

## Rủi ro chưa giải

- `IssueDetail.tsx` bị viết lại sâu — hoà xong có thể vẫn lệch bố cục so với bản
  Warm Workspace. Cần so ảnh chụp, không chỉ dựa vào test xanh.
- 8 migration chạy trên DB thật chỉ lùi được bằng khôi phục sao lưu, không có
  lệnh lùi từng bước. Sao lưu là bắt buộc, không bỏ qua.
- KPI ghim SDK `2026.831.1` trong khi core đã sang `2026.916.0`. Chưa rõ có phải
  nâng ghim đó không — phải build thử mới biết.
- Bản build hiện tại của 2 plugin (`dist/`) được biên dịch với SDK cũ; chưa xác
  minh có cần build lại hay không.

## Bàn giao

Chuyển sang `ak:plan` với hợp đồng này. Các pha đề xuất:
sao lưu & tiền kiểm → merge & hoà 17 file → migration → build lại & xác minh plugin →
kiểm thử trực quan → diễn tập đường lui.
