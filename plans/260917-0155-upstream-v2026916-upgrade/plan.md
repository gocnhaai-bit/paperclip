---
plan: upstream-v2026916-upgrade
date: 2026-09-17
branch: claude/warm-workspace
target: v2026.916.0
strategy: merge
status: ready
brainstorm: ../reports/brainstorm-260917-0124-upstream-v2026916-upgrade.md
---

# Nâng fork lên upstream v2026.916.0

Hợp đồng (outcome / constraints / non-goals / acceptance) nằm trong
[bản brainstorm đã duyệt](../reports/brainstorm-260917-0124-upstream-v2026916-upgrade.md).
Plan này chỉ ghi các pha thực thi.

## Số liệu chốt

| Mục | Giá trị |
|---|---|
| Điểm tách chung | `0d8bbf7cf` (2026-09-10) |
| Mốc đích | tag `v2026.916.0` |
| Commit upstream phải nhận | 151 |
| Commit riêng của fork | 19 (124 file) |
| File chồng lấn phải hoà tay | 17 |
| Migration mới | 0272 → 0279 (8 bản) |

## Phát hiện thêm khi lập plan

- `server/src/services/agents.ts` có **7 dòng sửa chưa commit** (xoá back-reference
  `joinRequests.createdAgentId` khi xoá agent). Upstream **cũng thêm 72 dòng** vào
  đúng file này. Phải commit trước khi merge, nếu không sẽ mất khi git dừng merge.
- Đường sao lưu đã dùng ở Phase 7: `~/Projects/paperclip-backups/{nhãn}/` gồm
  `paperclip-db.sql.gz`, `paperclip-data.tar.gz`, `SHA256SUMS`. Dùng lại đúng bố cục này.
- Thư mục `~/.paperclip/instances/default/data/backups/` đang **rỗng** — script
  `pnpm db:backup` chưa từng chạy thành công ở đây, hoặc kết quả đã dọn. Không tin
  vào nó; tự tạo dump và kiểm chứng kích thước trước khi đi tiếp.
- Có 7 worktree agent cũ đang treo, hầu hết ở commit `86c2e0ac4` (không thuộc nhánh
  hiện tại). Không đụng tới trong đợt này; chỉ ghi nhận để không nhầm lẫn.
- Postgres nhúng đang chạy ở cổng 54339 nhưng trỏ vào
  `~/Projects/paperclip-agent-studio/.local/dev-host/db` — đó là DB của agent-studio
  dev host, **không phải** DB chính. Phải xác định đúng DB chính trước khi dump.

---

## Pha 0 — Tiền kiểm & sao lưu

**Mục tiêu:** có đường lui chắc chắn trước khi đụng bất cứ thứ gì.

1. Commit 7 dòng đang treo trong `server/src/services/agents.ts`
   → kiểm: `git status --porcelain` không còn dòng `M`.
2. Ghi lại mốc lùi: `git rev-parse HEAD` (dự kiến `1171f6def`), tạo tag cục bộ
   `pre-upgrade-v2026916`
   → kiểm: `git tag | grep pre-upgrade`.
3. Xác định DB chính đang dùng: đọc `DATABASE_URL` thực tế của instance `default`
   (không dùng cổng 54339 của agent-studio)
   → kiểm: `psql` liệt kê được bảng và đếm được số hàng `agents`.
4. Dump DB + gói thư mục dữ liệu vào
   `~/Projects/paperclip-backups/upgrade-v2026916-{YYMMDD-HHmm}/`, kèm `SHA256SUMS`
   → kiểm: `paperclip-db.sql.gz` > 100KB, `sha256sum -c SHA256SUMS` xanh.
5. Ghi số hàng của các bảng chính (agents, issues, companies, + bảng của KPI plugin)
   vào `baseline.md` trong thư mục plan
   → kiểm: file tồn tại, có số cụ thể, để đối chiếu ở Pha 5.
6. Chụp ảnh nền Storybook cho 17 file chồng lấn *trước* khi merge
   → kiểm: có thư mục ảnh nền, đếm được số file ảnh.

**Rủi ro:** nếu không xác định được DB chính, **dừng lại hỏi Sếp**, không đoán.

---

## Pha 1 — Merge & hoà 17 file

**Mục tiêu:** nhánh chứa đủ 151 commit upstream, giao diện Warm Workspace nguyên vẹn.

1. `git merge v2026.916.0` → dừng ở xung đột (dự kiến 17 file).
2. Giải theo nhóm, từ nhẹ tới nặng:
   - **`pnpm-lock.yaml`**: không sửa tay. Lấy bản upstream rồi chạy lại `pnpm install`.
   - **Nhóm nhẹ** (`primary-sidebar-styles.ts`, `BreadcrumbContext.tsx`, `DESIGN.md`,
     4 file `*.test.tsx` nhỏ): nhận cả hai phía, hợp nhất theo nghĩa.
   - **`ui/src/index.css`**: nhận 152 dòng token mới của upstream, **giữ nguyên
     toàn bộ giá trị OKLCH sage** của mình. Đây là file rủi ro cao nhất về màu.
   - **Nhóm trang** (`Dashboard.tsx`, `Agents.tsx`, `AgentDetail.tsx`,
     `AppDetail.tsx`): giữ bố cục Warm Workspace, chèn tính năng mới upstream vào.
   - **`IssueDetail.tsx`** (upstream viết lại 596 dòng): làm cuối cùng. Lấy bản
     upstream làm nền rồi áp lại 22 dòng thay đổi của mình, thay vì hoà hai chiều.
   - **`storybook/preview.tsx`**, **`search.stories.tsx`**: theo upstream, giữ
     decorator theme của mình.
