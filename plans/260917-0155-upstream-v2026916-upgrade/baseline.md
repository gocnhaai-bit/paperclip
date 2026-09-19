# Baseline trước nâng cấp — 2026-09-17

## Mốc lùi git

- Tag: `pre-upgrade-v2026916` → `f96ac4b07a504706d1fd81206ff80652899fd2d2`
- Nhánh: `claude/warm-workspace`
- Working tree sạch (7 dòng treo trong `server/src/services/agents.ts` đã commit
  thành `f96ac4b07`).

## Sao lưu

`~/Projects/paperclip-backups/upgrade-v2026916-260917-0157/`

| File | Kích thước | Nội dung |
|---|---|---|
| `paperclip-db.tar.gz` | 6.7 MB | thư mục `db/` nguyên trạng (sao lưu nguội) |
| `paperclip-data.tar.gz` | 56 KB | `data/ companies/ secrets/ skills/ config.json` |
| `SHA256SUMS` | — | đã kiểm chứng `OK` |
| `snapshots-pre/` | 137 MB | 1822 ảnh Storybook nền |

**Sao lưu nguội, không phải `pg_dump`:** Postgres nhúng (cổng 54329) đang tắt khi
sao lưu, nên copy thư mục dữ liệu là nhất quán tuyệt đối. Khôi phục = giải nén
đè lên `~/.paperclip/instances/default/`.

## Cấu hình DB đã xác định

- Chế độ: `embedded-postgres`, PostgreSQL **18**
- Cổng: **54329** (không phải 54339 — cổng đó là dev host của agent-studio)
- Data dir: `~/.paperclip/instances/default/db`
- Upstream **không** đổi phiên bản `embedded-postgres` (giữ `^18.1.0-beta.16`),
  nên không có rủi ro nâng engine.

## Baseline trực quan

- Storybook build: thành công, **912 story** (index lưu tại `/tmp/storybook-index-pre.json`).
- Ảnh nền: **1822 ảnh** (912 story × 2 theme), **1822 passed**.
- Vị trí: `snapshots-pre/` trong thư mục sao lưu.

**Trục trặc đã xử lý:** lần chụp đầu báo exit 0 nhưng ghi 0 ảnh — nguyên nhân là
Chromium của Playwright chưa cài trên máy này; mọi test fail nhưng mã thoát bị
`tail` trong pipe che mất. Đã chạy `pnpm exec playwright install chromium` và
chụp lại, lần này kiểm chứng bằng **số ảnh thật** chứ không dựa vào mã thoát.

## ⚠️ Sao lưu đầu tiên SAI THƯ MỤC — đã sửa

Sao lưu lúc 01:57 nhắm vào `~/.paperclip/instances/default/` theo `config.json`
tìm được ở đó. Khi đếm số hàng trước migration mới lộ ra: **cụm đó rỗng hoàn
toàn** — 0 bảng, database `paperclip` đúng bằng kích thước template (7.6 MB).

Dữ liệu thật nằm ở `~/Projects/paperclip-data/instances/default/` — runtime chạy
với `PAPERCLIP_HOME` trỏ sang đó. Sếp đã xác nhận 2026-09-17.

**Nếu không đếm số hàng trước, `pnpm db:migrate` sẽ dựng bảng mới trên cụm rỗng,
báo "thành công", còn dữ liệu thật vẫn chưa migrate.** Bài học: luôn xác minh DB
có dữ liệu thật *trước* khi tin vào một bản sao lưu.

`PAPERCLIP_HOME` không thấy khai báo trong `~/.zshrc`, `~/.zprofile` hay `.env` —
chưa rõ nó được đặt ở đâu. Mọi lệnh chạm DB phải truyền biến này tường minh:
`PAPERCLIP_HOME=~/Projects/paperclip-data`.

## Sao lưu THẬT (dùng cho đường lui)

`~/Projects/paperclip-backups/upgrade-v2026916-260917-0157/`

| File | Kích thước | Nội dung |
|---|---|---|
| `REAL-paperclip-db.tar.gz` | 21 MB | `db/` của `paperclip-data` (sao lưu nguội) |
| `REAL-paperclip-data.tar.gz` | 156 MB | `data/ companies/ secrets/ skills/ projects/ locks/` |
| `REAL-SHA256SUMS` | — | đã kiểm chứng `OK` |

Postgres tắt khi sao lưu (file `postmaster.pid` là rác cũ), nên nhất quán tuyệt
đối. Khôi phục = giải nén đè lên `~/Projects/paperclip-data/instances/default/`.

Các file `paperclip-db.tar.gz` / `paperclip-data.tar.gz` (không tiền tố `REAL-`)
là bản sao lưu của cụm rỗng — giữ lại nhưng **không dùng để khôi phục**.

## Row-count nền của DB thật

| Bảng | Số hàng |
|---|---|
| companies | 1 |
| agents | 5 |
| projects | 9 |
| issues | 0 |
| issue_comments | 0 |

**Migration đã áp: 270** (khớp kỳ vọng — trước khi thêm 0272–0279).

