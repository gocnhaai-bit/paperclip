# Paperclip Warm Workspace — tiếp tục redesign thực chất

Ngày 2026-09-14. Source đích `/Users/dominium/Projects/paperclip`. Đây là tài liệu triển khai tiếp sau review, không phải báo cáo đã sửa code. Agent Studio có brief riêng trong dự án của nó; session UI không sửa plugin/KPI.

## Prompt khởi động cho session mới

Hãy thực hiện `/Users/dominium/Projects/paperclip/doc/plans/[GPT]-2026-09-14-warm-workspace-remediation.md`. Mục tiêu là hoàn thành redesign bố cục và hệ nhân vật của Paperclip theo concept đã chốt, tiếp nối nền token đã làm. Đọc AGENTS.md, DESIGN.md và handoff tại `docs/[GPT]-paperclip-redesign-handoff/`; ảnh tham chiếu nằm ngay trong references ở đó.

Không gọi token pass hoặc audit không vỡ là P3/P4 redesign hoàn tất. Làm lần lượt U0–U4, bắt đầu Dashboard thành một vertical slice thực rồi áp các trang còn lại. Tự sửa UI/tests và kiểm thử trong dev riêng, giữ nghiệp vụ/quyền/routes. Không sửa source Agent Studio/KPI, không deploy live hoặc vận hành agent thật. Đọc checkpoint nhưng không làm lại toàn bộ P0. Thiếu asset thì tiếp tục phần layout độc lập, ghi asset blocker, không tạo chân dung khác style để lấp chỗ.

## Baseline và nguồn bằng chứng

HEAD lúc review `bf39ccb2e`; ba commit sau `0bf841018` chủ yếu sửa `ui/src/index.css`, hai banner `Dashboard.tsx`, DESIGN và feature doc. Đổi palette/contrast hữu ích, chưa phải redesign layout bốn trang. Checkpoint `plans/260913-2016-warm-workspace-p0-p1/PROGRESS.md` ghi P3 slice/P4 audit done nhưng nhiều detail/mobile/auth còn chưa verify. Giữ lịch sử, thêm phạm vi đính chính ở đầu thay vì xóa báo cáo.

Ba file dirty có sẵn phải giữ: CompanySettingsSidebar.test.tsx, Sidebar.test.tsx, primary-sidebar-styles.ts. Kiểm diff/version lại trước sửa, không reset/stash/commit toàn tree. Giữ untracked plans/handoff. Token gate đã pass lần review; full checks chưa chạy lại. Node shell22 thấp hơn policy, dùng runtime phù hợp đã cài.

## U0 — scope và checkpoint

Đọc route coverage/import graph/feature flags liên quan. Repo có `.production.tsx` và layout modes: xác định active path trước sửa. Cập nhật checklist theo ba cột riêng: token inherited, layout redesigned, behavior/browser verified. P1 có thể complete; P3/P4 vẫn partial cho mục tiêu original handoff. Không áp quy tắc “no redesign” của simplification cũ để từ chối scope user đã duyệt; giữ token-only và nghiệp vụ.

Kiểm dev instance/port/data/process owner; không dùng dev host3122 của session plugin để thay cấu hình/tạo workload nếu đang có session đó làm. Chọn instance isolated khác hoặc phối hợp rõ. Không copy DB live. Feature doc hiện hữu cập nhật tại chỗ, tránh tạo design system thứ hai.

## U1 — Dashboard vertical slice

Tham chiếu `docs/[GPT]-paperclip-redesign-handoff/references/[GPT]-01-overview.png`. Audit information hierarchy hiện tại: header/actions/filters, KPIs, actionable work, activity. Cải thiện bố cục và grouping nhìn thấy được theo mục đích vận hành, không chỉ đổi màu/border. Giữ nguồn số liệu, query hooks, format/currency, budget/approval logic và các trạng thái thiếu dữ liệu. Không hardcode số/agents/tasks mẫu từ ảnh.

Reuse primitives đã có và tokens ở index.css. Có thể sửa component shared khi chứng minh đúng phạm vi; không tạo CardV2/ButtonV2 hoặc wrapper chỉ đổi tên. Giữ native navigation/company context. Trên desktop phải đọc được trọng tâm/CTA/việc cần xử lý; mobile không thu nhỏ desktop hoặc cuộn ngang body.

Exit: ảnh baseline/after cùng viewport/theme và dữ liệu dev tương đương; mô tả các thay đổi layout có chủ đích; keyboard/menu/filter/link hoạt động. Nếu cấu trúc cũ thực sự đáp ứng một vùng concept thì giữ và giải thích, không rewrite chỉ để nhiều dòng diff. Cần khác biệt cấu trúc ở nơi contract chưa đáp ứng.