3. Verify sau mỗi nhóm: `pnpm typecheck` phải xanh trước khi sang nhóm kế.

**Verify pha:**
- `git log --oneline v2026.916.0..HEAD` = 19 commit của mình + 1 commit merge
- `pnpm typecheck` xanh
- `pnpm check:token-gates` xanh
- `pnpm build` xanh

**Rủi ro:** `IssueDetail.tsx` hoà xong có thể lệch bố cục. Test xanh **không đủ** —
bắt buộc so ảnh ở Pha 4.

---

## Pha 2 — Migration DB

**Mục tiêu:** 8 migration áp sạch, dữ liệu còn nguyên.

1. Xác nhận sao lưu Pha 0 đã kiểm chứng (`sha256sum -c` xanh). Nếu chưa → dừng.
2. `pnpm db:migrate`
   → kiểm: lệnh thoát mã 0, `_journal.json` ghi tới `0279`.
3. So số hàng các bảng chính với `baseline.md` của Pha 0
   → kiểm: không bảng nào mất dữ liệu ngoài dự kiến.

**Đường lui:** khôi phục từ `paperclip-db.sql.gz`. Không có lệnh lùi từng migration.

---

## Pha 3 — Build lại & xác minh plugin

**Mục tiêu:** KPI Dashboard và Agent Studio vẫn chạy trên core mới.

1. Build lại KPI Dashboard (`~/Projects/paperclip-kpi-dashboard`) với SDK hiện hành
   → kiểm: `pnpm build` + `pnpm typecheck` xanh.
2. Nếu hỏng vì ghim `@paperclipai/plugin-sdk@2026.831.1`: nâng ghim lên bản khớp core,
   build lại. Chỉ sửa ghim phiên bản, không sửa logic plugin.
3. Build lại Agent Studio (`~/Projects/paperclip-agent-studio/agent-studio`) tương tự
   → kiểm: `pnpm build` xanh.
4. Kiểm link cài đặt còn nguyên: `~/.paperclip/plugins/package.json` vẫn trỏ file
   → kiểm: `node_modules` của thư mục đó vẫn phân giải được cả hai plugin.

**Rủi ro:** thay đổi SDK của upstream chỉ là bổ sung, nên khả năng hỏng thấp — nhưng
bản `dist/` hiện tại được biên dịch bằng SDK cũ, phải build lại mới chắc.

---

## Pha 4 — Kiểm thử trực quan

**Mục tiêu:** chứng minh giao diện không đổi, bằng ảnh chứ không bằng niềm tin.

1. Chạy bộ test UI đã có (branding + Warm Workspace)
   → kiểm: xanh.
2. Chạy Storybook visual, so với ảnh nền Pha 0
   → kiểm: khác biệt duy nhất phải giải thích được là do tính năng mới upstream
   mình cố ý nhận. Bất kỳ khác biệt bố cục/màu nào khác = lỗi hoà file, quay lại Pha 1.
3. Soi riêng `IssueDetail`, `Dashboard`, `AgentDetail`, `AppDetail`, `Agents` ở
   desktop + 390px, sáng + tối
   → kiểm: bố cục Warm Workspace còn nguyên.

---

## Pha 5 — Chạy thật & diễn tập đường lui

**Mục tiêu:** xác nhận runtime khoẻ, và đường lui thật sự lùi được.

1. Khởi động runtime, kiểm tra sức khoẻ
   → kiểm: `bootstrapStatus=ready`, tiêu đề trình duyệt kết thúc
   bằng `Paperclip for SMIT`.
2. Mở trang Plugins → cả KPI Dashboard và Agent Studio hiện diện và **tải được dữ liệu**
   → kiểm: thấy số liệu thật, không phải màn hình rỗng.
3. Diễn tập lùi: checkout tag `pre-upgrade-v2026916`, khôi phục DB từ sao lưu,
   khởi động → phải chạy được; rồi khôi phục lại trạng thái đã nâng cấp
   → kiểm: cả hai chiều đều boot thành công.
4. Cập nhật `.claude/features/paperclip-for-smit-branding.md` ghi lần nâng cấp này
   (bắt buộc theo quy ước feature docs).

---

## Điểm dừng bắt buộc (hỏi Sếp trước khi đi tiếp)

- Không xác định được DB chính ở Pha 0.
- Sao lưu không kiểm chứng được (SHA sai hoặc file quá nhỏ).
- Sau Pha 1, `IssueDetail` không thể vừa giữ bố cục vừa nhận tính năng mới.
- Plugin hỏng vì lý do khác ngoài ghim phiên bản SDK.

## Câu hỏi còn treo

- KPI Dashboard có cần nâng ghim `@paperclipai/plugin-sdk` từ `2026.831.1` lên bản
  khớp core không? Chỉ biết sau khi build ở Pha 3.
- 7 worktree agent cũ đang treo ở `86c2e0ac4` có cần dọn không? Ngoài phạm vi đợt này.