## Phân tích xung đột đã làm trước

### `ui/src/index.css` — rủi ro thấp hơn dự kiến

Các hunk gần như không chồng nhau. Chỉ **một** điểm giao, quanh dòng 403:
khối màu icon trạng thái dark mode.

- Của mình: `--status-task-icon-in_progress/in_queue/blocked` đặt giá trị OKLCH
  riêng, đã đo đạt ngưỡng 3:1 trên nền warm dark.
- Upstream: đặt `--status-task-icon-in_progress: var(--color-blue-400)` cho nền
  dark gốc.

**Cách giải:** giữ giá trị của mình. Nền dark của mình là warm charcoal, không
phải nền dark gốc của upstream — giá trị upstream sẽ tụt dưới ngưỡng tương phản.

### `ui/src/pages/IssueDetail.tsx` — nhẹ hơn nhiều so với ước tính

Tuy upstream sửa ±596 dòng, thay đổi của mình chỉ có **4 điểm tập trung**:

1. thêm `mobilePropsReturnFocusRef`
2. bỏ điều kiện `!streamlinedTaskDetailEnabled` ở thanh nút mobile
3. lưu phần tử đang focus khi mở sheet properties
4. thêm `onOpenAutoFocus` / `onCloseAutoFocus` để trả focus về nút cũ

**Cách giải:** lấy bản upstream làm nền, áp lại 4 điểm này. Không hoà hai chiều.

### `ui/src/pages/Dashboard.tsx` — hunk chồng nhau thật

- Của mình: bọc nội dung vào các `<section>` có heading ("Work in motion",
  "Trends"), thêm `ActiveAgentsPanel`, thêm link "View activity"/"View tasks",
  đổi lưới chart sang `grid-cols-1 md:grid-cols-2 xl:grid-cols-4`.
- Upstream: lưới chart theo cờ `SHOW_TASK_PRIORITY_UI`, thêm `@container` vào
  Card, viết lại hàng danh sách task sang container query
  (`dashboard-list-row`, `--dashboard-task-list-columns`).

**Cách giải:** giữ khung `<section>` của mình; nhận `@container` + hàng danh
sách mới của upstream vào trong đó. Lưới chart: giữ bản của mình nhưng bổ sung
điều kiện `SHOW_TASK_PRIORITY_UI` của upstream.

### `ui/src/pages/Agents.tsx` — dễ

Upstream chỉ thêm 3 điểm: import `useAgentChatEnabled`, gọi hook, thêm nút Chat
vào phần `trailing`. Của mình đổi chế độ xem mặc định sang cards. Nhận cả hai.

### `ui/src/pages/AgentDetail.tsx` và `apps/AppDetail.tsx`

Hunk của upstream và của mình nằm ở các vùng khác nhau (AgentDetail: của mình ở
1510–1776, upstream ở 3796–4182). Khả năng git tự hoà được phần lớn.

## Phát hiện phụ (ngoài phạm vi, chỉ ghi nhận)

- 7 worktree agent cũ đang treo, hầu hết ở `86c2e0ac4`. Không đụng đợt này.
- `~/.paperclip/instances/default/data/backups/` rỗng — cơ chế sao lưu tự động
  theo lịch (mỗi 60 phút, giữ 30 ngày) khai báo trong config nhưng chưa từng
  sinh file. Không chặn đợt nâng cấp vì đã có sao lưu tay, nhưng đáng xem lại sau.

## Pha 3 — Plugin, đã xong 2026-09-17

Cả hai plugin build và chạy test xanh trên core mới, **không cần đụng ghim
`@paperclipai/plugin-sdk@2026.831.1`**. Đúng như phân tích: thay đổi SDK của
upstream chỉ bổ sung (`PluginEnvironmentTerminationReceipt`, `cancelActiveWork?`),
không phá vỡ API.

| Plugin | typecheck | build | test |
|---|---|---|---|
| KPI Dashboard | ✅ | ✅ | ✅ 58/58 |
| Agent Studio | ✅ | ✅ | ✅ 90/90 |

Đây là bằng chứng ở mức mã nguồn. Xác minh chúng tải được **dữ liệu thật** trong
runtime vẫn còn ở Pha 5.

## Trạng thái môi trường

`cargo` chưa cài trên máy này, nên `pnpm build` / `pnpm typecheck` ở cấp workspace
dừng tại `packages/paperclip-runner`. Yêu cầu này **đã có từ trước merge** (kiểm
bằng `git show pre-upgrade-v2026916:packages/paperclip-runner/package.json`), không
phải hệ quả của nâng cấp. Sếp quyết định bỏ qua, không cài Rust.

Thay thế: typecheck từng gói bị merge đụng tới.

| Kiểm tra | Kết quả |
|---|---|
| `@paperclipai/ui` typecheck | ✅ 0 lỗi |
| `server` `tsc --noEmit` | ✅ 0 lỗi |
| `pnpm check:token-gates` | ✅ 4/4 gate sạch |

## Pha 2 — Migration, đã xong 2026-09-17