## U2 — Agents, Tasks, Projects

Agents: card/list theo ảnh08, role/status/task/budget nếu nguồn có, avatar resolver ổn định theo companyId/agentId; unknown fallback trung tính, custom user avatar được ưu tiên. Giữ org/list tabs, create/config/pause actions và permissions đang có. Detail/run giữ tất cả tabs/logs/configuration; không bỏ tính năng để giống mockup.

Tasks: theo ảnh03; filter/view/action hierarchy rõ, row/card density hợp lý, assignee/status/priority đúng. Detail cải thiện cấu trúc đọc thread/properties/composer; giữ checkout/assignment/comments/attachments/links. Không rewrite8k dòng một lần; chia section nhỏ theo feature ownership, regression đúng actions.

Projects: theo ảnh04; mục tiêu/tiến độ/owner/tasks/workspace links rõ, progress chỉ từ dữ liệu thật. Detail/list coherent; không tính completion theo run success hoặc fixture percentages.

Asset contract: Creative Casual A2 giảm realism thành soft stylized3D, portrait và office từ cùng model/variant. Plugin session là nơi sở hữu source art/model; UI session chỉ tiêu thụ artifact manifest/version/checksum có thỏa thuận. Không gen Sofia khác rồi coi là shared. Trong lúc thiếu asset dùng fallback hiện hữu được ghi rõ, hoàn tất layout trước; asset integration vẫn pending. Không import source React/server plugin vào host. Chọn shared artifact/package hoặc vendored artifact có version và sync rõ; avatar host không hỏng khi plugin disable.

Exit: mỗi nhóm có ảnh và behavioral smoke, complete/error/empty/loading, list/detail + active flag variants. Không đánh nhóm đạt chỉ từ trang empty có màu mới.

## U3 — route families còn lại

Theo inventory hiện có: approvals/costs/queues, apps/connections/tools, skills/routines/artifacts/audit, settings/members/secrets/plugins, auth/onboarding/search/errors và experimental routes được hỗ trợ. Map mỗi nhóm tới template page header/list/detail/form/editor phù hợp. Audit và sửa chỗ không đạt hệ thống mới; không mass-convert mọi literal hoặc thay backend ngoài scope.

Giữ auth guards, connect callbacks, secret handling, dialogs, keyboard/focus, localization tiếng Việt. Đọc cả dark/light và states; status colors độc lập sage. Không hiển thị implementation IDs/art metadata trong UI thường trừ nơi người dùng cần.

Exit: route coverage ghi riêng redesign/reused-with-reason/behavior-tested/unverified; không dùng một screenshot đại diện để đánh tất cả nested routes pass. Gated/experimental chưa truy cập được ghi limitation cụ thể, không bịa dữ liệu để che lỗi.

## U4 — validation và bàn giao

Mỗi patch chạy token gate và targeted UI tests/typecheck. Browser ở1440×900,1280×800,768×1024,390×844,200%zoom; light/dark; Tab/Escape/focus/menu/drawer/reduced motion. Nếu tool cũ thiếu viewport, dùng browser capability thực có; không mặc định mobile không thể test. Auth phải thử trên authenticated dev riêng khi sẵn có, local_trusted redirect không là auth verification.

Test có giá trị: company switch, filter persists, task action giữ behavior, budget status, no cross-company details, responsive nav, portrait asset fail, token contrast. Không test hằng số bằng chính nó hoặc gọi screenshot file tồn tại là visual acceptance.

Trước final PR-ready gate theo AGENTS/DESIGN: token-gates, repo typecheck/tests/build/build-storybook phù hợp scripts thật. Không sửa unrelated baseline failure để làm xanh; ghi command/output/nguồn lỗi. Không cần chạy full suite sau mọi file. Không deploy/restart live. Report HEAD/diff, checks thực, browser screenshot paths, coverage còn thiếu và assets pending.

## Definition of done và model

Đạt khi giao diện các nhóm đã đúng hierarchy/layout mục tiêu, vẫn đủ tính năng và data states, assets thống nhất hoặc blocker được nêu đúng, browser checks có bằng chứng. Token-only/audit-only là thành quả riêng, không đủ gọi full redesign done.

Sol hoặc Terra là lựa chọn hợp lý cho đợt này vì cần giữ ngữ cảnh UI lớn và quyết định layout. Luna có thể tiếp tục nhóm nhỏ sau khi vertical slice/template đã rõ. Đây là khuyến nghị chia việc, không bảo đảm chất lượng chỉ bằng đổi model.