Chạy `PAPERCLIP_HOME=~/Projects/paperclip-data pnpm db:migrate`.

- "Applying 8 pending migration(s)... Migrations complete"
- Chạy lại lần hai: "No pending migrations" — xác nhận không còn gì chờ.
- Kiểm tra an toàn migration của dự án tự chạy trước và pass.

| Mục | Trước | Sau |
|---|---|---|
| Migration đã áp | 270 | **278** (+8) |
| companies | 1 | 1 |
| agents | 5 | 5 |
| projects | 9 | 9 |
| issues | 0 | 0 |
| issue_comments | 0 | 0 |
| Tổng số bảng | — | 210 |

Bảng mới đã dựng: `adapter_auth_sessions`, `ai_connection_defaults`,
`announcement_dismissals`, `heartbeat_run_events`.

`0274_agent_chat.sql` **không** tạo bảng `chat_channels` như tên gợi ý — nó chỉ
thêm cột vào bảng có sẵn. Đã xác minh cả 7 cột: `issues.conversation_{agent_id,
user_id,state,session_generation,boundary_comment_id}` và
`issue_comments.{client_request_id,conversation_session_generation}`.

**Không mất dữ liệu.**

## Kiến trúc runtime thật — phát hiện ở Pha 5

Runtime **không** chạy trực tiếp từ mã nguồn. Nó chạy trong Docker:

- Container: `paperclip-local-paperclip-1` (compose project `paperclip-local`)
- Compose: `~/Projects/paperclip-runtime/compose.yml`
- Wrapper: `~/Projects/paperclip-runtime/paperclip-compose` — tự đặt
  `PAPERCLIP_BUILD_COMMIT` từ `git rev-parse HEAD` của checkout, nên image luôn
  ghi đúng commit đã build.
- Phục vụ `https://os.smitbox.com`, cổng `127.0.0.1:3000 -> 3100`
- `PAPERCLIP_DEPLOYMENT_MODE=authenticated`, `EXPOSURE=private`

Mount:

| Máy chủ | Trong container |
|---|---|
| `~/Projects/paperclip-data` | `/paperclip` (`PAPERCLIP_HOME`) |
| `~/Projects/paperclip-kpi-dashboard` | `/app/packages/plugins/kpi-dashboard` (chỉ đọc) |

Điều này giải thích vì sao `PAPERCLIP_HOME` không có trong `~/.zshrc`: nó được
đặt trong `compose.yml`, và `~/.paperclip` chỉ là cụm rỗng do CLI trên máy tạo ra.

**Agent Studio không được mount vào container.** Nó cài qua
`~/.paperclip/plugins/package.json` (link file tới `~/Projects/paperclip-agent-studio`),
tức thuộc môi trường CLI trên máy, không thuộc runtime Docker. Xác minh nó trong
runtime thật nằm ngoài phạm vi đợt này — mã nguồn của nó đã build và test xanh
(90/90) trên SDK mới.

Trạng thái trước khi build lại: `HTTP 200`, `bootstrapStatus=ready`,
`commit=1171f6def` (bản trước merge), `databaseBackup.status=ok`.

## Pha 5 — Runtime, đã xong 2026-09-17

Build lại image Docker và tạo lại container qua
`~/Projects/paperclip-runtime/paperclip-compose build && ... up -d`.

Build thành công, **bao gồm cả phần Rust runner** — `cargo` có sẵn trong image,
nên hạn chế thiếu Rust trên máy không ảnh hưởng tới runtime thật.

| Kiểm tra | Kết quả |
|---|---|
| `/api/health` `status` | `ok` |
| `commit` | `1584a7662` — khớp đúng HEAD |
| `bootstrapStatus` | `ready` |
| `databaseBackup.status` | `ok` |
| Log mức 50/60 (error/fatal) | **không có** |
| `plugin-loader: loadAll` | `total: 2, succeeded: 2, failed: 0` |
| KPI Dashboard | `plugin activated successfully`, worker chạy |
| LLM Wiki | kích hoạt, đăng ký 10 tool |
| Tiêu đề trình duyệt | `Paperclip for SMIT` |
| PWA manifest `name` | `Paperclip for SMIT` |
| Migration app thấy | `already applied` |

Dữ liệu sau khi runtime chạy: companies=1, agents=5, projects=9 — không đổi.

**Chưa xác minh:** KPI Dashboard hiển thị số liệu trong giao diện. `/api/plugins`
trả `Board access required`, cần phiên đăng nhập. Sếp tự kiểm phần giao diện.

## Còn lại

- **Pha 4 (so ảnh giao diện):** chưa chạy. Ảnh nền 1822 tấm đã có tại
  `snapshots-pre/`. Chạy lại bộ chụp trên bản merge rồi so là ra. Sếp chọn tự xem
  giao diện thay vì so ảnh tự động.
- **Diễn tập đường lui:** chưa chạy. Đường lui có sẵn: tag `pre-upgrade-v2026916`
  cho mã nguồn, `REAL-*.tar.gz` cho DB và dữ liệu.
